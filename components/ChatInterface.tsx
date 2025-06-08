
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import { SendIcon, BotIcon } from './icons'; // Added BotIcon import

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => void;
  isLoading: boolean;
  isChatReady: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isChatReady }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading && isChatReady) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="flex-grow p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center">
             <div className="mx-2 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
                <BotIcon className="w-5 h-5 text-white" />
             </div>
            <div className="px-4 py-3 rounded-2xl shadow-md bg-slate-200 text-slate-800 self-start rounded-bl-none">
              <p className="text-sm italic">AlphaRose AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isChatReady ? "Ask about AlphaRose Therapeutics..." : "AI is not ready. Check API key or context settings."}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 text-black"
            disabled={isLoading || !isChatReady}
          />
          <button
            type="submit"
            className="p-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150"
            disabled={isLoading || !inputText.trim() || !isChatReady}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
