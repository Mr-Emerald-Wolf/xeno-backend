// src/routes/customerRoutes.ts
import express from 'express';
import { createCustomer, getAllCustomers, getCustomerById } from '../handlers/customer.handler';

const router = express.Router();

router.post('/', createCustomer);

router.get('/all', getAllCustomers);

router.get('/:id', getCustomerById);

export default router;
