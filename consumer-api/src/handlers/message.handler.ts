import { ConsumeMessage } from "amqplib";
import { orderQueueHandler } from "./order.handler";

export const ProcessMessage = (queue: string, message: ConsumeMessage) => {
    const messageContent = JSON.parse(message.content.toString());
    switch (queue) {
        case 'orderQueue':
            console.log('Processing orderQueue message:', messageContent);
            orderQueueHandler(messageContent)
            break;
        case 'campaignQueue':
            console.log('Processing campaignQueue message:', messageContent.message);
            break;
        case 'deliveryQueue':
            console.log('Processing deliveryQueue message:', messageContent.message);
            break;
        default:
            console.warn(`Unknown queue: ${queue}`);
    }
};