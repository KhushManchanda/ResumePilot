import { getResume } from '../db/database';
import { callOpenAI, AIEditResult } from './openaiClient';
import { VariantKey } from '../types';

interface TailorToJobParams {
    variantKey: VariantKey;
    jobDescription: string;
    instruction?: string;
}

/**
 * Tailor resume to a specific job description
 */
export async function tailorToJob(params: TailorToJobParams): Promise<AIEditResult> {
    const { variantKey, jobDescription, instruction } = params;

    // Fetch current resume
    const resume = getResume(variantKey);
    if (!resume) {
        throw new Error(`Resume not found: ${variantKey}`);
    }

    // Create comprehensive prompt
    const prompt = `
Job Description:
${jobDescription}

Current Resume:
${JSON.stringify({
        experience: resume.experience,
        projects: resume.projects,
        skills: resume.skills
    }, null, 2)}

${instruction ? `Additional Instructions:\n${instruction}\n` : ''}

Task: Tailor this resume to match the job description.

Steps:
1. Extract key requirements, skills, and themes from the job description
2. Identify the most relevant bullets in experience and projects (use tags for relevance)
3. Select 3-4 most impactful bullets per experience entry
4. Rewrite selected bullets to align with job requirements WITHOUT inventing claims
5. Update skills section to prioritize relevant technologies

Constraints:
- Max 3-4 bullets per experience entry
- Max 50 words per bullet
- Must maintain truthfulness - no fabricated achievements
- Keep quantified metrics only if they exist
- ATS-safe formatting (no special characters)

Generate JSON Patch operations to transform the resume.
Include both "/experience" and "/projects" and "/skills" modifications.
Provide rationale for selection and rewriting decisions.
`;

    return await callOpenAI(prompt);
}
