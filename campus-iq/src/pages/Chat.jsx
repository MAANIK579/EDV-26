import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../utils/chatResponses';
import { useAuth } from '../context/AuthContext';

const suggestions = [
    "What's my next class?",
    "Which rooms are free?",
    "Cafeteria menu",
    "What's my GPA?",
    "Bus schedule",
    "Exam timetable",
];

export default function Chat() {
    const { user } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'there';
    const [messages, setMessages] = useState([
        { id: 0, sender: 'bot', text: `Hey ${userName}! 👋 I'm your AI campus assistant. Ask me anything about classes, grades, events, rooms, or campus life!` }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesRef = useRef(null);

    useEffect(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages, typing]);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: text.trim() }]);
        setInput('');
        setShowSuggestions(false);
        setTyping(true);

        setTimeout(() => {
            const response = generateResponse(text);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response }]);
            setTyping(false);
        }, 1000 + Math.random() * 800);
    };

    return (
        <div className="page-transition">
            <div className="page-header">
                <h1><i className="fas fa-robot"></i> AI Chat</h1>
                <p className="subtitle">Ask CampusIQ anything about campus life</p>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="chat-area">
                    <div className="chat-messages" ref={messagesRef}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                                <div className="chat-avatar">
                                    <i className={`fas ${msg.sender === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                                </div>
                                <div className="chat-bubble">
                                    <p dangerouslySetInnerHTML={{ __html: msg.sender === 'user' ? escapeHTML(msg.text) : msg.text }}></p>
                                </div>
                            </div>
                        ))}
                        {typing && (
                            <div className="chat-msg bot">
                                <div className="chat-avatar"><i className="fas fa-robot"></i></div>
                                <div className="chat-bubble typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="chat-suggestions">
                            {suggestions.map(s => (
                                <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
                            ))}
                        </div>
                    )}

                    <div className="chat-input-area">
                        <form className="chat-form" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message…"
                            />
                            <button type="submit" className="chat-send"><i className="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
