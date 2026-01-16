
import { processVoiceLog } from '../src/lib/voiceService.js';

export default async function handler(req, res) {
    // CORS policy
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, text, secret } = req.body;

    // Simple secret key protection (optional but recommended)
    // You can set VOICE_SECRET in Vercel env
    if (process.env.VOICE_SECRET && secret !== process.env.VOICE_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!userId || !text) {
        return res.status(400).json({ error: 'Missing userId or text' });
    }

    const result = await processVoiceLog(userId, text);

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(500).json(result);
    }
}
