import { prisma } from '../../server';
import axios from 'axios';

class CampaignService {
    static async createAndSendCampaign(audienceSegmentId: number, message: string): Promise<any> {
        try {
            const campaign = await prisma.campaign.create({
                data: {
                    audienceSegmentId,
                    message,
                    scheduledAt: new Date(),
                },
            });


            const successRate = Math.random()
            await this.sendMessageToDeliveryAPI(message, audienceSegmentId, successRate);

            return { message: 'Campaign is being processed and sent to Delivery API.' };
        } catch (error: any) {
            return { error: error.message || 'Failed to create and send campaign.' };
        }
    }
    static async getCampaignsForAudienceSegment(audienceSegmentId: number) {
        try {
            const campaigns = await prisma.campaign.findMany({
                where: {
                    audienceSegmentId,
                },
                include: {
                    audienceSegment: true,
                },
            });

            return campaigns;
        } catch (error: any) {
            throw new Error('Failed to retrieve campaigns for the audience segment.');
        }
    }


    // Method to simulate sending the campaign to the Delivery API with a random status
    private static async sendMessageToDeliveryAPI(message: String, audienceSegmentId: Number, successRate: Number) {
        try {
            const deliveryApiUrl = 'http://localhost:7070/delivery';

            // Sending a POST request to the Delivery API with the campaign message and status
            const response = await axios.post(deliveryApiUrl, {
                message: message,
                successRate: successRate,
                audienceSegmentId: audienceSegmentId,
            });

            console.log(`Campaign message sent to delivery API with response: ${response.status}`);
        } catch (error: any) {
            console.error('Error sending campaign message to Delivery API:', error);
        }
    }
}

export default CampaignService;
