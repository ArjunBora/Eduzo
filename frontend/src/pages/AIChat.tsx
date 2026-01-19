import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
    const { isDarkMode, toggleTheme } = useTheme();
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
            const userId = user?.id || 'guest';
            const response = await askQuestion(input, userId);

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
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <header className={`shadow-sm px-6 py-4 flex justify-between items-center z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-900 text-blue-400' : 'bg-primary-100 text-primary-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                    </div>
                    <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI Tutor</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                    <a href="/dashboard" className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>Back to Dashboard</a>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl rounded-2xl p-6 ${msg.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : isDarkMode ? 'bg-gray-800 shadow-sm border border-gray-700' : 'bg-white shadow-sm border border-gray-100'
                            }`}>
                            {msg.reasoning && (
                                <div className={`mb-4 p-4 rounded-lg border-l-4 ${isDarkMode ? 'bg-gray-700 border-blue-500' : 'bg-gray-50 border-primary-300'}`}>
                                    <p className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>REASONING PROCESS</p>
                                    <p className={`text-sm italic ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{msg.reasoning}</p>
                                </div>
                            )}
                            <div className={`prose ${msg.role === 'user' ? 'prose-invert' : isDarkMode ? 'prose-invert' : 'prose-gray'}`}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className={`rounded-2xl p-6 flex items-center space-x-2 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-sm border border-gray-100'}`}>
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={`border-t p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className={`w-full pl-6 pr-32 py-4 border-0 rounded-full focus:ring-2 focus:ring-primary-500 transition-all ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-900 placeholder-gray-400'}`}
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
