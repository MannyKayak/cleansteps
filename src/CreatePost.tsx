import { Devvit } from "@devvit/public-api";
// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: "Add Clean Steps game",
  location: "subreddit",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: "Clean Steps",
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: "Lets gooo!" });
  },
});
