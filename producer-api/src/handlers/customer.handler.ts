import { Request, Response } from 'express';
import CustomerService from '../services/customer.service';
import { CreateCustomerRequest } from '../types/customer.types';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customerData: CreateCustomerRequest = req.body;
    const customer = await CustomerService.createCustomer(customerData);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = await CustomerService.getCustomerById(customerId);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await CustomerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
