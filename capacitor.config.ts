import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhakthibookshelf.app',
  appName: 'Bhakthi Bookshelf',
  webDir: 'capacitor/www',
  server: {
    url: 'https://bhakthibookshelf.in'
  }
};

export default config;
