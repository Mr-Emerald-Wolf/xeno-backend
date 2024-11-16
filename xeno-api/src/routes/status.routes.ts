// routes/status.routes.ts
import { Router } from 'express';
import { GetOperationStatus } from '../handlers/status.handler';

const router = Router();

router.get('/:customerId', GetOperationStatus);

export default router;
