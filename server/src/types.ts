export type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

export interface Link {
    label: string;
    url: string;
}

export interface Heading {
    name: string;
    email: string;
    links: Link[];
}

export interface Degree {
    degree: string;
    gpa?: string;
    dates: string;
}

export interface Education {
    id: string;
    school: string;
    location: string;
    degrees: Degree[];
}

export interface Bullet {
    id: string;
    text: string;
    tags: string[];
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    location: string;
    dates: string;
    bullets: Bullet[];
}

export interface Project {
    id: string;
    name: string;
    stack: string;
    dates?: string;
    bullets: Bullet[];
}

export interface Skills {
    languages: string[];
    frameworks: string[];
    tools: string[];
    core: string[];
}

export interface ResumeMetadata {
    updatedAt: string;
    lastCompiledHash?: string;
    pageFitWarnings: string[];
}

export interface ResumeJSON {
    resumeId: string;
    variantKey: VariantKey;
    heading: Heading;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: Skills;
    metadata: ResumeMetadata;
}

export interface ResumeVersion {
    id: number;
    variantKey: VariantKey;
    jsonContent: string;
    note?: string;
    createdAt: string;
}

export interface CompiledPDF {
    id: number;
    latexHash: string;
    pdfPath: string;
    createdAt: string;
}
