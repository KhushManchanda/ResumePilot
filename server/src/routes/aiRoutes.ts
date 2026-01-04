import express, { Request, Response, Router } from 'express';
import { editBullet } from '../ai/editBullet';
import { editSection } from '../ai/editSection';
import { tailorToJob } from '../ai/tailorToJob';

const router: Router = express.Router();

/**
 * POST /api/ai/edit-bullet
 * Edit a single bullet using AI
 */
router.post('/ai/edit-bullet', async (req: Request, res: Response) => {
    try {
        const { variantKey, bulletId, instruction } = req.body;

        if (!variantKey || !bulletId || !instruction) {
            return res.status(400).json({
                error: 'Missing required fields: variantKey, bulletId, instruction'
            });
        }

        const result = await editBullet({ variantKey, bulletId, instruction });
        res.json(result);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ai/edit-section
 * Edit a section using AI
 */
router.post('/ai/edit-section', async (req: Request, res: Response) => {
    try {
        const { variantKey, sectionKey, entryId, instruction } = req.body;

        if (!variantKey || !sectionKey || !instruction) {
            return res.status(400).json({
                error: 'Missing required fields: variantKey, sectionKey, instruction'
            });
        }

        const result = await editSection({
            variantKey,
            sectionKey,
            entryId,
            instruction
        });

        res.json(result);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/ai/tailor
 * Tailor resume to job description
 */
router.post('/ai/tailor', async (req: Request, res: Response) => {
    try {
        const { variantKey, jobDescription, instruction } = req.body;

        if (!variantKey || !jobDescription) {
            return res.status(400).json({
                error: 'Missing required fields: variantKey, jobDescription'
            });
        }

        const result = await tailorToJob({
            variantKey,
            jobDescription,
            instruction
        });

        res.json(result);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
