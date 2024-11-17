import { Request, Response } from 'express';
import AudienceSegmentService from '../services/audience.service';

interface Condition {
    field: string;
    operator: string;
    value: string;
}

interface Conditions {
    operator: 'AND' | 'OR';
    conditions: Condition[];
}

// Create Audience Segment
export const createAudienceSegment = async (req: Request, res: Response) => {
    const { name, conditions } = req.body;

    if (!name || !conditions) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Name and conditions are required to create an audience segment.',
        });
        return
    }

    // Validate conditions
    const validationError = validateConditions(conditions);
    if (validationError) {
        res.status(400).json({
            error: 'Bad Request',
            message: validationError,
        });
        return
    }

    try {
        const result = await AudienceSegmentService.createAudienceSegment(name, conditions);

        if ('error' in result) {
            res.status(500).json(result);
            return
        }

        res.status(201).json({
            message: 'Audience Segment created successfully',
            segment: result
        });
        return
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to create audience segment.',
        });
        return
    }
};

// Update Audience Segment
export const updateAudienceSegment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, conditions } = req.body;

    if (!name || !conditions) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Name and conditions are required to update an audience segment.',
        });
        return
    }

    // Validate conditions
    const validationError = validateConditions(conditions);
    if (validationError) {
        res.status(400).json({
            error: 'Bad Request',
            message: validationError,
        });
        return
    }

    try {
        const result = await AudienceSegmentService.updateAudienceSegment(parseInt(id, 10), conditions, name);

        if ('error' in result) {
            res.status(500).json(result);
            return
        }

        res.status(200).json({
            message: 'Audience Segment updated successfully',
            segment: result
        });
        return
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to update audience segment.',
        });
        return
    }
};

// Delete Audience Segment
export const deleteAudienceSegment = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await AudienceSegmentService.deleteAudienceSegment(parseInt(id, 10));

        if ('error' in result) {
            res.status(404).json(result);
            return
        }

        res.status(200).json({
            message: `Audience Segment with ID ${id} deleted successfully`,
            segment: result,
        });
        return
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to delete audience segment.',
        });
        return
    }
};

const validateConditions = (conditions: Conditions): string | null => {
    if (!conditions || typeof conditions !== 'object') {
        return 'Conditions must be an object.';
    }

    if (!['AND', 'OR'].includes(conditions.operator)) {
        return 'Conditions must have a valid operator ("AND" or "OR").';
    }

    if (!Array.isArray(conditions.conditions)) {
        return 'Conditions must include an array of sub-conditions.';
    }

    for (const condition of conditions.conditions) {
        const { field, operator, value } = condition;

        if (!field || typeof field !== 'string') {
            return 'Each condition must have a valid "field".';
        }

        if (!['>', '<', '>=', '<=', '='].includes(operator)) {
            return `Condition operator "${operator}" is invalid. Use one of ">", "<", ">=", "<=", "=".`;
        }

        if (value === undefined || value === null || value === '') {
            return 'Each condition must have a valid "value".';
        }
    }

    return null;
};

export const calculateAudienceSize = async (req: Request, res: Response) => {
    const { conditions } = req.body;

    if (!conditions) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Conditions are required to calculate audience size.',
        });
        return
    }

    // Validate conditions
    const validationError = validateConditions(conditions);
    if (validationError) {
        res.status(400).json({
            error: 'Bad Request',
            message: validationError,
        });
        return
    }

    try {
        const size = await AudienceSegmentService.calculateAudienceSegmentSize(conditions);

        res.status(200).json({
            message: 'Audience size calculated successfully',
            size,
        });
        return
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to calculate audience size.',
        });
        return
    }
};

export const getAllAudienceSegments = async (req: Request, res: Response) => {
    try {
        const segments = await AudienceSegmentService.getAllAudienceSegments();

        if ('error' in segments) {
            res.status(500).json(segments);
            return
        }

        if (!segments || segments.length === 0) {
            res.status(404).json({
                error: 'Not Found',
                message: 'No audience segments found.',
            });
            return
        }

        res.status(200).json({
            message: 'Audience segments retrieved successfully',
            segments,
        });
        return
    } catch (error: any) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Failed to retrieve audience segments.',
        });
        return
    }
};
