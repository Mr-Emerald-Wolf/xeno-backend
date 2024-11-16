import { Router } from 'express';
import { deliverMessageToAudienceSegment } from '../handlers/delivery.handler';

const router = Router();

// Route to deliver messages to customers in an audience segment
router.post('/', deliverMessageToAudienceSegment);

export default router;
