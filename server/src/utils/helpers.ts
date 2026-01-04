/**
 * Escape special LaTeX characters to prevent compilation errors
 */
export function escapeLatex(text: string): string {
    if (!text) return '';

    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/{/g, '\\{')
        .replace(/}/g, '\\}')
        .replace(/%/g, '\\%')
        .replace(/&/g, '\\&')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\$/g, '\\$');
}

/**
 * Validate resume JSON against schema
 */
export function validateResumeJSON(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required top-level fields
    if (!data.resumeId) errors.push('Missing resumeId');
    if (!data.variantKey) errors.push('Missing variantKey');
    if (!['ai_ml', 'full_stack', 'backend_cloud'].includes(data.variantKey)) {
        errors.push('Invalid variantKey');
    }

    // Check heading
    if (!data.heading) {
        errors.push('Missing heading');
    } else {
        if (!data.heading.name) errors.push('Missing heading.name');
        if (!data.heading.email) errors.push('Missing heading.email');
        if (!Array.isArray(data.heading.links)) errors.push('heading.links must be array');
    }

    // Check arrays
    if (!Array.isArray(data.education)) errors.push('education must be array');
    if (!Array.isArray(data.experience)) errors.push('experience must be array');
    if (!Array.isArray(data.projects)) errors.push('projects must be array');

    // Check skills
    if (!data.skills) {
        errors.push('Missing skills');
    } else {
        if (!Array.isArray(data.skills.languages)) errors.push('skills.languages must be array');
        if (!Array.isArray(data.skills.frameworks)) errors.push('skills.frameworks must be array');
        if (!Array.isArray(data.skills.tools)) errors.push('skills.tools must be array');
        if (!Array.isArray(data.skills.core)) errors.push('skills.core must be array');
    }

    // Check metadata
    if (!data.metadata) {
        errors.push('Missing metadata');
    } else {
        if (!data.metadata.updatedAt) errors.push('Missing metadata.updatedAt');
        if (!Array.isArray(data.metadata.pageFitWarnings)) {
            errors.push('metadata.pageFitWarnings must be array');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate stable hash for caching
 */
export function generateHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
}
