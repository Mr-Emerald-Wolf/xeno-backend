import { Request, Response } from 'express';
import OrderService from '../services/order.service';
import { CreateOrderRequest } from '../types/order.types';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData: CreateOrderRequest = req.body;
    orderData
    const newOrderData = {
      ...orderData,
      orderDate: new Date(orderData.orderDate), // Convert orderDate to Date type
    };
    const order = await OrderService.createOrder(newOrderData);
    res.status(201).json(order);
    return
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await OrderService.getOrderById(orderId);
    res.json(order);
    return
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return
  }
};

export const getOrdersByCustomerId = async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const orders = await OrderService.getOrdersByCustomerId(customerId);
    res.json(orders);
    return
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
    return
  }
};
