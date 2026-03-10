import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d0f4e780621b4e038ff607f85c06858d',
  appName: 'share-connect-thrive',
  webDir: 'dist',
  server: {
    url: 'https://d0f4e780-621b-4e03-8ff6-07f85c06858d.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
