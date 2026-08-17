import Constants from 'expo-constants';

const getDevHostIp = (): string => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.developer?.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return ip;
    }
  }

  return '192.168.1.3';
};

export const ENV = {
  EXPLICIT_API_URL: process.env.EXPO_PUBLIC_API_URL,

  TIMEOUT_MS: 8000,

  get API_BASE_URL(): string {
    if (this.EXPLICIT_API_URL) {
      return this.EXPLICIT_API_URL;
    }

    const devIp = getDevHostIp();
    return `http://${devIp}:5185/api/v1`;
  },
};
