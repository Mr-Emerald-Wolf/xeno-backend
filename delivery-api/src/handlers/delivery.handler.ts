import { Request, Response } from 'express';
import DeliveryService from '../services/delivery.service';

export const deliverMessageToAudienceSegment = async (req: Request, res: Response) => {
    const { audienceSegmentId, message } = req.body;

    if (!audienceSegmentId || !message) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Audience Segment ID and Message are required.',
        });
        return
    }

    try {
        const result = await DeliveryService.deliverMessageToAudienceSegment(audienceSegmentId, message);

        res.status(200).json({
            message: 'Messages sent to RabbitMQ deliveryQueue successfully.',
            customerCount: result.customerCount,
        });
        return
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to send messages to deliveryQueue.',
        });
        return
    }
};
