import { prisma } from '../../server';
import { Customer } from '@prisma/client';

interface ErrorResponse {
  error: string;
  message: string;
}

class CustomerService {
  static async createCustomer(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalSpending'>
  ): Promise<Customer | ErrorResponse> {
    try {
      const customer = await prisma.customer.create({
        data,
      });
      return customer;
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = error.meta?.target;
        return {
          error: 'Unique constraint violation',
          message: `The value for ${field} must be unique.`,
        };
      }

      return {
        error: 'Internal server error',
        message: error.message || 'Failed to create customer',
      };
    }
  }

  static async getCustomerById(
    customerId: number
  ): Promise<Customer | ErrorResponse | null> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { orders: true },
      });

      if (!customer) {
        return {
          error: 'Not Found',
          message: `Customer with ID ${customerId} not found.`,
        };
      }

      return customer;
    } catch (error: any) {
      return {
        error: 'Internal server error',
        message: error.message || 'Failed to fetch customer',
      };
    }
  }

  static async getAllCustomers(): Promise<Customer[] | ErrorResponse> {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          orders: true,
        },
      });

      return customers.map((customer) => ({
        ...customer,
        orders: customer.orders || [],
      }));
    } catch (error: any) {
      return {
        error: 'Internal server error',
        message: error.message || 'Failed to fetch customers',
      };
    }
  }

  static async updateCustomer(
    customerId: number,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Customer | ErrorResponse> {
    try {
      const customer = await prisma.customer.update({
        where: { id: customerId },
        data,
      });

      return customer;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return {
          error: 'Not Found',
          message: `Customer with ID ${customerId} not found.`,
        };
      }

      return {
        error: 'Internal server error',
        message: error.message || 'Failed to update customer',
      };
    }
  }

  static async deleteCustomer(
    customerId: number
  ): Promise<{ success: true } | ErrorResponse> {
    try {
      await prisma.customer.delete({
        where: { id: customerId },
      });

      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return {
          error: 'Not Found',
          message: `Customer with ID ${customerId} not found.`,
        };
      }

      return {
        error: 'Internal server error',
        message: error.message || 'Failed to delete customer',
      };
    }
  }
}

export default CustomerService;