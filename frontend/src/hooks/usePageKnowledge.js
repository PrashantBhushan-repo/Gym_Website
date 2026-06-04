import { useEffect } from 'react';
import { addPageKnowledge } from '../utils/knowledgeApi';

const usePageKnowledge = (pageInfo) => {
  useEffect(() => {
    if (!pageInfo?.slug || !pageInfo?.title || !pageInfo?.content) {
      return;
    }

    const sendPageKnowledge = async () => {
      try {
        await addPageKnowledge(pageInfo);
      } catch (error) {
        console.warn('Page knowledge ingestion failed:', error.message || error);
      }
    };

    sendPageKnowledge();
  }, [pageInfo]);
};

export default usePageKnowledge;
