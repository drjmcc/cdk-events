import { SQS } from "aws-sdk";
import { DequeuedMessage } from "../../interfaces/dequeued-message.interface";
import { SqsQueueService } from "./queue-service";

export interface QueueService {
  deleteMessages(
    messageHeaders: DequeuedMessage[],
    queueUrl: string
  ): Promise<void>;
}

const sqsClient = new SQS({
  region: "us-east-1",
});

export const queueService: QueueService = new SqsQueueService(sqsClient);
