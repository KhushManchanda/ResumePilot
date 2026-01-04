import express, { Request, Response, Router } from 'express';
import { getResume, saveResume, createVersion, getVersions, getVersion } from '../db/database';
import { applyPatch, validate } from 'fast-json-patch';
import { validateResumeJSON } from '../utils/helpers';
import { VariantKey, ResumeJSON } from '../types';

const router: Router = express.Router();

/**
 * GET /api/resume?variantKey=ai_ml
 * Fetch current resume JSON for a variant
 */
router.get('/resume', (req: Request, res: Response) => {
    try {
        const variantKey = req.query.variantKey as VariantKey;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        const resume = getResume(variantKey);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        res.json(resume);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/resume/save
 * Save current resume as a new version
 */
router.post('/resume/save', (req: Request, res: Response) => {
    try {
        const { variantKey, note } = req.body;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        const versionId = createVersion(variantKey, note);

        res.json({
            success: true,
            versionId,
            message: 'Version saved successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/resume/versions?variantKey=ai_ml
 * Get all versions for a variant
 */
router.get('/resume/versions', (req: Request, res: Response) => {
    try {
        const variantKey = req.query.variantKey as VariantKey;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        const versions = getVersions(variantKey);
        res.json(versions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/resume/version/:id
 * Get a specific version
 */
router.get('/resume/version/:id', (req: Request, res: Response) => {
    try {
        const versionId = parseInt(req.params.id);
        const version = getVersion(versionId);

        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        res.json({
            ...version,
            resume: JSON.parse(version.jsonContent)
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/resume/apply-patch
 * Apply JSON Patch operations to resume
 */
router.post('/resume/apply-patch', (req: Request, res: Response) => {
    try {
        const { variantKey, patches } = req.body;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        if (!Array.isArray(patches)) {
            return res.status(400).json({ error: 'Patches must be an array' });
        }

        // Get current resume
        const resume = getResume(variantKey);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Validate patches
        const validationErrors = validate(patches, resume);
        if (validationErrors) {
            return res.status(400).json({
                error: 'Invalid patches',
                details: validationErrors
            });
        }

        // Apply patches
        const patchResult = applyPatch(resume, patches, true);
        const updatedResume = patchResult.newDocument as ResumeJSON;

        // Validate resulting JSON
        const validation = validateResumeJSON(updatedResume);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Patched resume is invalid',
                validationErrors: validation.errors
            });
        }

        // Update timestamp
        updatedResume.metadata.updatedAt = new Date().toISOString();

        // Save to database
        saveResume(updatedResume);

        res.json({
            success: true,
            resume: updatedResume
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
