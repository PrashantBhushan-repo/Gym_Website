const isLocalDev = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL = isLocalDev
  ? 'http://localhost:5000'
  : process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
