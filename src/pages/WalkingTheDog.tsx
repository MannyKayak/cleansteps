import { Context, Devvit, useState } from "@devvit/public-api";

import Settings from "../settings.json" assert { type: "json" };
import { blankCanvas } from "../utils/utils.js";
import { splitArray } from "../utils/utils.js";
import { Game } from "../classes/Game.js";
import { PostType, PostId } from "../utils/types.js";
import GameDescription from "../components/GameDescription.js";

interface WalkingTheDogPostProps {
  username: string | null;
  onSave: () => void;
}

const WalkingTheDog = (
  props: WalkingTheDogPostProps,
  context: Context
): JSX.Element => {
  const { postId, ui } = context;
  const game = new Game(context);
  const [activePoo, setActivePoo] = useState(Settings.defaultPooSelectedIndex); // index of the active poo
  const [poops, setPoops] = useState(Settings.defaultPoops);
  const myPostId = postId ?? "default_postId";
  const [data, setData] = useState<number[]>(blankCanvas); // initial state of the canvas

  // funtion to verify if the selected point has already the same color of the active one
  function alreadyPoopedHere(index: number, color: number): boolean {
    return data[index] === color;
  }

  // function to update the canvas
  function updateCanvas(index: number, color: number): void {
    if (alreadyPoopedHere(index, color)) {
      if (color === 1) ui.showToast("Already Pooped Here!");
      else if (color === 0)
        ui.showToast("Don't be silly! Clean only where your dog pooped!");
    }
    if (color === 1 && poops > 0 && !alreadyPoopedHere(index, color)) {
      setPoops((prev) => --prev);
      const newData = [...data]; // copy the old canvas data
      newData[index] = color;
      setData(newData); // update the state with the new data
    } else if (
      color === 0 &&
      poops < Settings.defaultPoops &&
      !alreadyPoopedHere(index, color)
    ) {
      setPoops((prev) => ++prev);
      const newData = data; // copy the old canvas data
      newData[index] = color;
      setData(newData); // update the state with the new data}
    }
    return;
  }

  // This is the user color map, he can set a poo point or "delete" it
  const PooSelector = (): JSX.Element => (
    <hstack width="100%" alignment="center">
      <hstack
        grow={false}
        border="thick"
        cornerRadius="small"
        backgroundColor="white"
      >
        {Settings.poopOrTransparencyArray.map((color, index) => (
          <zstack
            height={`${Settings.size * 2}px`}
            width={`${Settings.size * 2}px`}
            onPress={() => setActivePoo(index)}
            alignment="middle center"
          >
            <image url={color} imageHeight={64} imageWidth={64} />
            {activePoo === index && (
              <text color="black" weight="bold" size="xxlarge">
                ✓
              </text>
            )}
          </zstack>
        ))}
      </hstack>
    </hstack>
  );

  // get all the pixels from the canvas data
  const pixels = data.map((pixel, index) => (
    <zstack onPress={() => updateCanvas(index, activePoo)}>
      <hstack height={`${Settings.size}px`} width={`${Settings.size}px`} />
      <image
        url={pixel === 0 ? "transparent.png" : "poop.png"}
        imageHeight={32}
        imageWidth={32}
      />
    </zstack>
  ));

  const Canvas = (): JSX.Element => {
    return (
      <vstack
        cornerRadius="small"
        border="thin"
        height={`${Settings.resolution * Settings.size}px`}
        width={`${Settings.resolution * Settings.size}px`}
      >
        {splitArray(pixels, Settings.resolution).map((row) => (
          <hstack>{row}</hstack>
        ))}
      </vstack>
    );
  };

  function saveData() {
    // Save the state to the post
    game.submitWalking({
      postId: myPostId as PostId,
      authorUsername: props.username ?? "default_username",
      data: data,
    });

    props.onSave();
    context.ui.showToast("Your happy moments are saved!");
  }

  return (
    <hstack>
      <vstack alignment="start top">
        <GameDescription />
        <button
          width="100%"
          icon="save-view"
          appearance="primary"
          onPress={() => saveData()}
        >
          Done
        </button>
        <spacer size="small" />
        <hstack>
          <PooSelector />
          <spacer size="medium" />
          <text weight="bold" size="xxlarge" alignment="middle center">
            Poops: {poops}
          </text>
        </hstack>
      </vstack>

      <spacer size="medium" />
      <zstack height="100%" width="100%" gap="small" alignment="center middle">
        <image
          url="park.png"
          imageHeight={256}
          imageWidth={256}
          resizeMode="cover"
          description="park background"
        />
        <spacer size="small" />
        <Canvas />
        <spacer size="small" />
      </zstack>
    </hstack>
  );
};

export default WalkingTheDog;
