import { Client } from '@hashgraph/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { A2AMessagingService } from '../a2a-messaging';
import { AgentProfile, A2AMessage } from '../types';

export abstract class BaseAgent {
  protected client: Client;
  protected llm: ChatOpenAI;
  protected profile: AgentProfile;
  protected messagingService: A2AMessagingService;
  protected conversationHistory: A2AMessage[] = [];

  constructor(
    client: Client,
    profile: AgentProfile,
    messagingService: A2AMessagingService
  ) {
    this.client = client;
    this.profile = profile;
    this.messagingService = messagingService;

    // Initialize LLM with OpenRouter support
    const apiKey = process.env.OPENAI_API_KEY || '';
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    if (isOpenRouter) {
      // OpenRouter configuration
      this.llm = new ChatOpenAI({
        modelName: 'openai/gpt-4o-mini',
        temperature: 0.7,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'https://wanderlink.app',
            'X-Title': 'WanderLink Stake Agents',
          },
        },
      });
      console.log('🔑 Using OpenRouter API for AI validation');
    } else {
      // Standard OpenAI configuration
      this.llm = new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        openAIApiKey: apiKey,
      });
      console.log('🔑 Using OpenAI API for AI validation');
    }
  }

  protected abstract getSystemPrompt(): string;

  async processMessage(message: A2AMessage): Promise<A2AMessage | null> {
    this.conversationHistory.push(message);
    return null;
  }

  async sendMessage(to: string, type: A2AMessage['type'], payload: any): Promise<void> {
    const message = this.messagingService.createMessage(
      this.profile.accountId,
      to,
      type,
      payload
    );
    
    this.conversationHistory.push(message);
    await this.messagingService.sendMessage(message);
  }

  getProfile(): AgentProfile {
    return this.profile;
  }

  getConversationHistory(): A2AMessage[] {
    return this.conversationHistory;
  }

  // Execute AI analysis
  async executeAI(prompt: string): Promise<string> {
    const response = await this.llm.invoke(prompt);
    return response.content.toString();
  }
}
