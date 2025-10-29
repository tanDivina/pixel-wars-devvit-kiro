import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'Pixel Wars',
      backgroundUri: 'default-splash.png',
      buttonLabel: '⚔️ Play Now',
      description: 'Choose your team • Place pixels • Control zones • Win the season',
      entryUri: 'index.html',
      heading: '⚔️ PIXEL WARS',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'active',
      startTime: Date.now(),
    },
    subredditName: subredditName,
    title: '⚔️ Pixel Wars - Team Territory Battle',
  });
};
