import { Context, Devvit } from "@devvit/public-api";

import { OptionButton } from "../components/OptionButton.js";

const options = [
  { label: "Walkies time!" },
  { label: "How to play" },
  { label: "My paths" },
  { label: "Leaderboard" },
];

const MenuPage = (): JSX.Element => {
  return (
    <vstack alignment="center middle">
      <spacer size="medium" />
      <text weight="bold" size="xxlarge">
        Clean Steps
      </text>
      <spacer size="medium" />
      <text>I know you're a reliable dog owner... or maybe not! 🐶🤔</text>
      <spacer size="medium" />
      {options.map((op, index) => (
        <vstack>
          <OptionButton key={`_${index}_`} label={op.label} />
          <spacer size="small" />
        </vstack>
      ))}
    </vstack>
  );
};

export default MenuPage;
