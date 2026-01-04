'use client';

import { useState } from 'react';
import ChatPanel from '@/components/ChatPanel/ChatPanel';
import ResumeEditor from '@/components/ResumeEditor/ResumeEditor';
import PdfPreview from '@/components/PdfPreview/PdfPreview';
import TopBar from '@/components/TopBar';

type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

export default function Home() {
    const [currentVariant, setCurrentVariant] = useState<VariantKey>('ai_ml');
    const [selectedBulletId, setSelectedBulletId] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [resumeKey, setResumeKey] = useState(0); // For triggering resume reload

    const handleVariantChange = (variant: VariantKey) => {
        setCurrentVariant(variant);
        setSelectedBulletId(null);
        setPdfUrl(null);
        setResumeKey(prev => prev + 1);
    };

    const handleResumeUpdate = () => {
        // Trigger resume reload
        setResumeKey(prev => prev + 1);
    };

    const handlePdfCompiled = (url: string) => {
        setPdfUrl(url);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            <TopBar
                currentVariant={currentVariant}
                onVariantChange={handleVariantChange}
                onResumeUpdate={handleResumeUpdate}
                onPdfCompiled={handlePdfCompiled}
            />

            <div className="flex-1 grid grid-cols-[350px_1fr_450px] gap-0 overflow-hidden">
                <ChatPanel
                    variantKey={currentVariant}
                    selectedBulletId={selectedBulletId}
                    onResumeUpdate={handleResumeUpdate}
                />

                <ResumeEditor
                    variantKey={currentVariant}
                    resumeKey={resumeKey}
                    onBulletSelect={setSelectedBulletId}
                    onResumeUpdate={handleResumeUpdate}
                />

                <PdfPreview
                    variantKey={currentVariant}
                    pdfUrl={pdfUrl}
                    onPdfCompiled={handlePdfCompiled}
                />
            </div>
        </div>
    );
}
