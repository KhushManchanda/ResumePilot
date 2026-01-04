import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { generateHash } from '../utils/helpers';
import { getCachedPDF, cachePDF } from '../db/database';

const execAsync = promisify(exec);

export interface CompileResult {
    success: boolean;
    pdfPath?: string;
    pdfUrl?: string;
    logs: string;
    errors?: string[];
}

/**
 * Compile LaTeX to PDF using pdflatex
 * For v1, we use local pdflatex. Docker can be added later for security.
 */
export async function compileLatex(latexContent: string): Promise<CompileResult> {
    const contentHash = generateHash(latexContent);

    // Check cache first
    const cachedPath = getCachedPDF(contentHash);
    if (cachedPath && await fileExists(cachedPath)) {
        return {
            success: true,
            pdfPath: cachedPath,
            pdfUrl: `/pdfs/${path.basename(cachedPath)}`,
            logs: 'Using cached PDF'
        };
    }

    // Create temp directory for compilation
    const tempDir = path.join(process.cwd(), 'server/temp', `compile-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const texFile = path.join(tempDir, 'resume.tex');
    const pdfFile = path.join(tempDir, 'resume.pdf');

    try {
        // Write LaTeX file
        await fs.writeFile(texFile, latexContent);

        // Compile with pdflatex (run twice for references)
        const { stdout, stderr } = await execAsync(
            `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFile}"`,
            { timeout: 30000 }
        );

        // Check if PDF was created
        if (!(await fileExists(pdfFile))) {
            const logFile = path.join(tempDir, 'resume.log');
            let logs = '';
            try {
                logs = await fs.readFile(logFile, 'utf-8');
            } catch (e) {
                logs = stdout + '\n' + stderr;
            }

            return {
                success: false,
                logs,
                errors: parseLatexErrors(logs)
            };
        }

        // Move PDF to cache directory
        const cacheDir = process.env.PDF_CACHE_DIR || path.join(process.cwd(), 'server/cache/pdfs');
        await fs.mkdir(cacheDir, { recursive: true });

        const cachedPdfPath = path.join(cacheDir, `${contentHash}.pdf`);
        await fs.copyFile(pdfFile, cachedPdfPath);

        // Cache in database
        cachePDF(contentHash, cachedPdfPath);

        // Clean up temp directory
        await fs.rm(tempDir, { recursive: true, force: true });

        return {
            success: true,
            pdfPath: cachedPdfPath,
            pdfUrl: `/pdfs/${contentHash}.pdf`,
            logs: stdout
        };

    } catch (error: any) {
        // Clean up on error
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (e) { }

        return {
            success: false,
            logs: error.message,
            errors: [error.message]
        };
    }
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Parse LaTeX compilation errors from log
 */
function parseLatexErrors(log: string): string[] {
    const errors: string[] = [];
    const lines = log.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('!')) {
            errors.push(line);
            // Get next few lines for context
            if (i + 1 < lines.length) errors.push(lines[i + 1]);
        }
    }

    return errors.length > 0 ? errors : ['Compilation failed - check logs'];
}
