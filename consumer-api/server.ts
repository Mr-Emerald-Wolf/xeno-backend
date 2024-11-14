import dotenv from 'dotenv';
import amqp, { ConsumeMessage } from 'amqplib';
import { PrismaClient } from '@prisma/client';
import { ProcessMessage } from "./src/handlers/message.handler"
dotenv.config();
export const prisma = new PrismaClient();

const connectionString: string | undefined = process.env.AMQP_URL;
const QUEUES: string[] = ['orderQueue', 'campaignQueue', 'deliveryQueue'];

(async () => {
  try {

    await prisma.$connect();
    console.log('Connected to Prisma successfully');

    if (!connectionString) {
      throw new Error('AMQP_URL is not defined in .env file');
    }

    const connection = await amqp.connect(connectionString);
    const channel = await connection.createChannel();

    // Graceful shutdown
    process.once('SIGINT', async () => {
      await channel.close();
      await connection.close();
      console.log('Gracefully closed RabbitMQ connection');
    });

    // Assert each queue and set up a consumer
    for (const queue of QUEUES) {
      await channel.assertQueue(queue, { durable: true });

      channel.consume(
        queue,
        (message: ConsumeMessage | null) => {
          if (message) {
            ProcessMessage(queue, message);
            channel.ack(message); 
          }
        },
        { noAck: false } 
      );

      console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);
    }
  } catch (err) {
    console.warn('Error:', err);
  }
})();
