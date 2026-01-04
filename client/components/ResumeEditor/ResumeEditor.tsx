'use client';

import { useState, useEffect } from 'react';

type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

interface ResumeJSON {
    resumeId: string;
    variantKey: VariantKey;
    heading: {
        name: string;
        email: string;
        links: Array<{ label: string; url: string }>;
    };
    education: Array<{
        id: string;
        school: string;
        location: string;
        degrees: Array<{
            degree: string;
            gpa?: string;
            dates: string;
        }>;
    }>;
    experience: Array<{
        id: string;
        company: string;
        role: string;
        location: string;
        dates: string;
        bullets: Array<{
            id: string;
            text: string;
            tags: string[];
        }>;
    }>;
    projects: Array<{
        id: string;
        name: string;
        stack: string;
        dates?: string;
        bullets: Array<{
            id: string;
            text: string;
            tags: string[];
        }>;
    }>;
    skills: {
        languages: string[];
        frameworks: string[];
        tools: string[];
        core: string[];
    };
    metadata: {
        updatedAt: string;
        lastCompiledHash?: string;
        pageFitWarnings: string[];
    };
}

interface ResumeEditorProps {
    variantKey: VariantKey;
    resumeKey: number;
    onBulletSelect: (bulletId: string | null) => void;
    onResumeUpdate: () => void;
}

export default function ResumeEditor({
    variantKey,
    resumeKey,
    onBulletSelect,
    onResumeUpdate
}: ResumeEditorProps) {
    const [resume, setResume] = useState<ResumeJSON | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        heading: true,
        education: true,
        experience: true,
        projects: true,
        skills: true
    });

    useEffect(() => {
        fetchResume();
    }, [variantKey, resumeKey]);

    const fetchResume = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/resume?variantKey=${variantKey}`);
            if (!response.ok) throw new Error('Failed to fetch resume');
            const data = await response.json();
            setResume(data);
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to load resume');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-slate-900">
                <div className="text-gray-500 dark:text-gray-400">Loading resume...</div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-slate-900">
                <div className="text-red-500">Failed to load resume</div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Heading Section */}
                <Section
                    title="Heading"
                    isExpanded={expandedSections.heading}
                    onToggle={() => toggleSection('heading')}
                >
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={resume.heading.name}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={resume.heading.email}
                                readOnly
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Links
                            </label>
                            {resume.heading.links.map((link, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={link.label}
                                        readOnly
                                        placeholder="Label"
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={link.url}
                                        readOnly
                                        placeholder="URL"
                                        className="flex-[2] px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Education Section */}
                <Section
                    title="Education"
                    isExpanded={expandedSections.education}
                    onToggle={() => toggleSection('education')}
                >
                    <div className="space-y-4">
                        {resume.education.map((edu, idx) => (
                            <div key={edu.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={edu.school}
                                        readOnly
                                        placeholder="School"
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={edu.location}
                                        readOnly
                                        placeholder="Location"
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                {edu.degrees.map((degree, dIdx) => (
                                    <div key={dIdx} className="grid grid-cols-3 gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={degree.degree}
                                            readOnly
                                            placeholder="Degree"
                                            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={degree.gpa || ''}
                                            readOnly
                                            placeholder="GPA"
                                            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="text"
                                            value={degree.dates}
                                            readOnly
                                            placeholder="Dates"
                                            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Experience Section */}
                <Section
                    title="Experience"
                    isExpanded={expandedSections.experience}
                    onToggle={() => toggleSection('experience')}
                >
                    <div className="space-y-4">
                        {resume.experience.map((exp) => (
                            <div key={exp.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={exp.company}
                                        readOnly
                                        className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={exp.role}
                                        readOnly
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={exp.location}
                                        readOnly
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={exp.dates}
                                        readOnly
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Bullets:</div>
                                    {exp.bullets.map((bullet) => (
                                        <div
                                            key={bullet.id}
                                            onClick={() => onBulletSelect(bullet.id)}
                                            className="group flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                                            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{bullet.text}</p>
                                            <button className="opacity-0 group-hover:opacity-100 text-xs text-primary-600 dark:text-primary-400">
                                                ✏️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Projects Section */}
                <Section
                    title="Projects"
                    isExpanded={expandedSections.projects}
                    onToggle={() => toggleSection('projects')}
                >
                    <div className="space-y-4">
                        {resume.projects.map((proj) => (
                            <div key={proj.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={proj.name}
                                        readOnly
                                        className="px-3 py-2 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="text"
                                        value={proj.stack}
                                        readOnly
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Bullets:</div>
                                    {proj.bullets.map((bullet) => (
                                        <div
                                            key={bullet.id}
                                            onClick={() => onBulletSelect(bullet.id)}
                                            className="group flex items-start gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                                            <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{bullet.text}</p>
                                            <button className="opacity-0 group-hover:opacity-100 text-xs text-primary-600 dark:text-primary-400">
                                                ✏️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Skills Section */}
                <Section
                    title="Technical Skills"
                    isExpanded={expandedSections.skills}
                    onToggle={() => toggleSection('skills')}
                >
                    <div className="space-y-3">
                        <SkillGroup label="Languages" items={resume.skills.languages} />
                        <SkillGroup label="Frameworks" items={resume.skills.frameworks} />
                        <SkillGroup label="Tools" items={resume.skills.tools} />
                        <SkillGroup label="Core Competencies" items={resume.skills.core} />
                    </div>
                </Section>
            </div>
        </div>
    );
}

// Section Accordion Component
function Section({
    title,
    isExpanded,
    onToggle,
    children
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <span className="text-gray-500 dark:text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                </span>
            </button>
            {isExpanded && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
}

// Skills Group Component
function SkillGroup({ label, items }: { label: string; items: string[] }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
