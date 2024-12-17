import { RedditAPIClient, RedisClient } from "@devvit/public-api";

import {
  PostId,
  PoopedPostData,
  PostType,
  UserData,
  NotPoopedPostData,
  ScoreboardUser,
  ZRangeOptions,
  SolvedPostData,
} from "../utils/types.js";
import Settings from "../settings.json" assert { type: "json" };

// class to fetch and store the data from all type of posts
export class Game {
  readonly redis: RedisClient;
  readonly reddit?: RedditAPIClient;

  constructor(context: { redis: RedisClient; reddit?: RedditAPIClient }) {
    this.redis = context.redis;
    this.reddit = context.reddit;
  }

  readonly tags = {
    scores: "default_scores",
  };

  readonly keys = {
    postDataKey: (postId: PostId) => `post_data:${postId}`,
    userDataKey: (username: string) => `user_data:${username}`,
    postTried: (postId: PostId) => `post_tied:${postId}`,
    scores: `scores:${this.tags.scores}`,
  };

  async getPostType(postId: PostId) {
    const key = this.keys.postDataKey(postId);
    const postType = await this.redis.hGet(key, "postType");
    const defaultPostType = "notPooped";
    return (postType ?? defaultPostType) as PostType;
  }

  async getPoopedPost(postId: PostId): Promise<PoopedPostData> {
    // get information about post where the dog has already pooped
    // fetch informations from redis i'm sure they exist because of the post type
    const postData = await this.redis.hGetAll(this.keys.postDataKey(postId));

    return {
      postId: postId,
      authorUsername: postData.authorUsername,
      path: JSON.parse(postData.data),
      date: parseInt(postData.date),
      // tries: , // this number doesn't comes from the redis postData but from the postSolved which is not created yet
      postType: postData.postType,
    };
  }

  async getNotPoopedPost(postId: PostId): Promise<NotPoopedPostData> {
    // get information about post where the dog has not pooped yet
    const user = await this.reddit?.getCurrentUser();
    return {
      postId: postId,
      username: user?.username ?? "default_username",
      authorUsername: null,
    };
  }

  async getUser(username: string | null): Promise<UserData | null> {
    if (!username) return null;
    const user = await this.getUserScore(username);

    const parsedData: UserData = {
      username: username,
      score: user.score,
      rank: user.rank,
    };
    return parsedData;
  }

  async incrementUserScore(username: string, points: number): Promise<void> {
    const key = this.keys.scores;
    // if user has no presence in redis create his hash
    try {
      await this.redis.zIncrBy(key, username, points);
    } catch (err) {
      // create a new hash for the user
      await this.redis.zAdd(key, { member: username, score: 0 });
      await this.redis.zIncrBy(key, username, points);
    }
  }

  // store data on redis
  async submitWalking(data: {
    postId: PostId;
    data: number[];
    authorUsername: string;
  }): Promise<void> {
    // create a key
    const key = this.keys.postDataKey(data.postId);
    await Promise.all([
      this.redis.hSet(key, {
        postId: data.postId,
        data: JSON.stringify(data.data),
        authorUsername: data.authorUsername,
        postType: "pooped",
        date: Date.now().toString(),
      }),
      this.incrementUserScore(
        data.authorUsername,
        Settings.authorRewardForSubmit
      ),
    ]);
  }

  async getScores(maxLength: number = 10): Promise<ScoreboardUser[]> {
    const options: ZRangeOptions = { reverse: true, by: "rank" };
    return await this.redis.zRange(this.keys.scores, 0, maxLength - 1, options);
  }

  async getUserScore(username: string | null): Promise<{
    rank: number;
    score: number;
  }> {
    const defaultValue = { rank: -1, score: 0 };
    if (!username) return defaultValue;
    try {
      const [rank, score] = await Promise.all([
        this.redis.zRank(this.keys.scores, username),
        // TODO: Remove .zScore when .zRank supports the WITHSCORE option
        this.redis.zScore(this.keys.scores, username),
      ]);
      return {
        rank: rank === undefined ? -1 : rank,
        score: score === undefined ? 0 : score,
      };
    } catch (error) {
      if (error) {
        console.error("Error fetching user score board entry", error);
      }
      return defaultValue;
    }
  }

  async getSolvedPost(postId: PostId): Promise<SolvedPostData> {
    const key = this.keys.postDataKey(postId);
    const postType = await this.redis.hGet(key, "postType");
    const author = await this.redis.hGet(key, "authorUsername");
    return {
      postId: postId,
      postType: postType ?? "solved",
      authorUsername: author ?? "default_author",
    };
  }

  async saveSolvedPost(postId: PostId) {
    const key = this.keys.postDataKey(postId);
    await this.redis.hSet(key, { postType: "solved" });
  }
}
