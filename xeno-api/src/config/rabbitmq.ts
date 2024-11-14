import amqp, { Connection, Channel } from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

const connectionString: string | undefined = process.env.AMQP_URL;
let connection: Connection | null = null;
let channel: Channel | null = null;

export async function connectRabbitMQ(): Promise<{ connection: Connection, channel: Channel }> {
    try {
        
        if (!connectionString) {
            throw new Error('AMQP_URL is not defined in .env file');
        }

        // If the connection already exists, reuse it.
        if (connection && channel) {
            console.log('Reusing existing RabbitMQ connection and channel.');
            return { connection, channel };
        }

        console.log('Connecting to RabbitMQ...');
        connection = await amqp.connect({
            protocol: 'amqp',
            hostname: 'localhost',
            port: 5672,
            username: 'user',
            password: 'password',
            vhost: '/'
        });

        channel = await connection.createChannel();

        console.log('RabbitMQ connected and channel created.');
        return { connection, channel };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

export async function closeRabbitMQ(): Promise<void> {
    if (!connection || !channel) {
        console.warn('No active RabbitMQ connection or channel to close.');
        return;
    }

    try {
        console.log('Closing RabbitMQ connection and channel...');
        await channel.close();
        await connection.close();
        console.log('RabbitMQ connection closed.');
    } catch (error) {
        console.error('Error closing RabbitMQ:', error);
    } finally {
        connection = null; // Reset shared variables
        channel = null;
    }
}

export async function reconnectRabbitMQ(): Promise<{ connection: Connection, channel: Channel }> {
    try {
        console.log('Attempting to reconnect to RabbitMQ...');
        return await connectRabbitMQ();
    } catch (error) {
        console.error('Error reconnecting to RabbitMQ:', error);
        throw error;
    }
}

export { connection, channel };
