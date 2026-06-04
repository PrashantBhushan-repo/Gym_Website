import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

class BedrockService {
  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async invokeClaude(prompt, maxTokens = 1000) {
    const body = {
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 250,
      stop_sequences: ['\n\nHuman:'],
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.completion;
    } catch (error) {
      console.error('Error invoking Claude:', error);
      throw error;
    }
  }

  async invokeLlama(prompt, maxTokens = 1000) {
    const body = {
      prompt,
      max_gen_len: maxTokens,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: 'meta.llama2-13b-chat-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.generation;
    } catch (error) {
      console.error('Error invoking Llama:', error);
      throw error;
    }
  }

  async generateEmbeddings(text) {
    const body = {
      inputText: text
    };

    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-embed-text-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }
}

export default BedrockService;