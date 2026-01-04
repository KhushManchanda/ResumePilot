import { getResume } from '../db/database';
import { callOpenAI, AIEditResult } from './openaiClient';
import { VariantKey } from '../types';

interface EditBulletParams {
    variantKey: VariantKey;
    bulletId: string;
    instruction: string;
}

/**
 * Edit a single resume bullet using AI
 */
export async function editBullet(params: EditBulletParams): Promise<AIEditResult> {
    const { variantKey, bulletId, instruction } = params;

    // Fetch current resume
    const resume = getResume(variantKey);
    if (!resume) {
        throw new Error(`Resume not found: ${variantKey}`);
    }

    // Find the bullet
    let bulletText = '';
    let bulletPath = '';

    // Search in experience
    for (let i = 0; i < resume.experience.length; i++) {
        const exp = resume.experience[i];
        for (let j = 0; j < exp.bullets.length; j++) {
            if (exp.bullets[j].id === bulletId) {
                bulletText = exp.bullets[j].text;
                bulletPath = `/experience/${i}/bullets/${j}/text`;
                break;
            }
        }
        if (bulletText) break;
    }

    // Search in projects if not found
    if (!bulletText) {
        for (let i = 0; i < resume.projects.length; i++) {
            const proj = resume.projects[i];
            for (let j = 0; j < proj.bullets.length; j++) {
                if (proj.bullets[j].id === bulletId) {
                    bulletText = proj.bullets[j].text;
                    bulletPath = `/projects/${i}/bullets/${j}/text`;
                    break;
                }
            }
            if (bulletText) break;
        }
    }

    if (!bulletText) {
        throw new Error(`Bullet not found: ${bulletId}`);
    }

    // Create prompt for OpenAI
    const prompt = `
Current resume bullet:
"${bulletText}"

User instruction:
${instruction}

Generate a JSON Patch operation to modify this bullet. The path is: ${bulletPath}

Remember:
- Do not invent metrics or achievements
- Keep it concise and impactful
- Use action verbs
- Make it ATS-friendly
`;

    return await callOpenAI(prompt);
}
