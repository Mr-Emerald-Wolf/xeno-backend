import { Router } from 'express';
import {
    createAudienceSegment,
    updateAudienceSegment,
    deleteAudienceSegment,
    calculateAudienceSize,
    getAllAudienceSegments,
} from '../handlers/audience.handler';

const router = Router();

router.post('/', createAudienceSegment);

router.post('/size', calculateAudienceSize);

router.get('/all', getAllAudienceSegments);

router.put('/:id', updateAudienceSegment);

router.delete('/:id', deleteAudienceSegment);

export default router;
