import { Context, Devvit, useAsync } from "@devvit/public-api";

import { Game } from "../classes/Game.js";
import Settings from "../settings.json" assert { type: "json" };
import { ScoreboardUser } from "../utils/types.js";

interface LeaderboardProps {
  username: string;
}

const LeaderboardPage = (
  props: LeaderboardProps,
  context: Context
): JSX.Element => {
  const game = new Game(context);

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

  if (loading || data === null) {
    return (
      <zstack>
        <vstack grow alignment="center middle">
          <text color={Settings.theme.secondary}>Loading ...</text>
          <spacer size="medium" />
        </vstack>
      </zstack>
    );
  }

  const rankedUsers = data.leaderboard.map((row, index) => {
    return (
      <hstack key={index.toString()} grow>
        <text size="xxlarge" weight="bold" color="white">
          {index + 1}.
        </text>
        <spacer size="large" />
        <text size="large" color="white">
          {row.member}
        </text>
        <spacer size="large" />
        <text size="xlarge" weight="bold" color="white">
          {row.score}
        </text>
        <spacer size="large" />
      </hstack>
    );
  });

  return (
    <zstack width="100%" height="100%" alignment="center top">
      <vstack
        grow
        width="100%"
        alignment="center top"
        backgroundColor={Settings.theme.secondary}
        padding="medium"
      >
        {rankedUsers}
      </vstack>
    </zstack>
  );
};

export default LeaderboardPage;
