const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalDev = ['localhost', '127.0.0.1'].includes(hostname);
const productionFallbacks = {
  'gym-website-eight-plum.vercel.app': 'https://gym-website-xtj6.onrender.com',
  'gym-website-xtj6.onrender.com': 'https://gym-website-xtj6.onrender.com'
};

const API_BASE_URL = isLocalDev
  ? 'http://localhost:5000'
  : process.env.REACT_APP_API_URL || productionFallbacks[hostname] || 'https://gym-website-xtj6.onrender.com';

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
