// handlers/status.handler.ts
import { Request, Response } from 'express';
import StatusService from '../services/status.service';

export const GetOperationStatus = async (req: Request, res: Response) => {
    try {
        const customerId = Number(req.params.customerId);

        if (isNaN(customerId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid customer ID. Must be a number.'
            });
            return
        }

        const statuses = await StatusService.getOperationStatusByCustomerId(customerId);

        if ('error' in statuses) {
            res.status(404).json({
                success: false,
                error: statuses.error
            });
            return
        }

        res.status(200).json({
            success: true,
            data: statuses
        });
        return
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
        return
    }
};