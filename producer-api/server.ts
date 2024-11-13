import express, { Request, Response } from "express";
import customerRoutes from './src/routes/customer.routes';
import orderRoutes from './src/routes/order.routes';
import { PrismaClient } from "@prisma/client";
const jsonErrorHandler = require('express-body-parser-error-handler')

export const prisma = new PrismaClient();

const app = express();
const port = 8080;

async function main() {
  
  // Middleware
  app.use(express.json());
  app.use(jsonErrorHandler());

  // Register API routes
  app.use('/customers', customerRoutes);
  app.use('/orders', orderRoutes);
  
  // Catch unregistered routes
  app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });