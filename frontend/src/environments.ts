export const environment = {
  apiUrl: (typeof window !== 'undefined' && (window as any).__ENV?.VITE_API_URL) || 'http://localhost:3000',
  serverNumber: (typeof window !== 'undefined' && (window as any).__ENV?.VITE_SERVER_NUMBER) || '1',
};
