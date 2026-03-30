import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCycles, getCycleContext } from '@/services/cycleEngine';
import { getChatbotResponse, createMessage } from '@/services/chatbot';
import { storage } from '@/services/storage';
import type { ChatMessage } from '@/types';
import { PHASE_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  "What's happening in my body?",
  "What should I eat today?",
  "Help me with cramps",
  "How can I improve my mood?",
  "Exercise tips for today",
  "Self-care ideas",
  "When is my next period?",
  "I feel anxious",
];

interface ChatbotProps {
  userName?: string;
  comfortMode?: boolean;
}

export default function Chatbot({ userName = '', comfortMode = false }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.get<ChatMessage[]>('chat_messages', []));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ctx = getCycleContext(getCycles());
  const phaseConfig = PHASE_CONFIG[ctx.currentPhase] ?? PHASE_CONFIG.menstrual;

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = createMessage('user', text.trim());
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    let response = getChatbotResponse(text, ctx);
    if (userName) {
      response = response.replace(/^(Here|Your|You|Feeling|Fatigue|Late|Anxiety)/m, (match: string) => `${userName}, ${match.toLowerCase()}`);
    }
    const botMsg = createMessage('assistant', response);
    const final = [...newMessages, botMsg];
    setMessages(final);
    storage.set('chat_messages', final);
    setIsTyping(false);
  };

  const toggleBookmark = (id: string) => {
    setMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, bookmarked: !m.bookmarked } : m);
      storage.set('chat_messages', updated);
      return updated;
    });
  };

  const clearChat = () => { setMessages([]); storage.set('chat_messages', []); };

  const getTimeAgo = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-foreground">FemNexa AI</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-muted-foreground">{phaseConfig.emoji} {phaseConfig.name} Phase • Day {ctx.dayInCycle}</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 rounded-xl hover:bg-muted transition-colors" title="New conversation">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-display font-bold mb-2 text-foreground">Hi{userName ? ` ${userName}` : ''}! 👋</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              I am your wellness companion. Ask me anything about your cycle, symptoms, or wellness tips.
              {comfortMode && " 🧘 I am in gentle mode for extra support."}
            </p>
            <p className="text-xs text-muted-foreground mb-4 italic">⚠️ FemNexa provides wellness info, not medical advice.</p>
          </motion.div>
        )}

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div className="relative max-w-[85%] group">
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">FemNexa</span>
                </div>
              )}
              <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md shadow-md' : 'glass-strong rounded-bl-md'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose-chat"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                ) : (<p>{msg.content}</p>)}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-muted-foreground">{getTimeAgo(msg.timestamp)}</span>
                {msg.role === 'assistant' && (
                  <button onClick={() => toggleBookmark(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </div>
              <div className="glass-strong rounded-2xl px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">{q}</button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pb-4 pt-2 border-t border-border/20">
        <div className="flex items-center gap-2 glass-strong rounded-2xl p-1.5">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground text-foreground"
            disabled={isTyping} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition-opacity shadow-md"
          ><Send className="w-4 h-4" /></motion.button>
        </div>
      </div>
    </div>
  );
}
