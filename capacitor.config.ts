import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhakthibookshelf.app',
  appName: 'Bhakthi Bookshelf',
  webDir: 'capacitor/www',
  server: {
    url: 'https://bhakthibookshelf.in'
  },
  plugins: {
    // Off by default — the in-app reader turns it on only while a book is
    // open (Android FLAG_SECURE / iOS screenshot + recording block), so
    // the rest of the app stays screenshot-friendly.
    PrivacyScreen: {
      enable: false,
      preventScreenshots: true
    }
  }
};

export default config;
