import OpenAI from 'openai';
import { Operation } from 'fast-json-patch';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface AIEditResult {
    patches: Operation[];
    rationale: string;
    warnings: string[];
}

const SYSTEM_PROMPT = `You are a resume editing assistant. Your job is to modify resume content based on user instructions.

CRITICAL RULES:
1. Return ONLY JSON Patch (RFC 6902) operations - never full object replacements
2. NEVER invent or fabricate metrics, achievements, or claims
3. Only quantify impact if the information already exists or is strongly implied
4. Keep bullets concise (max 50 words) and action-oriented
5. Use strong action verbs (developed, implemented, designed, led, etc.)
6. Avoid special characters that break LaTeX
7. Make content ATS-friendly (no tables, images, or complex formatting)
8. Focus on impact and results, not just responsibilities

Output format:
{
  "patches": [{ "op": "replace", "path": "/experience/0/bullets/1/text", "value": "new text" }],
  "rationale": "Brief explanation of changes",
  "warnings": ["Any concerns or limitations"]
}`;

/**
 * Helper to call OpenAI with structured output
 */
async function callOpenAI(userPrompt: string): Promise<AIEditResult> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('Empty response from OpenAI');

        const result = JSON.parse(content);

        // Validate structure
        if (!result.patches || !Array.isArray(result.patches)) {
            throw new Error('Invalid response: missing patches array');
        }

        return {
            patches: result.patches,
            rationale: result.rationale || 'No rationale provided',
            warnings: result.warnings || []
        };

    } catch (error: any) {
        console.error('OpenAI API error:', error);
        throw new Error(`AI editing failed: ${error.message}`);
    }
}

export { callOpenAI };
