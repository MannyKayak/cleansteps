import { Devvit } from "@devvit/public-api";

import Settings from "../settings.json" assert { type: "json" };

interface GameOverProps {
  cleanSteps: number;
  poops: number;
  points: number;
  totPoints: number;
  rank: number;
}

const GameOver = (props: GameOverProps): JSX.Element => {
  return (
    <vstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor={Settings.theme.secondary}
    >
      <text color="white">GAME OVER</text>
      <text color="white">Clean Steps: {props.cleanSteps}</text>
      <text color="white">Poop Stepped: {props.poops}</text>
      <text color="white">Gained Points: {props.points}</text>
      <text color="white">Your total Points: {props.totPoints}</text>
      <text color="white">Rank: {props.rank}</text>
    </vstack>
  );
};

export default GameOver;
