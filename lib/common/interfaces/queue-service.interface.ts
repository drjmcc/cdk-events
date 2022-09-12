import { DequeuedMessage } from "./dequeued-message.interface";

export interface QueueService {
  deleteMessages(messageHeaders: DequeuedMessage[]): Promise<void>;
}
