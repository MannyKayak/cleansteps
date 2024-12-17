import { Devvit } from "@devvit/public-api";

interface OptionButtonProps {
  onPress?: () => void | Promise<void>;
  label: string;
  key: string;
}

// Component of for a button that will show the name of the option and send to the addressed page
export const OptionButton = (props: OptionButtonProps) => {
  // for now, I use a normal button but in the future will be a custom button
  return (
    <zstack cornerRadius="small">
      <button width="150px" onPress={props.onPress} appearance="media">
        {props.label}
      </button>
    </zstack>
  );
};
