import { SQSEvent } from "aws-lambda";
import { DequeuedMessage } from "../../common/interfaces/dequeued-message.interface";
import { eventService } from "../../common/services/event/index";

export const handler = (sqsEvent: SQSEvent) =>
  eventService.handle(sqsEvent, processMessage);

// function to call on each event to process
export const processMessage = async (message: DequeuedMessage) => {
  console.log(`Processed message id + ${message.id}`);
  console.log(`Message + ${JSON.stringify(message.payload)}`);
};
