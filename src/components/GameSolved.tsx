import { Context, Devvit, useAsync } from "@devvit/public-api";

import Settings from "../settings.json" assert { type: "json" };
import { Game } from "../classes/Game.js";
import { ScoreboardUser } from "../utils/types.js";

interface GameSolvedProps {
  score: number;
  username: string | null;
  rank: number;
}

const GameSolved = (props: GameSolvedProps, context: Context): JSX.Element => {
  const game = new Game(context);

  // fetching informations from redis
  const { data, loading } = useAsync<{
    leaderboard: ScoreboardUser[];
    user: {
      rank: number;
      score: number;
    };
  }>(async () => {
    try {
      return {
        leaderboard: await game.getScores(),
        user: await game.getUserScore(props.username),
      };
    } catch (err) {
      return {
        leaderboard: [],
        user: {
          rank: -1,
          score: 0,
        },
      };
    }
  });

  return (
    <vstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor={Settings.theme.secondary}
    >
      <text color="white">GAME OVER</text>
      <text color="white">
        {props.username ?? "You"} gained {props.score}
      </text>
      <text color="white">
        Rank:{" "}
        {data?.leaderboard.length ? data.leaderboard.length - props.rank : "0"}
      </text>
    </vstack>
  );
};

export default GameSolved;
