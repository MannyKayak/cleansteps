import { Devvit } from "@devvit/public-api";

import type { HomePostData, PostId } from "../utils/types.js";
import MenuPage from "../pages/MenuPage.js";

interface HomePostProps {
  username: string | null;
  postId: PostId;
  onSelectionPage: (buttonLabel: string) => void;
}

export const HomePost = (props: HomePostProps): JSX.Element => {
  // in this case the user just logged in and started a new game

  return (
    <hstack>
      <MenuPage />
    </hstack>
  );
};
