import { Router } from 'express';
import {
    createAudienceSegment,
    updateAudienceSegment,
    deleteAudienceSegment,
} from '../handlers/audience.handler'; 

const router = Router();

router.post('/', createAudienceSegment);

router.put('/:id', updateAudienceSegment);

router.delete('/:id', deleteAudienceSegment);

export default router;
