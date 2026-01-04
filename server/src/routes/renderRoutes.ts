import express, { Request, Response, Router } from 'express';
import path from 'path';
import { getResume, updateCompiledHash } from '../db/database';
import { renderResumeBody, injectIntoTemplate } from '../render/latexRenderer';
import { compileLatex } from '../compile/compiler';
import { generateHash } from '../utils/helpers';
import { VariantKey } from '../types';

const router: Router = express.Router();

/**
 * POST /api/render
 * Render resume JSON to LaTeX
 */
router.post('/render', (req: Request, res: Response) => {
    try {
        const { variantKey } = req.body;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        const resume = getResume(variantKey);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Render resume body
        const body = renderResumeBody(resume);

        // Inject into template
        const templatePath = path.join(__dirname, '../../templates/template.tex');
        const latex = injectIntoTemplate(body, templatePath);

        res.json({
            success: true,
            latex
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/compile
 * Compile resume to PDF
 */
router.post('/compile', async (req: Request, res: Response) => {
    try {
        const { variantKey } = req.body;

        if (!variantKey || !['ai_ml', 'full_stack', 'backend_cloud'].includes(variantKey)) {
            return res.status(400).json({ error: 'Invalid variant key' });
        }

        const resume = getResume(variantKey);
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Render LaTeX
        const body = renderResumeBody(resume);
        const templatePath = path.join(__dirname, '../../templates/template.tex');
        const latex = injectIntoTemplate(body, templatePath);

        // Compile to PDF
        const result = await compileLatex(latex);

        if (!result.success) {
            return res.status(500).json({
                error: 'Compilation failed',
                logs: result.logs,
                errors: result.errors
            });
        }

        // Update compiled hash in database
        const latexHash = generateHash(latex);
        updateCompiledHash(variantKey, latexHash);

        res.json({
            success: true,
            pdfUrl: result.pdfUrl,
            pdfPath: result.pdfPath,
            logs: result.logs
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
