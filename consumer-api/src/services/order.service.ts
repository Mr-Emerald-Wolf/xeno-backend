import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../server';
import { Order, Status } from '@prisma/client';

interface ErrorResponse {
    error: string;
    message: string;
}

class OrderService {
    static async createOrder(
        data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, operationId: number
    ): Promise<Order | ErrorResponse> {
        try {
            // Calculate order total and update customer's total spending
            const order = await prisma.$transaction(async (tx) => {
                const newOrder = await tx.order.create({
                    data,
                    include: {
                        customer: true,
                    },
                });

                // Update customer's total spending
                await tx.customer.update({
                    where: { id: data.customerId },
                    data: {
                        totalSpending: {
                            increment: data.cost,
                        },
                    },
                });

                return newOrder;
            });
            await prisma.operationStatus.update({
                where: {
                    id: operationId
                },
                data: {
                    status: Status.COMPLETED,
                    errorMessage: null,
                    updatedAt: new Date(),
                },
            });
            return order;
        } catch (error: any) {

            console.log(error.message);

            await prisma.operationStatus.update({
                where: {
                    id: operationId
                },
                data: {
                    status: Status.FAILED,
                    errorMessage: 'Failed to create order',
                    updatedAt: new Date(),
                },
            });

            if (error.code === 'P2002') {
                const field = error.meta?.target;
                return {
                    error: 'Unique constraint violation',
                    message: `The value for ${field} must be unique.`,
                };
            }

            if (error.code === 'P2003') {
                return {
                    error: 'Foreign key constraint violation',
                    message: 'The specified customer does not exist.',
                };
            }

            return {
                error: 'Internal server error',
                message: error.message || 'Failed to create order',
            };
        }
    }

    static async updateOrder(
        orderId: number,
        data: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<Order | ErrorResponse> {
        try {
            // If total is being updated, we need to adjust customer's total spending
            if ('total' in data) {
                return await prisma.$transaction(async (tx) => {
                    // Get the original order to calculate spending difference
                    const originalOrder = await tx.order.findUnique({
                        where: { id: orderId },
                    });

                    if (!originalOrder) {
                        throw new Error(`Order with ID ${orderId} not found.`);
                    }

                    const spendingDifference = new Decimal(data.cost || 0).minus(new Decimal(originalOrder.cost || 0));

                    // Update order
                    const updatedOrder = await tx.order.update({
                        where: { id: orderId },
                        data,
                        include: {
                            customer: true,
                        },
                    });

                    // Update customer's total spending
                    await tx.customer.update({
                        where: { id: updatedOrder.customerId },
                        data: {
                            totalSpending: {
                                increment: spendingDifference,
                            },
                        },
                    });

                    return updatedOrder;
                });
            }

            // If total is not being updated, simple update
            const order = await prisma.order.update({
                where: { id: orderId },
                data,
                include: {
                    customer: true,
                },
            });

            return order;
        } catch (error: any) {
            if (error.code === 'P2025') {
                return {
                    error: 'Not Found',
                    message: `Order with ID ${orderId} not found.`,
                };
            }

            return {
                error: 'Internal server error',
                message: error.message || 'Failed to update order',
            };
        }
    }

    static async deleteOrder(
        orderId: number
    ): Promise<{ success: true } | ErrorResponse> {
        try {
            // Delete order and update customer's total spending
            await prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId },
                });

                if (!order) {
                    throw new Error(`Order with ID ${orderId} not found.`);
                }

                // Update customer's total spending
                await tx.customer.update({
                    where: { id: order.customerId },
                    data: {
                        totalSpending: {
                            decrement: order.cost,
                        },
                    },
                });

                // Delete the order
                await tx.order.delete({
                    where: { id: orderId },
                });
            });

            return { success: true };
        } catch (error: any) {
            if (error.code === 'P2025') {
                return {
                    error: 'Not Found',
                    message: `Order with ID ${orderId} not found.`,
                };
            }

            return {
                error: 'Internal server error',
                message: error.message || 'Failed to delete order',
            };
        }
    }
}

export default OrderService;