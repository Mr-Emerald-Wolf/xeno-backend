import { PrismaClient } from '@prisma/client';
import amqp from 'amqplib';

const prisma = new PrismaClient();

// Define a CommunicationLog message type
interface data {
    customerId: number;
    message: string;
    status: string;
    errorMessage?: string;
    sentAt: string;
}

// RabbitMQ connection and message processing
export const deliveryQueueHandler = async (data: data) => {
    try {
        // Store message in the communication_log table
        await prisma.communicationLog.create({
            data: {
                customerId: data.customerId,
                message: data.message,
                status: 'COMPLETED',
                errorMessage: null,
                sentAt: new Date(),
            },
        });

        console.log('Message stored in communication_log:', data);

    } catch (error) {
        console.error('Error storing message in communication_log:', error);
    }
}

