import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jsonErrorHandler from 'express-body-parser-error-handler';
import customerRoutes from './src/routes/customer.routes';
import orderRoutes from './src/routes/order.routes';
import { connectRabbitMQ, closeRabbitMQ } from './src/config/rabbitmq'; // Import RabbitMQ connection functions


export const prisma = new PrismaClient();

const app = express();
const port = 8080;

async function main() {

  try {
    // Step 1: Connect to RabbitMQ
    await connectRabbitMQ();
    console.log('Connected to RabbitMQ successfully');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    process.exit(1); 
  }

  try {
    // Step 2: Connect to Prisma client
    await prisma.$connect();
    console.log('Connected to Prisma successfully');
  } catch (error) {
    console.error('Error connecting to Prisma:', error);
    await closeRabbitMQ(); 
    process.exit(1);
  }

  // Step 3: Middleware setup
  app.use(express.json());
  app.use(jsonErrorHandler());

  // Step 4: Register API routes
  app.use('/customers', customerRoutes);
  app.use('/orders', orderRoutes
  )

  // Catch unregistered routes
  app.all('*', (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  // Step 5: Start server
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

  // Gracefully shut down connections when process is terminated
  process.on('SIGINT', async () => {
    await closeRabbitMQ();
    await prisma.$disconnect();
    console.log('Shut down gracefully');
    process.exit(0);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
