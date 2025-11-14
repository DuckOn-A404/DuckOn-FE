import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teamduck.duckon',
  appName: 'DuckOn',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    allowNavigation: ['duckon.site', '*.duckon.site']
  }
};

export default config;
