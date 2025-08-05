import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BotAvatar, UserAvatar } from './Components/Avatars.jsx';
import { SkeletonLoader } from './Components/Loader.jsx';
import { SmartReplies } from './Components/SmartReplies.jsx';
import ChatBubble from './Components/ChatBubble.jsx';

// In production, Vercel will use the environment variable you set.
// For local testing, it falls back to the local Python server's address.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001/api/chat";

export default function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatStarted, setChatStarted] = useState(false);
    const [showSmartReplies, setShowSmartReplies] = useState(false);
    const chatEndRef = useRef(null);

    // Effect to load chat history from local storage
    useEffect(() => {
        try {
            const savedMessages = localStorage.getItem('chatMessages');
            const savedChatStarted = localStorage.getItem('chatStarted');
            if (savedMessages) setMessages(JSON.parse(savedMessages));
            if (savedChatStarted) setChatStarted(JSON.parse(savedChatStarted));
        } catch (error) {
            console.error("Failed to load from local storage", error);
        }
    }, []);

    // Effect to save chat history to local storage
    useEffect(() => {
        try {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
            localStorage.setItem('chatStarted', JSON.stringify(chatStarted));
        } catch (error) {
            console.error("Failed to save to local storage", error);
        }
    }, [messages, chatStarted]);

    // Effect to scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const getBotResponse = async (messageText) => {
        setIsLoading(true);
        setShowSmartReplies(false);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText }),
            });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const data = await response.json();
            const botMessage = { role: 'bot', content: data.response };
            setTimeout(() => {
                setMessages(prev => [...prev, botMessage]);
                setIsLoading(false);
                setShowSmartReplies(true);
            }, 500);
        } catch (error) {
            console.error("Failed to fetch from API:", error);
            const errorMessage = { role: 'bot', content: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const startChat = () => {
        setChatStarted(true);
        setIsLoading(true);
        setMessages([]); // Clear previous messages
        setTimeout(() => {
            setMessages([{ role: 'bot', content: "Konnichiwa! 👋 How can I help you with your IT issues today?" }]);
            setIsLoading(false);
            setShowSmartReplies(true);
        }, 1000);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const messageToSend = input;
        setInput('');
        await getBotResponse(messageToSend);
    };

    const handleSmartReplyClick = async (reply) => {
        if (isLoading) return;
        const userMessage = { role: 'user', content: reply };
        setMessages(prev => [...prev, userMessage]);
        await getBotResponse(reply);
    };

    return (
        <div className="font-sans bg-black text-white w-full min-h-screen flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-72 h-72 bg-red-900 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-800 rounded-full mix-blend-lighten filter blur-3xl opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>
            
            <main className="relative w-full max-w-2xl h-[90vh] md:h-[85vh] flex flex-col bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <header className="p-4 border-b border-white/20 text-center">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600">HCIL IT Helpdesk</h1>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex flex-col space-y-6">
                        <AnimatePresence>
                            {!chatStarted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="text-6xl mb-4">🤖</div>
                                    <h2 className="text-3xl font-bold mb-2">Welcome to the Helpdesk</h2>
                                    <p className="text-slate-300 mb-6">Click below to start the conversation.</p>
                                    <button onClick={startChat} className="px-8 py-3 font-bold text-white bg-gradient-to-r from-red-600 to-rose-700 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                                        Start Chat
                                    </button>
                                </motion.div>
                            ) : (
                                messages.map((msg, index) => <ChatBubble key={index} msg={msg} />)
                            )}
                        </AnimatePresence>
                        {isLoading && <SkeletonLoader />}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {chatStarted && showSmartReplies && !isLoading && (
                    <SmartReplies onReplyClick={handleSmartReplyClick} />
                )}

                {chatStarted && (
                    <div className="p-4 border-t border-white/20">
                        <form onSubmit={handleSend} className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    if (showSmartReplies) setShowSmartReplies(false);
                                }}
                                placeholder="Type your message here..."
                                disabled={isLoading}
                                className="flex-1 w-full px-4 py-3 bg-white/10 border-2 border-transparent rounded-full focus:outline-none focus:border-red-500 transition-colors duration-300 disabled:opacity-50"
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-red-600 to-rose-700 rounded-full text-white text-2xl hover:scale-110 transition-transform duration-300 disabled:opacity-50 disabled:scale-100">
                                ↑
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );

}


