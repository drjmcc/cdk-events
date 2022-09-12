import { SQS } from "aws-sdk";
import { DequeuedMessage } from "../../interfaces/dequeued-message.interface";

/**
 * Service to handle different sqs queue actions
 */
export class SqsQueueService {
  constructor(private readonly sqsClient: SQS) {}

  /**
   * Deletes up to ten messages from a sqs queue
   */
  async deleteMessages(
    deleteMessageRequests: DequeuedMessage[],
    queueUrl: string
  ): Promise<void> {
    if (deleteMessageRequests.length <= 0) {
      return;
    }

    const result = await this.sqsClient
      .deleteMessageBatch({
        QueueUrl: queueUrl,
        Entries: deleteMessageRequests.map((m) => ({
          Id: m.id,
          ReceiptHandle: m.receiptHandle,
        })),
      })
      .promise();

    if (result.Failed.length > 0) {
      throw new Error("Unable to delete messages from queue.");
    }
  }
}
