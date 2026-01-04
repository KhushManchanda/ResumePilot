'use client';

import { useState, useRef, useEffect } from 'react';

type VariantKey = 'ai_ml' | 'full_stack' | 'backend_cloud';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    patches?: any[];
    rationale?: string;
    warnings?: string[];
}

interface ChatPanelProps {
    variantKey: VariantKey;
    selectedBulletId: string | null;
    onResumeUpdate: () => void;
}

export default function ChatPanel({
    variantKey,
    selectedBulletId,
    onResumeUpdate
}: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showJdModal, setShowJdModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (instruction: string, endpoint: string, extraData: any = {}) => {
        if (!instruction.trim()) return;

        const userMessage: Message = { role: 'user', content: instruction };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantKey,
                    instruction,
                    ...extraData
                })
            });

            if (!response.ok) throw new Error('AI request failed');

            const result = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: result.rationale || 'Here are my suggested changes:',
                patches: result.patches,
                warnings: result.warnings
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyPatches = async (patches: any[]) => {
        try {
            const response = await fetch('/api/resume/apply-patch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantKey,
                    patches
                })
            });

            if (!response.ok) throw new Error('Failed to apply patches');

            onResumeUpdate();
            alert('Changes applied successfully!');
        } catch (error) {
            console.error('Apply patches error:', error);
            alert('Failed to apply changes');
        }
    };

    const handleEditBullet = () => {
        if (!selectedBulletId) {
            alert('Please select a bullet first');
            return;
        }

        const instruction = prompt('How would you like to edit this bullet?');
        if (instruction) {
            handleSend(instruction, '/api/ai/edit-bullet', { bulletId: selectedBulletId });
        }
    };

    const handleTailorToJd = (jd: string) => {
        handleSend('Tailor my resume to this job description', '/api/ai/tailor', {
            jobDescription: jd
        });
        setShowJdModal(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    💬 AI Assistant
                </h2>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 space-y-2">
                <button
                    onClick={handleEditBullet}
                    disabled={!selectedBulletId}
                    className="w-full px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    ✏️ Edit Selected Bullet
                </button>

                <button
                    onClick={() => setShowJdModal(true)}
                    className="w-full px-3 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-md transition-colors"
                >
                    🎯 Tailor to Job Description
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                        <p>👋 Hi! I'm your AI resume assistant.</p>
                        <p className="mt-2">Select a bullet to edit, or try tailoring your resume to a job description.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div
                            className={`inline-block max-w-[85%] px-4 py-2 rounded-lg ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                            {msg.warnings && msg.warnings.length > 0 && (
                                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                    ⚠️ {msg.warnings.join(', ')}
                                </div>
                            )}

                            {msg.patches && msg.patches.length > 0 && (
                                <button
                                    onClick={() => handleApplyPatches(msg.patches!)}
                                    className="mt-2 px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                                >
                                    ✓ Apply Changes
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="text-left">
                        <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Thinking...</p>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend(input, '/api/ai/edit-section', { sectionKey: 'experience' });
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me to edit your resume..."
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* JD Modal */}
            {showJdModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Paste Job Description
                        </h3>
                        <textarea
                            id="jd-input"
                            rows={12}
                            placeholder="Paste the complete job description here..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <div className="mt-4 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowJdModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const textarea = document.getElementById('jd-input') as HTMLTextAreaElement;
                                    handleTailorToJd(textarea.value);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                            >
                                Tailor Resume
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
