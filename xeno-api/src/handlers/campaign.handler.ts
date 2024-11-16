import { Request, Response } from 'express';
import CampaignService from '../services/campaign.service';

export const createCampaign = async (req: Request, res: Response) => {
    const { name, audienceSegmentId, message } = req.body;

    if (!audienceSegmentId || !message) {
        res.status(400).json({ error: 'Audience Segment ID and Message are required.' });
    }

    if (!message.includes('[Name]')) {
        res.status(400).json({ error: 'Message must contain the placeholder "[Name]".' });
    }

    try {
        const result = await CampaignService.createAndSendCampaign(audienceSegmentId, message);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getCampaign = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ error: 'Audience Segment ID is required.' });
        return
    }

    try {
        const campaigns = await CampaignService.getCampaignsForAudienceSegment(Number(id));

        if (campaigns.length === 0) {
            res.status(404).json({ message: 'No campaigns found for the given audience segment.' });
            return
        }

        res.status(200).json({ campaigns });
        return
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
        return
    }
};
