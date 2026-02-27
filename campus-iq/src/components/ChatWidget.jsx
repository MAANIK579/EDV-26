import React, { useState } from 'react';
import { generateResponse } from '../utils/chatResponses';
import { useAuth } from '../context/AuthContext';

export default function ChatWidget() {
    const { user } = useAuth();
    const userName = user?.name?.split(' ')[0] || 'there';
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 0, sender: 'bot', text: `Hey ${userName}! 👋 Ask me anything about campus life.` }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);

    const sendMessage = (text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now(), sender: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTyping(true);

        setTimeout(() => {
            const response = generateResponse(text);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: response }]);
            setTyping(false);
        }, 1000 + Math.random() * 500);
    };

    return (
        <>
            <button className="chat-fab" onClick={() => setOpen(!open)}>
                <i className={`fas ${open ? 'fa-times' : 'fa-robot'}`}></i>
            </button>

            {open && (
                <div className="chat-popup">
                    <div className="chat-popup-header">
                        <h3><i className="fas fa-robot" style={{ color: 'var(--cyan)', marginRight: 8 }}></i>CampusIQ</h3>
                        <button className="icon-btn" onClick={() => setOpen(false)}><i className="fas fa-times"></i></button>
                    </div>

                    <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                                <div className="chat-avatar"><i className={`fas ${msg.sender === 'user' ? 'fa-user' : 'fa-robot'}`}></i></div>
                                <div className="chat-bubble"><p dangerouslySetInnerHTML={{ __html: msg.text }}></p></div>
                            </div>
                        ))}
                        {typing && (
                            <div className="chat-msg bot">
                                <div className="chat-avatar"><i className="fas fa-robot"></i></div>
                                <div className="chat-bubble typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                        <form className="chat-form" onSubmit={e => { e.preventDefault(); sendMessage(input); }}>
                            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything…" />
                            <button type="submit" className="chat-send"><i className="fas fa-paper-plane"></i></button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
