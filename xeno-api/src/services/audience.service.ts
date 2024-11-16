import { prisma } from '../../server';

interface ErrorResponse {
    error: string;
    message: string;
}

interface Condition {
    field: string;
    operator: string;
    value: string;
}

interface Conditions {
    operator: 'AND' | 'OR';
    conditions: Condition[];
}

interface AudienceSegmentWithSize {
    segment: any;
    audienceSize: number;
    matchingCustomers: any[];
}

class AudienceSegmentService {
    static async createAudienceSegment(
        name: string,
        conditions: Conditions
    ): Promise<AudienceSegmentWithSize | ErrorResponse> {
        try {
            const customerConditions = this.generateCustomerQueryConditions(conditions);

            // Fetch the matching customers based on the provided conditions
            const matchingCustomers = await prisma.customer.findMany({
                where: customerConditions,
            });

            // Create the new audience segment and associate matching customers
            const newSegment = await prisma.audienceSegment.create({
                data: {
                    name,
                    conditions: JSON.stringify(conditions),
                    customers: {
                        connect: matchingCustomers.map((customer) => ({
                            id: customer.id,
                        })),
                    },
                },
            });

            // Return the AudienceSegment and audience size
            return {
                segment: newSegment,
                audienceSize: matchingCustomers.length,
                matchingCustomers,
            };
        } catch (error: any) {
            return {
                error: 'Internal server error',
                message: error.message || 'Failed to create audience segment',
            };
        }
    }

    static async updateAudienceSegment(
        id: number,
        updatedConditions: Conditions,
        updatedName: string
    ): Promise<AudienceSegmentWithSize | ErrorResponse> {
        try {
            const customerConditions = this.generateCustomerQueryConditions(updatedConditions);
            const matchingCustomers = await prisma.customer.findMany({
                where: customerConditions,
            });

            const updatedSegment = await prisma.audienceSegment.update({
                where: { id },
                data: {
                    name: updatedName,
                    conditions: JSON.stringify(updatedConditions),
                },
            });

            return {
                segment: updatedSegment,
                audienceSize: matchingCustomers.length,
                matchingCustomers,
            };
        } catch (error: any) {
            return {
                error: 'Internal server error',
                message: error.message || 'Failed to update audience segment',
            };
        }
    }

    static async deleteAudienceSegment(id: number): Promise<any | ErrorResponse> {
        try {
            // First, get the audience segment to ensure it exists
            const segmentToDelete = await prisma.audienceSegment.findUnique({
                where: { id },
            });

            if (!segmentToDelete) {
                return {
                    error: 'Not Found',
                    message: `Audience Segment with ID ${id} not found`,
                };
            }

            // Delete the AudienceSegment
            const deletedSegment = await prisma.audienceSegment.delete({
                where: { id },
            });

            // Return the deleted segment info
            return deletedSegment;
        } catch (error: any) {
            return {
                error: 'Internal server error',
                message: error.message || 'Failed to delete audience segment',
            };
        }
    }

    private static generateCustomerQueryConditions(conditions: Conditions): object {
        let queryConditions: any = {};

        if (conditions.operator === 'AND' && conditions.conditions) {
            conditions.conditions.forEach((condition) => {
                switch (condition.field) {
                    case 'totalSpending':
                        queryConditions.totalSpending = {
                            [this.getPrismaOperator(condition.operator)]: parseFloat(condition.value),
                        };
                        break;
                    case 'visits':
                        queryConditions.visits = {
                            [this.getPrismaOperator(condition.operator)]: parseInt(condition.value),
                        };
                        break;
                    default:
                        break;
                }
            });
        }

        return queryConditions;
    }

    private static getPrismaOperator(operator: string): string {
        switch (operator) {
            case '>':
                return 'gt';
            case '<':
                return 'lt';
            case '>=':
                return 'gte';
            case '<=':
                return 'lte';
            case '=':
                return 'equals';
            default:
                return 'equals';
        }
    }
}

export default AudienceSegmentService;
