// Learn more at developers.reddit.com/docs
import { Context, Devvit, useState } from "@devvit/public-api";

import "./CreatePost.js";
import {
  PostType,
  PoopedPostData,
  NotPoopedPostData,
  UserData,
} from "./utils/types.js";
import type { PostId, SolvedPostData } from "./utils/types.js";
import WalkingTheDog from "./pages/WalkingTheDog.js";
import LeaderboardPage from "./pages/LeaderboardPage.js";
import GuessingSteps from "./pages/GuessingSteps.js";
import { Game } from "./classes/Game.js";
import GameSolved from "./components/GameSolved.js";

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

const options = [
  { value: "walking", label: "Walkies time!" },
  { value: "board", label: "Leaderboard" },
];

const CleanSteps: Devvit.CustomPostComponent = (
  context: Context
): JSX.Element => {
  const game = new Game(context);

  const getUsername = async () => {
    if (!context.userId) return null; // Return early if no userId
    const cacheKey = "cache:userId-username";
    const cache = await context.redis.hGet(cacheKey, context.userId);
    if (cache) {
      return cache;
    } else {
      const user = await context.reddit.getUserById(context.userId);
      if (user) {
        await context.redis.hSet(cacheKey, {
          [context.userId]: user.username,
        });
        return user.username;
      }
    }
    return null;
  };

  function getPostData(
    postType: PostType,
    postId: PostId
  ): Promise<PoopedPostData | NotPoopedPostData | SolvedPostData> {
    switch (postType) {
      case PostType.POOPED:
        return game.getPoopedPost(postId);
      case PostType.SOLVED:
        return game.getSolvedPost(postId);
      case PostType.NOTPOOPED:
      default:
        return game.getNotPoopedPost(postId);
    }
  }

  const myPostId = context.postId as PostId;
  const [currentStep, setCurrentStep] = useState<string>("home"); // "home" "walking"

  const [data] = useState<{
    username: string | null;
    postType: PostType;
    postData: PoopedPostData | NotPoopedPostData | SolvedPostData;
    isAuthor: boolean;
    userData: UserData | null;
  }>(async () => {
    const [username, postType] = await Promise.all([
      getUsername(),
      game.getPostType(myPostId),
    ]);

    const [postData, userData] = await Promise.all([
      getPostData(postType, myPostId),
      game.getUser(username),
    ]);

    let isAuthor = false;

    if (postType === "notPooped" && !postData.authorUsername && username) {
      // in this case the post has just been created
      isAuthor = true;
    } else {
      isAuthor = username === postData.authorUsername;
    }

    return {
      username,
      postType,
      postData,
      isAuthor,
      userData,
    };
  });

  setCurrentStep(() => {
    if (data.postType === "pooped") {
      return "guessing";
    } else if (data.postType === "solved") {
      return "solved";
    } else if (data.postType === "notPooped" && currentStep != "home") {
      return currentStep;
    }
    return "home";
  });

  const goToSelectedPage = (page: string) => {
    setCurrentStep(() => page);
  };

  const steps: Record<string, JSX.Element> = {
    home: (
      <vstack alignment="center top" width="100%" height="100%">
        <spacer size="medium" />
        <text weight="bold" size="xxlarge">
          Clean Steps
        </text>
        <spacer size="medium" />
        <text weight="bold" size="xlarge">
          I know you're a reliable dog owner... or maybe not! 🐶🤔
        </text>
        <spacer size="medium" />
        <spacer size="medium" />
        {options.map((op, index) => (
          <vstack>
            <button
              key={`_${index}_`}
              onPress={() => goToSelectedPage(op.value)}
            >
              {op.label}
            </button>
            <spacer size="small" />
          </vstack>
        ))}
      </vstack>
    ),
    walking: (
      <vstack alignment="center top" width="100%" height="100%">
        <spacer size="small" />
        <hstack>
          <WalkingTheDog
            username={data.username}
            onSave={() => setCurrentStep("guessing")}
          />
          <spacer size="large" />
          <button
            icon="back-outline"
            onPress={() => goToSelectedPage("home")}
          />
        </hstack>
      </vstack>
    ),
    board: (
      <vstack alignment="center top" width="100%" height="100%" grow>
        <spacer size="medium" />
        <hstack>
          <text size="xxlarge" weight="bold">
            LEADERBOARD
          </text>
          <spacer size="large" />
          <button
            icon="back-outline"
            onPress={() => goToSelectedPage("home")}
          />
        </hstack>

        <spacer size="medium" />
        <LeaderboardPage username={data.username ?? "default_username"} />
      </vstack>
    ),
    guessing: (
      <vstack alignment="center top" width="100%" height="100%">
        {data.isAuthor ? (
          <hstack alignment="center middle" grow>
            <text size="xxlarge" weight="bold" wrap>
              Someone is trying not to be angry with you.
            </text>
          </hstack>
        ) : (
          <vstack>
            <spacer size="large" />
            <GuessingSteps
              postId={myPostId}
              postData={data.postData as PoopedPostData}
              username={data.username ?? "default_username"}
            />
          </vstack>
        )}
      </vstack>
    ),
    solved: (
      <GameSolved
        username={data.userData?.username ?? "You"}
        score={data.userData?.score ?? 0}
        rank={data.userData?.rank ?? -1}
      />
    ),
  };

  return (
    <zstack width="100%" height="100%" alignment="start top">
      <image
        url="background.png"
        imageHeight={320}
        imageWidth={720}
        resizeMode="fill"
        width="100%"
        height="100%"
      />
      {steps[currentStep] || <text>Error: step not found</text>}
    </zstack>
  );
};

// Add a post type definition
Devvit.addCustomPostType({
  name: "Clean Steps game",
  description: "Try not to step on the poo...",
  height: "regular",
  render: CleanSteps,
});

export default Devvit;
