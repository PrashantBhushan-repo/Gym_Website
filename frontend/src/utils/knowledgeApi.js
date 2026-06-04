import { apiUrl } from '../config/api';

export const addPageKnowledge = async ({ slug, title, content, category = 'page', tags = [] }) => {
  if (!slug || !title || !content) {
    throw new Error('slug, title and content are required to add page knowledge');
  }

  const response = await fetch(apiUrl('/api/knowledge/add-page'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ slug, title, content, category, tags })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to add page knowledge');
  }

  return response.json();
};
