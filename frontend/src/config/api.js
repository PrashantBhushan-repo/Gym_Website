const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }

  return `${API_BASE_URL}${path}`;
};

export default API_BASE_URL;
