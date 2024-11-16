import { Router } from 'express';
import { createCampaign, getCampaign } from '../handlers/campaign.handler';

const router = Router();

router.post('/', createCampaign);
router.get('/:id', getCampaign);

export default router;
