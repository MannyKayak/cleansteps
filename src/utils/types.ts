export type UserData = {
  username: string;
  score: number; // how many steps clean the user did
  rank: number; //
};

export type PostId = `t3_${string}`;

export enum PostType {
  POOPED = "pooped",
  NOTPOOPED = "notPooped",
  SOLVED = "solved",
}

export type SolvedPostData = {
  authorUsername: string;
  postId: PostId;
  postType: string;
};

export type PoopedPostData = {
  authorUsername: string;
  date: number;
  postId: PostId;
  path: number[];
  //   tries: number;
  postType: string;
};

export type NotPoopedPostData = {
  username: string;
  postId: PostId;
  authorUsername: string | null;
};

export type ScoreboardUser = {
  member: string;
  score: number;
  description?: string;
};
export type ZRangeOptions = {
  /**
   * Reverses the sorted set, with index 0 as the element with the highest
   * score.
   */
  reverse?: boolean;
  by: "score" | "lex" | "rank";
};
