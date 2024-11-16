import OrderService from '../services/order.service';
import { Decimal } from '@prisma/client/runtime/library';
interface data {
    id: number
    customerId: number
    orderId: number
    operationId: number
    operation: string
    orderDate: Date
    revenue: Decimal
    cost: Decimal
}
enum OperationType {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE'
}

export const orderQueueHandler = async (data: data) => {
    try {
        switch (data.operation) {
            case OperationType.INSERT:
                const newOrder = {
                    customerId: data.customerId,
                    orderDate: data.orderDate,
                    revenue: data.revenue,
                    cost: data.cost
                };
                await OrderService.createOrder(newOrder, data.operationId);
                break;

            case OperationType.UPDATE:
                await OrderService.updateOrder(data.id, {
                    customerId: data.customerId,
                    orderDate: data.orderDate,
                    revenue: data.revenue,
                    cost: data.cost
                });
                break;

            case OperationType.DELETE:
                await OrderService.deleteOrder(data.id);
                break;

            default:
                console.error(`Unknown operation: ${data.operation}`);
        }
    } catch (error) {
        console.error('Error handling order queue message:', error);
    }
};
