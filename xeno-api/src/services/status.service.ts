import { prisma } from '../../server';

interface ErrorResponse {
    error: string;
    message: string;
}

class StatusService {
    static async getOperationStatusByCustomerId(
        customerId: number
    ): Promise<any[] | ErrorResponse> {
        try {

            const statuses = await prisma.operationStatus.findMany({
                where: { customerId },
                orderBy: { createdAt: 'desc' },
            });

            if (!statuses.length) {
                return {
                    error: 'Not Found',
                    message: `No operation statuses found for customer with ID ${customerId}.`,
                };
            }

            return statuses;
        } catch (error: any) {
            return {
                error: 'Internal server error',
                message: error.message || 'Failed to fetch operation statuses',
            };
        }
    }
}

export default StatusService;
