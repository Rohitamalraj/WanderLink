import { Client } from '@hashgraph/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { HederaLangchainToolkit, coreQueriesPlugin, coreHTSPlugin } from 'hedera-agent-kit';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { A2AMessagingService } from '../a2a-messaging';
import { AgentProfile, A2AMessage } from '../types';

export abstract class BaseAgent {
  protected client: Client;
  protected llm: ChatOpenAI;
  protected toolkit: HederaLangchainToolkit;
  protected agentExecutor: AgentExecutor;
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

    // Initialize LLM with OpenRouter configuration
    const apiKey = process.env.OPENAI_API_KEY || '';
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    if (isOpenRouter) {
      this.llm = new ChatOpenAI({
        modelName: 'openai/gpt-4o-mini',
        temperature: 0.7,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
        },
      });
    } else {
      this.llm = new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        openAIApiKey: apiKey,
      });
    }

    // Initialize Hedera Agent Kit
    this.toolkit = new HederaLangchainToolkit({
      client,
      configuration: {
        plugins: [coreQueriesPlugin, coreHTSPlugin],
      },
    });

    // Create agent executor
    this.agentExecutor = this.createAgentExecutor();
  }

  private createAgentExecutor(): AgentExecutor {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', this.getSystemPrompt()],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    const tools = this.toolkit.getTools();
    const agent = createToolCallingAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    return new AgentExecutor({
      agent,
      tools,
      verbose: true,
    });
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

  // Public method to execute agent tasks
  async execute(input: string): Promise<any> {
    return await this.agentExecutor.invoke({ input });
  }
}
