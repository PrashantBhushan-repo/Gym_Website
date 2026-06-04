import { Pinecone } from '@pinecone-database/pinecone';

class VectorService {
  constructor() {
    const pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    };

    if (process.env.PINECONE_BASE_URL) {
      pineconeConfig.baseUrl = process.env.PINECONE_BASE_URL;
    }

    if (!pineconeConfig.apiKey || (!pineconeConfig.environment && !pineconeConfig.baseUrl)) {
      throw new Error('Pinecone configuration is incomplete. Set PINECONE_API_KEY and either PINECONE_ENVIRONMENT or PINECONE_BASE_URL.');
    }

    this.pc = new Pinecone(pineconeConfig);
    this.indexName = process.env.PINECONE_INDEX_NAME || 'gym-knowledge';
    this.vectorDimension = parseInt(process.env.PINECONE_VECTOR_DIMENSION, 10) || 3072;
    this.index = null;
  }

  async initIndex() {
    try {
      const desiredDimension = this.vectorDimension;
      const indexResult = await this.pc.listIndexes();
      const indexNames = Array.isArray(indexResult)
        ? indexResult
        : indexResult.indexes;
      const indexExists = indexNames?.some(entry =>
        typeof entry === 'string'
          ? entry === this.indexName
          : entry?.name === this.indexName
      );

      if (indexExists) {
        const description = await this.pc.describeIndex(this.indexName);
        if (description.dimension !== desiredDimension) {
          const altIndexName = `${this.indexName}-v2`;
          console.warn(`Pinecone index ${this.indexName} exists with dimension ${description.dimension}, but expected ${desiredDimension}. Using ${altIndexName} instead.`);

          if (!indexNames.some(entry => typeof entry === 'string' ? entry === altIndexName : entry?.name === altIndexName)) {
            await this.pc.createIndex({
              name: altIndexName,
              dimension: desiredDimension,
              metric: 'cosine',
              spec: {
                serverless: {
                  cloud: 'aws',
                  region: 'us-east-1'
                }
              }
            });
            console.log(`Created Pinecone index: ${altIndexName}`);
          } else {
            const altDescription = await this.pc.describeIndex(altIndexName);
            if (altDescription.dimension !== desiredDimension) {
              throw new Error(`Existing alternate Pinecone index ${altIndexName} dimension ${altDescription.dimension} does not match desired ${desiredDimension}. Please delete or rename it.`);
            }
          }

          this.indexName = altIndexName;
        } else {
          console.log(`Pinecone index ${this.indexName} already exists`);
        }
      } else {
        await this.pc.createIndex({
          name: this.indexName,
          dimension: desiredDimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        console.log(`Created Pinecone index: ${this.indexName}`);
      }

      this.index = this.pc.index(this.indexName);
      console.log(`Vector service initialized with Pinecone using dimension ${desiredDimension}`);
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      throw error;
    }
  }

  async storeVectors(vectors) {
    try {
      if (!this.index) {
        throw new Error('Index not initialized. Call initIndex() first.');
      }

      // Format vectors for Pinecone upsert
      const pineconeVectors = vectors.map(vector => ({
        id: vector.id,
        values: vector.values,
        metadata: vector.metadata
      }));

      console.log(`Pinecone storeVectors called with ${pineconeVectors.length} vector(s)`);

      // Upsert vectors in batches (Pinecone recommends batches of 100 or less)
      const batchSize = 100;
      for (let i = 0; i < pineconeVectors.length; i += batchSize) {
        const batch = pineconeVectors.slice(i, i + batchSize);
        console.log(`Upserting batch ${Math.floor(i / batchSize) + 1} with ${batch.length} record(s)`);
        await this.index.upsert({ records: batch });
      }

      console.log(`Stored ${vectors.length} vectors in Pinecone`);
    } catch (error) {
      console.error('Error storing vectors:', error);
      throw error;
    }
  }

  async searchVectors(queryVector, topK = 5) {
    try {
      if (!this.index) {
        throw new Error('Index not initialized. Call initIndex() first.');
      }

      const queryResponse = await this.index.query({
        vector: queryVector,
        topK: topK,
        includeMetadata: true
      });

      // Format results to match previous interface
      const results = queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata
      }));

      return results;
    } catch (error) {
      console.error('Error searching vectors:', error);
      throw error;
    }
  }
}

export default VectorService;