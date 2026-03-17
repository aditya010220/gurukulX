import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const quickPrompts = [
  { icon: 'Calendar', label: 'Generate a 7-day learning plan' },
  { icon: 'Target', label: 'Suggest skills to learn next' },
  { icon: 'TrendingUp', label: 'Analyze my learning progress' },
  { icon: 'BookOpen', label: 'Recommend resources for React' },
];

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi there! 👋 I'm your AI Learning Assistant. I can help you plan your learning journey, suggest skill matches, and provide personalized recommendations. What would you like to explore today?",
  timestamp: '10:00 AM',
};

const formatTimestamp = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AIAssistantPage = () => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ─── Convex queries & mutations ─────────────────────────────
  const chatHistory = useQuery(api.chat.getHistory);
  const sendMessage = useMutation(api.chat.sendMessage);

  // Map Convex history to display format, with welcome fallback
  const messages = chatHistory && chatHistory.length > 0
    ? chatHistory.map((m) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        timestamp: formatTimestamp(m.createdAt),
      }))
    : [welcomeMessage];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const content = text || input;
    if (!content.trim()) return;

    setInput('');
    setIsTyping(true);

    try {
      await sendMessage({ content });
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-x-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Icon name="Bot" size={20} color="var(--color-primary-foreground)" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Powered by AI to accelerate your learning
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-secondary' : 'bg-primary'
                }`}
              >
                <Icon
                  name={msg.role === 'user' ? 'User' : 'Bot'}
                  size={16}
                  color="var(--color-primary-foreground)"
                />
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1.5 ${
                    msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="Bot" size={16} color="var(--color-primary-foreground)" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (show only when few messages) */}
        {messages.length <= 1 && (
          <div className="px-4 md:px-6 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Quick prompts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleSend(prompt.label)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted hover:bg-border text-sm text-foreground transition-all text-left"
                >
                  <Icon name={prompt.icon} size={16} color="var(--color-primary)" />
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your learning..."
              className="flex-1"
            />
            <Button
              variant="default"
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              iconName="Send"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
