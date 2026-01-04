'use client';

import { useState } from 'react';

type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

interface TopBarProps {
    currentVariant: VariantKey;
    onVariantChange: (variant: VariantKey) => void;
    onResumeUpdate: () => void;
    onPdfCompiled: (url: string) => void;
}

const VARIANTS = {
    ai_ml: 'AI/ML Engineer',
    full_stack: 'Full-Stack Developer',
    backend_cloud: 'Backend/Cloud Engineer'
};

export default function TopBar({
    currentVariant,
    onVariantChange,
    onResumeUpdate,
    onPdfCompiled
}: TopBarProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);

    const handleSaveVersion = async () => {
        const note = prompt('Add a note for this version (optional):');

        setIsSaving(true);
        try {
            const response = await fetch('/api/resume/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantKey: currentVariant, note })
            });

            if (!response.ok) throw new Error('Failed to save version');

            const data = await response.json();
            alert(`Version saved successfully! (ID: ${data.versionId})`);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save version');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportPdf = async () => {
        setIsCompiling(true);
        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantKey: currentVariant })
            });

            if (!response.ok) throw new Error('Compilation failed');

            const data = await response.json();
            onPdfCompiled(data.pdfUrl);

            // Download PDF
            const link = document.createElement('a');
            link.href = data.pdfUrl;
            link.download = `resume_${currentVariant}_${Date.now()}.pdf`;
            link.click();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export PDF');
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ✈️ ResumePilot
                </h1>

                <select
                    value={currentVariant}
                    onChange={(e) => onVariantChange(e.target.value as VariantKey)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    {Object.entries(VARIANTS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={handleSaveVersion}
                    disabled={isSaving}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? 'Saving...' : '💾 Save Version'}
                </button>

                <button
                    onClick={() => alert('Diff view coming soon!')}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-md transition-colors"
                >
                    📊 View Diff
                </button>

                <button
                    onClick={handleExportPdf}
                    disabled={isCompiling}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {isCompiling ? 'Compiling...' : '📄 Export PDF'}
                </button>
            </div>
        </div>
    );
}
