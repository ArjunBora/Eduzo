import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { askQuestion } from '../services/ai';
import { logEvent } from '../services/analytics';
import Button from '../components/ui/Button';

interface Message {
    role: 'user' | 'ai';
    content: string;
    reasoning?: string;
}

const AIChat = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Hello! I am your AI tutor powered by Qwen3. Ask me anything, and I will explain my reasoning.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Using dummy ID if user.id not available yet
            const userId = user?.id || 'guest';
            const response = await askQuestion(input, userId);

            // Log Analytics
            logEvent('question_asked', userId, { question_length: input.length });

            const aiMessage: Message = {
                role: 'ai',
                content: response.answer,
                reasoning: response.reasoning
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: 'Sorry, I encountered an error while processing your request. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">AI Tutor</h1>
                </div>
                <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Back to Dashboard</a>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl rounded-2xl p-6 ${msg.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white shadow-sm border border-gray-100'
                            }`}>
                            {msg.reasoning && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-300">
                                    <p className="text-xs text-uppercase font-bold text-gray-500 mb-1">REASONING PROCESS</p>
                                    <p className="text-sm text-gray-600 italic">{msg.reasoning}</p>
                                </div>
                            )}
                            <div className={`prose ${msg.role === 'user' ? 'prose-invert' : 'prose-gray'}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full pl-6 pr-32 py-4 bg-gray-50 border-0 rounded-full focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 placeholder-gray-400"
                        disabled={loading}
                    />
                    <div className="absolute right-2 top-2">
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="rounded-full !px-6 !py-2"
                        >
                            Send
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIChat;
