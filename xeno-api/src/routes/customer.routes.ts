// src/routes/customerRoutes.ts
import express from 'express';
import { createCustomer, getAllCustomers, getCustomerById, getMessages } from '../handlers/customer.handler';

const router = express.Router();

router.post('/', createCustomer);

router.get('/all', getAllCustomers);

router.get('/messages/:id', getMessages);

router.get('/:id', getCustomerById);

export default router;
