import { prisma } from '../../server';
import { Customer, CommunicationLog } from '@prisma/client';

interface ErrorResponse {
  error: string;
  message: string;
}

class CustomerService {
  static async createCustomer(
    email: string
  ): Promise<{
    success: boolean;
    data?: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalSpending'>;
    message: string;
    error?: string;
  }> {
    try {
      // Check if the customer already exists by email
      const existingCustomer = await prisma.customer.findUnique({
        where: { email },
      });

      const name = email.split('@')[0];

      if (existingCustomer) {
        return {
          success: true,
          data: existingCustomer,
          message: 'Customer already exists in the system.',
        };
      }

      // Create a new customer with only the email
      const customer = await prisma.customer.create({
        data: {
          name,
          email, // Only providing the email
        },
      });

      return {
        success: true,
        data: customer, // Customer object returned here
        message: 'Customer created successfully.',
      };
    } catch (error: any) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'Unique constraint violation',
          message: 'A customer with this email already exists.',
        };
      }

      // Handle generic errors
      return {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to create customer.',
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

  static async getMessagesByCustomerId(
    customerId: number
  ): Promise<CommunicationLog[] | { error: string; message: string }> {
    try {
      const messages = await prisma.communicationLog.findMany({
        where: {
          customerId: customerId,
        },
        orderBy: {
          sentAt: 'desc',
        },
      });

      if (messages.length === 0) {
        return {
          error: 'Not Found',
          message: `No messages found for customer with ID ${customerId}`,
        };
      }

      return messages;
    } catch (error: any) {
      return {
        error: 'Internal server error',
        message: error.message || 'Failed to retrieve communication logs',
      };
    }
  }
}

export default CustomerService;