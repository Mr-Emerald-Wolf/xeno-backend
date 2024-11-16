import { AudienceSegment, Customer } from '@prisma/client';
import { prisma } from '../../server'; // Assuming you have Prisma set up
import { channel } from '../config/rabbitmq'; // Assuming you have a RabbitMQ channel set up

class DeliveryService {
    static async getAudienceSegmentById(id: number): Promise<AudienceSegment & { customers: Customer[] } | null> {
        try {
            const audienceSegment = await prisma.audienceSegment.findUnique({
                where: { id },
                include: {
                    customers: true, 
                },
            });

            if (!audienceSegment) {
                throw new Error(`No audience segment found with ID ${id}`);
            }
            console.log(audienceSegment)

            return audienceSegment as AudienceSegment & { customers: Customer[] };  // Cast the result
        } catch (error: any) {
            throw new Error(`Error fetching audience segment: ${error.message}`);
        }
    }


    static async sendToQueue(queue: string, payload: any): Promise<void> {
        try {
            if (!channel) {
                throw new Error('RabbitMQ channel not initialized');
            }

            await channel.assertQueue(queue, { durable: true });

            // Send the message to the queue
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
        } catch (error: any) {
            throw new Error(`Error sending to RabbitMQ: ${error.message}`);
        }
    }

    static async deliverMessageToAudienceSegment(
        audienceSegmentId: number,
        message: string
    ): Promise<{ success: boolean; customerCount: number }> {
        try {
            const audienceSegment = await this.getAudienceSegmentById(audienceSegmentId);

            if (!audienceSegment) {
                throw new Error(`No audience segment found with ID ${audienceSegmentId}`);
            }

            const customers = audienceSegment.customers;

            if (!customers || customers.length === 0) {
                throw new Error(`No customers found for Audience Segment with ID ${audienceSegmentId}`);
            }

            const queue = 'deliveryQueue';
            const deliveryPromises = customers.map(async (customer: Customer) => {
                const messagePayload = {
                    customerId: customer.id,
                    message: message.replace("[Name]", customer.name), // Replace placeholder with customer's name
                };

                await this.sendToQueue(queue, messagePayload);
            });

            await Promise.all(deliveryPromises);

            return { success: true, customerCount: customers.length };
        } catch (error: any) {
            throw new Error(`Error delivering message: ${error.message}`);
        }
    }
}

export default DeliveryService;
