import { CapacitorConfig } from '@capacitor/cli';

// Defaults to production. For a local device test against a LAN dev server,
// build with e.g. CAP_SERVER_URL=http://192.168.1.150:3010 (http enables
// cleartext automatically). Never commit a non-prod CAP_SERVER_URL value.
const serverUrl = process.env.CAP_SERVER_URL || 'https://bhakthibookshelf.in';
const cleartext = serverUrl.startsWith('http://');

const config: CapacitorConfig = {
  appId: 'com.bhakthibookshelf.app',
  appName: 'Bhakthi Bookshelf',
  webDir: 'capacitor/www',
  server: {
    url: serverUrl,
    ...(cleartext ? { cleartext: true } : {})
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
