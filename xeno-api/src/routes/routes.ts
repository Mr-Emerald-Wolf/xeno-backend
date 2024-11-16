import { Router } from 'express';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';
import statusRoutes from './status.routes';
import audienceRoutes from './audience.routes';
import campaignRoutes from './campaign.routes';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/status', statusRoutes);
router.use('/audience', audienceRoutes);
router.use('/campaign', campaignRoutes);

export default router;
