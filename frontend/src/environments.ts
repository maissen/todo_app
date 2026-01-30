const getEnv = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

export const environment = {
  apiUrl: getEnv('VITE_API_URL', 'http://localhost:3000'),
  serverNumber: getEnv('VITE_SERVER_NUMBER', '1'),
};
