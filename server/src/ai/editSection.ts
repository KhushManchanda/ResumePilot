import { getResume } from '../db/database';
import { callOpenAI, AIEditResult } from './openaiClient';
import { VariantKey } from '../types';

type SectionKey = 'education' | 'experience' | 'projects' | 'skills' | 'heading';

interface EditSectionParams {
    variantKey: VariantKey;
    sectionKey: SectionKey;
    entryId?: string;
    instruction: string;
}

/**
 * Edit a resume section using AI
 */
export async function editSection(params: EditSectionParams): Promise<AIEditResult> {
    const { variantKey, sectionKey, entryId, instruction } = params;

    // Fetch current resume
    const resume = getResume(variantKey);
    if (!resume) {
        throw new Error(`Resume not found: ${variantKey}`);
    }

    let sectionContent = '';
    let sectionPath = `/${sectionKey}`;

    // Get section content
    if (sectionKey === 'heading') {
        sectionContent = JSON.stringify(resume.heading, null, 2);
    } else if (sectionKey === 'skills') {
        sectionContent = JSON.stringify(resume.skills, null, 2);
    } else if (sectionKey === 'education') {
        if (entryId) {
            const entry = resume.education.find(e => e.id === entryId);
            if (!entry) throw new Error(`Education entry not found: ${entryId}`);
            const index = resume.education.indexOf(entry);
            sectionContent = JSON.stringify(entry, null, 2);
            sectionPath = `/education/${index}`;
        } else {
            sectionContent = JSON.stringify(resume.education, null, 2);
        }
    } else if (sectionKey === 'experience') {
        if (entryId) {
            const entry = resume.experience.find(e => e.id === entryId);
            if (!entry) throw new Error(`Experience entry not found: ${entryId}`);
            const index = resume.experience.indexOf(entry);
            sectionContent = JSON.stringify(entry, null, 2);
            sectionPath = `/experience/${index}`;
        } else {
            sectionContent = JSON.stringify(resume.experience, null, 2);
        }
    } else if (sectionKey === 'projects') {
        if (entryId) {
            const entry = resume.projects.find(p => p.id === entryId);
            if (!entry) throw new Error(`Project entry not found: ${entryId}`);
            const index = resume.projects.indexOf(entry);
            sectionContent = JSON.stringify(entry, null, 2);
            sectionPath = `/projects/${index}`;
        } else {
            sectionContent = JSON.stringify(resume.projects, null, 2);
        }
    }

    // Create prompt for OpenAI
    const prompt = `
Current resume section (${sectionKey}):
${sectionContent}

Base path for JSON Patch operations: ${sectionPath}

User instruction:
${instruction}

Generate JSON Patch operations to modify this section according to the instruction.

Remember:
- Return precise JSON Patch operations relative to the base path
- Do not invent metrics or achievements
- Keep content concise and impactful
- Use action verbs for bullets
- Make it ATS-friendly
`;

    return await callOpenAI(prompt);
}
