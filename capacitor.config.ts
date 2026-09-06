import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bhakthibookshelf.app',
  appName: 'Bhakthi Bookshelf',
  webDir: 'public',
  server: {
    url: 'http://172.25.248.211:3010',
    cleartext: true
  }
};

export default config;
