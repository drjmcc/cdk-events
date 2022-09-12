import { EventService } from "./event-service";
import { queueService } from "../queue";

export const eventService = new EventService(queueService);
