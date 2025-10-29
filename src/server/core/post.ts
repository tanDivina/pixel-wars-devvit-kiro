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
      buttonLabel: '⚔️ Join the Battle',
      description: 'Claim territory. Dominate the canvas. Lead your team to victory.',
      entryUri: 'index.html',
      heading: 'PIXEL WARS',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'active',
      startTime: Date.now(),
    },
    subredditName: subredditName,
    title: '🎨⚔️ Pixel Wars - Team Territory Battle',
  });
};
