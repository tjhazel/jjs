const defaultApiUrl = typeof window !== 'undefined'
   ? `${window.location.protocol}//${window.location.host}`
   : 'https://localhost:5001';

const config = {
   apiUrl: (import.meta.env.VITE_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, '')
};

export default config;

