// src/routes/orderRoutes.ts
import express from 'express';
import { createOrder, getOrderById, getOrdersByCustomerId } from '../handlers/order.handler';

const router = express.Router();

router.post('/', createOrder);

router.get('/customer/:customerId', getOrdersByCustomerId);

router.get('/:id', getOrderById);

export default router;
