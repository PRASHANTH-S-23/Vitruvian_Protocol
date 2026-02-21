import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Key, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../App';
import { triggerHaptic } from '../store';
import type { ChatMessage } from '../types';

const STORAGE_KEY = 'vitruvian-chat-history';

function loadChatHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

async function sendToGemini(apiKey: string, messages: ChatMessage[], userMessage: string): Promise<string> {
  const systemPrompt = `You are a knowledgeable and encouraging fitness coach assistant for the Vitruvian Protocol fitness app. You help users with:
- Workout advice and exercise tips
- Form corrections and injury prevention
- Nutrition guidance
- Recovery and rest recommendations
- Motivation and goal setting
- Explaining exercises and their benefits

Keep responses concise, friendly, and actionable. Use emojis sparingly to keep it engaging.
If asked about something unrelated to fitness, health, or wellness, politely redirect the conversation back to fitness topics.`;

  const conversationHistory = messages.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'I understand! I\'m ready to help with fitness advice.' }] },
          ...conversationHistory,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get response from Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
}

export default function Chat() {
  const { state, updateSettings } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!state.settings.geminiApiKey);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      triggerHaptic('medium');
      updateSettings({ geminiApiKey: apiKeyInput.trim() });
      setShowApiKeyInput(false);
      setApiKeyInput('');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const apiKey = state.settings.geminiApiKey;
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    triggerHaptic('light');
    setError(null);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendToGemini(apiKey, messages, userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      triggerHaptic('medium');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if there was an error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearHistory = () => {
    triggerHaptic('heavy');
    setMessages([]);
    saveChatHistory([]);
  };

  const suggestedPrompts = [
    "How can I improve my pull-ups?",
    "Best exercises for core strength?",
    "Tips for better recovery?",
    "How to prevent workout injuries?"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Background gradient */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-30" />

      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-4 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${state.settings.accentColor}20` }}
            >
              <Bot size={22} style={{ color: state.settings.accentColor }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Coach</h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowApiKeyInput(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center glass"
            >
              <Key size={18} style={{ color: state.settings.geminiApiKey ? 'var(--color-ios-green)' : 'var(--text-tertiary)' }} />
            </motion.button>
            {messages.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearHistory}
                className="w-9 h-9 rounded-xl flex items-center justify-center glass"
              >
                <Trash2 size={18} style={{ color: 'var(--color-ios-red)' }} />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => state.settings.geminiApiKey && setShowApiKeyInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-premium rounded-3xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: `${state.settings.accentColor}20` }}
                >
                  <Sparkles size={32} style={{ color: state.settings.accentColor }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>
                Gemini API Key
              </h3>
              <p className="text-center text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Enter your Google Gemini API key to enable the AI fitness coach.
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-2"
                  style={{ color: state.settings.accentColor }}
                >
                  Get your free API key →
                </a>
              </p>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-3 rounded-xl mb-4 outline-none"
                style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white disabled:opacity-50"
                  style={{ background: state.settings.accentColor }}
                >
                  Save API Key
                </motion.button>
                {state.settings.geminiApiKey && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowApiKeyInput(false)}
                    className="w-full py-3.5 glass rounded-2xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full pt-8">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${state.settings.accentColor}15` }}
            >
              <Bot size={40} style={{ color: state.settings.accentColor }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Your AI Fitness Coach
            </h2>
            <p className="text-sm text-center mb-6 max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
              Ask me anything about workouts, nutrition, form, recovery, or motivation!
            </p>
            
            {/* Suggested Prompts */}
            <div className="w-full space-y-2">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-quaternary)' }}>
                Try asking:
              </p>
              {suggestedPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-4 py-3 glass rounded-xl text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  "{prompt}"
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: message.role === 'user' 
                      ? `${state.settings.accentColor}20` 
                      : 'var(--glass-bg)' 
                  }}
                >
                  {message.role === 'user' ? (
                    <User size={16} style={{ color: state.settings.accentColor }} />
                  ) : (
                    <Bot size={16} style={{ color: 'var(--text-secondary)' }} />
                  )}
                </div>
                <div 
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === 'user' ? '' : 'glass'
                  }`}
                  style={{ 
                    background: message.role === 'user' 
                      ? state.settings.accentColor 
                      : undefined,
                    color: message.role === 'user' ? 'white' : 'var(--text-primary)'
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--glass-bg)' }}
                >
                  <Bot size={16} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div className="glass px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-4 mb-2 px-4 py-3 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(255, 69, 58, 0.2)' }}
          >
            <AlertCircle size={16} color="#FF453A" />
            <p className="text-sm" style={{ color: '#FF453A' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div 
        className="sticky bottom-0 p-4 backdrop-blur-xl border-t z-20"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1 glass rounded-2xl overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={state.settings.geminiApiKey ? "Ask your fitness question..." : "Set up API key first..."}
              disabled={!state.settings.geminiApiKey || isLoading}
              rows={1}
              className="w-full px-4 py-3 resize-none outline-none disabled:opacity-50"
              style={{ 
                background: 'transparent', 
                color: 'var(--text-primary)',
                maxHeight: '120px'
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || !state.settings.geminiApiKey || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-50"
            style={{ background: state.settings.accentColor }}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <Send size={20} className="text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
