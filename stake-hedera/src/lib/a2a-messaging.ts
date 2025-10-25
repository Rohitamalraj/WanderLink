import { TopicCreateTransaction, TopicMessageSubmitTransaction, Client } from '@hashgraph/sdk';
import { A2AMessage } from './types';

/**
 * A2A (Agent-to-Agent) Messaging Service using Hedera Consensus Service (HCS)
 * Implements the A2A standard for agent communication
 */
export class A2AMessagingService {
  private client: Client;
  private topicId?: string;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Create a new HCS topic for A2A messaging
   */
  async createMessageTopic(): Promise<string> {
    const transaction = new TopicCreateTransaction()
      .setTopicMemo('A2A Agent Communication Channel')
      .setAdminKey(this.client.operatorPublicKey!);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    
    this.topicId = receipt.topicId!.toString();
    return this.topicId;
  }

  /**
   * Send an A2A message to the topic
   */
  async sendMessage(message: A2AMessage): Promise<string> {
    if (!this.topicId) {
      throw new Error('Topic not initialized. Call createMessageTopic first.');
    }

    const messageJson = JSON.stringify(message);
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(this.topicId)
      .setMessage(messageJson);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    
    return receipt.status.toString();
  }

  /**
   * Create a standardized A2A message
   */
  createMessage(
    from: string,
    to: string,
    type: A2AMessage['type'],
    payload: any
  ): A2AMessage {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type,
      payload,
      timestamp: Date.now(),
    };
  }

  getTopicId(): string | undefined {
    return this.topicId;
  }

  setTopicId(topicId: string): void {
    this.topicId = topicId;
  }
}
