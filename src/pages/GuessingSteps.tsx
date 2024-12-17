import { Context, Devvit, useAsync, useState } from "@devvit/public-api";

import { PoopedPostData, PostId } from "../utils/types.js";
import Settings from "../settings.json" assert { type: "json" };
import {
  blankCanvas,
  splitArray,
  generateRandomStartingPoint,
  generateRandomFinishPoint,
  generatePossibleMovements,
} from "../utils/utils.js";
import { Game } from "../classes/Game.js";
import GameOver from "../components/GameOver.js";

interface GuessingStepsProps {
  postId: PostId;
  postData: PoopedPostData;
  username: string;
}

const GuessingSteps = (
  props: GuessingStepsProps,
  context: Context
): JSX.Element => {
  // get all the pixels from the canvas data
  const [canvas, setCanvas] = useState<number[]>(blankCanvas);
  const game = new Game(context);
  const [authorPoints, setAuthorPoints] = useState<number>(0);
  const [guesserPoints, setGuesserPoints] = useState<number>(0);
  const [steps, setSteps] = useState<number>(Settings.defaultSteps);
  const [dirtySteps, setDirtySteps] = useState<number>(0);
  const initialSpritePosition = useState(() =>
    generateRandomStartingPoint()
  )[0];
  const finishedPosition = useState(() => generateRandomFinishPoint())[0];
  const [currentSpritePosition, setCurrentSpritePosition] = useState(
    initialSpritePosition
  );
  let possibleSpriteMovements = generatePossibleMovements(
    currentSpritePosition
  );
  const [gameOver, setGameOver] = useState<boolean>(false);

  console.log(finishedPosition);

  function updateSteppedCanvas(
    pixel: number,
    index: number,
    checkStep: number
  ): void {
    if (!possibleSpriteMovements.includes(index)) {
      context.ui.showToast("Movimento non permesso!");
      return;
    }

    if (steps <= 0) {
      context.ui.showToast("End of the game!");
      // assing poits to author and user

      // check if user got some extra points
      if (authorPoints === 0) {
        // no poop was stepped => 5 extra points
        setGuesserPoints((prev) => prev + Settings.extraRewardForNoPoopStepped);
      }
      if (authorPoints === 16) {
        // all poops were stepped => 10 extra points for the author
        setAuthorPoints((prev) => prev + Settings.extraRewardForAllPoopStepped);
      }
      if (index != finishedPosition) {
        // not reached the goal => 2 penalty points
        setGuesserPoints((prev) => prev - Settings.penalityGoalNotReached);
      }

      // upload poits to redis
      game.incrementUserScore(props.postData.authorUsername, authorPoints); // increment author points
      game.incrementUserScore(props.username, guesserPoints);

      setGameOver(true);
      return;
    }

    const newCanvas = [...canvas];

    if (pixel === 1 && checkStep !== 2) {
      setSteps((prev) => prev - 1);
      context.ui.showToast("Shit this is a shit!");
      setDirtySteps((prev) => ++prev);
      setAuthorPoints((prev) => prev + Settings.authorRewardForPoopedStepped);
      newCanvas[index] = 1;
    } else if (pixel === 0 && checkStep !== 3) {
      setSteps((prev) => prev - 1);
      newCanvas[index] = 3;
      setGuesserPoints((prev) => prev + Settings.guesserRewardForCleanStep);
    }

    setCanvas(newCanvas);
    setCurrentSpritePosition(index); // update current sprite position
    possibleSpriteMovements = generatePossibleMovements(index); // update possible movements

    if (index === finishedPosition) {
      context.ui.showToast("Hai raggiunto il traguardo!");

      // check if user got some extra points
      if (authorPoints === 0) {
        // no poop was stepped => 5 extra points
        setGuesserPoints((prev) => prev + Settings.extraRewardForNoPoopStepped);
      }
      if (authorPoints === 16) {
        // all poops were stepped => 10 extra points for the author
        setAuthorPoints((prev) => prev + Settings.extraRewardForAllPoopStepped);
      }

      // upload poits to redis
      game.incrementUserScore(props.postData.authorUsername, authorPoints); // increment author points
      game.incrementUserScore(props.username, guesserPoints); // increment guesser points
      setGameOver(true);
    }
  }

  const pixels = canvas.map((pixel, index) => {
    const isPossibleMove = possibleSpriteMovements.includes(index);
    const isFinishPosition = finishedPosition === index;
    const isInitialSpritePosition = currentSpritePosition === index;
    return (
      <zstack
        onPress={() => {
          if (isPossibleMove) {
            updateSteppedCanvas(props.postData.path[index], index, pixel);
            setCurrentSpritePosition(index);
            possibleSpriteMovements = generatePossibleMovements(index);
          } else {
            context.ui.showToast("You can move only one step at the time!");
          }
        }}
      >
        <hstack height={`${Settings.size}px`} width={`${Settings.size}px`} />
        <image
          url={
            isFinishPosition
              ? "exit.png"
              : isInitialSpritePosition
              ? "sprite.gif"
              : pixel === 1
              ? "poop.png"
              : "transparent.png"
          }
          imageHeight={32}
          imageWidth={32}
        />
      </zstack>
      //   <zstack
      //     onPress={() => {
      //       if (isPossibleMove) {
      //         updateSteppedCanvas(props.postData.path[index], index, pixel);
      //         setCurrentSpritePosition(index);
      //         possibleSpriteMovements = generatePossibleMovements(index);
      //       } else {
      //         context.ui.showToast("You can move only one step at the time!");
      //       }
      //     }}
      //   >
      //     <hstack height={`${Settings.size}px`} width={`${Settings.size}px`} />
      //     <image
      //       url={
      //         props.postData.path[index] === 1 ? "poop.png" : "transparent.png"
      //       }
      //       imageHeight={32}
      //       imageWidth={32}
      //     />
      //   </zstack>
    );
  });

  if (gameOver) {
    const { data: user, loading } = useAsync(async () => {
      const userStat = await game.getUserScore(props.username);
      // update postData
      await game.saveSolvedPost(props.postId);

      return {
        rank: userStat.rank,
        score: userStat.score,
      };
    });

    if (loading || user === null) {
      return (
        <zstack>
          <vstack grow alignment="center middle">
            <text color={Settings.theme.secondary}>Loading ...</text>
          </vstack>
        </zstack>
      );
    }

    return (
      <zstack
        width={`${Settings.size * Settings.resolution}px`}
        height={`${Settings.resolution * Settings.size}px`}
        alignment="center middle"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        cornerRadius="small"
        border="thin"
        grow
      >
        <GameOver
          points={guesserPoints}
          cleanSteps={Settings.defaultSteps - steps - dirtySteps}
          poops={dirtySteps}
          totPoints={user.score}
          rank={user.rank}
        />
      </zstack>
    );
  }

  const Canvas = (): JSX.Element => (
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

  return (
    <zstack width="100%" height="100%" alignment="center middle">
      <hstack alignment="center middle">
        <vstack alignment="middle start">
          <text size="xxlarge" weight="bold">
            Guess Your Clean Steps
          </text>
          <text size="xlarge" weight="bold">
            Your Points: {guesserPoints}
          </text>
          <text size="xlarge" weight="bold">
            Step left: {steps}
          </text>
        </vstack>
        <spacer size="large" />
        <zstack
          height="100%"
          width="100%"
          gap="small"
          alignment="center middle"
        >
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
    </zstack>
  );
};

export default GuessingSteps;
