'use client';

import { useState, useEffect } from 'react';

type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

interface PdfPreviewProps {
    variantKey: VariantKey;
    pdfUrl: string | null;
    onPdfCompiled: (url: string) => void;
}

export default function PdfPreview({
    variantKey,
    pdfUrl,
    onPdfCompiled
}: PdfPreviewProps) {
    const [isCompiling, setIsCompiling] = useState(false);
    const [compiledUrl, setCompiledUrl] = useState<string | null>(pdfUrl);
    const [logs, setLogs] = useState<string>('');
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        setCompiledUrl(pdfUrl);
    }, [pdfUrl]);

    const handleRecompile = async () => {
        setIsCompiling(true);
        setLogs('Compiling LaTeX...');

        try {
            const response = await fetch('/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantKey })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Compilation failed');
            }

            const data = await response.json();
            setCompiledUrl(data.pdfUrl);
            setLogs(data.logs || 'Compilation successful!');
            onPdfCompiled(data.pdfUrl);
        } catch (error: any) {
            console.error('Compilation error:', error);
            setLogs(`Error: ${error.message}`);
            alert('Compilation failed. Check logs for details.');
        } finally {
            setIsCompiling(false);
        }
    };

    const handleDownload = () => {
        if (compiledUrl) {
            const link = document.createElement('a');
            link.href = compiledUrl;
            link.download = `resume_${variantKey}_${Date.now()}.pdf`;
            link.click();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    📄 PDF Preview
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRecompile}
                        disabled={isCompiling}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCompiling ? '⏳ Compiling...' : '🔄 Recompile'}
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!compiledUrl}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ⬇️ Download
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-slate-900">
                {compiledUrl ? (
                    <iframe
                        key={compiledUrl}
                        src={compiledUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
                        <div className="text-center">
                            <p className="mb-2">📄</p>
                            <p>Click "Recompile" to generate PDF</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Logs */}
            {logs && (
                <div className="border-t border-gray-200 dark:border-slate-700">
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    >
                        <span>Compilation Logs</span>
                        <span>{showLogs ? '▼' : '▶'}</span>
                    </button>
                    {showLogs && (
                        <div className="p-4 max-h-48 overflow-y-auto bg-gray-900 text-gray-100">
                            <pre className="text-xs font-mono whitespace-pre-wrap">{logs}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
