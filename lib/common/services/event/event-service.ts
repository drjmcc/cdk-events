import { SQSEvent } from "aws-lambda/trigger/sqs";
import { DequeuedMessage } from "../../interfaces/dequeued-message.interface";
import { Message } from "../../interfaces/message.interface";
import { NonRetriableError, PartialFailureError } from "../errors";
import { QueueService } from "../queue";

export type AsyncMessageFunction = (message: DequeuedMessage) => Promise<void>;

export class EventService {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Handles an sqs event by processing every message of it
   */
  async handle(event: SQSEvent, processorFn: AsyncMessageFunction) {
    // Get parsed messages from the event
    const dequeuedMessages = this.mapEventToDequeuedMessages(event);
    const messagesToDelete: DequeuedMessage[] = [];

    // Process all messages
    // To delete every message from the event from the queue that has been successful processed,
    // the handle function must not throw an error.
    // To delete successful messages and keep unsuccessful messages in the queue,
    // the handle function has to throw an error.
    // Successfull messages have to be deleted manually in this case.
    const promises = dequeuedMessages.map(async (message) => {
      try {
        await processorFn(message);
        messagesToDelete.push(message);
      } catch (error) {
        console.log(error);
        if (error instanceof NonRetriableError) {
          messagesToDelete.push(message);
        }
      }
    });
    // await until all messages have been processed
    await Promise.all(promises);

    // Delete successful messages manually if other processings failed
    const numRetriableMessages =
      dequeuedMessages.length - messagesToDelete.length;
    if (numRetriableMessages > 0) {
      await this.queueService.deleteMessages(
        messagesToDelete,
        process.env.QUEUE_URL as string
      );

      const errorMessage = `Failing due to ${numRetriableMessages} unsuccessful and retriable errors.`;

      throw new PartialFailureError(errorMessage);
    }
  }

  private mapEventToDequeuedMessages(event: SQSEvent): DequeuedMessage[] {
    return event.Records.map((record) => {
      const message: Message = JSON.parse(record.body);
      return {
        id: record.messageId,
        receiptHandle: record.receiptHandle,
        ...message,
      };
    });
  }
}
