
import React from 'react';
import { ChatMessage, SenderType } from '../types';
import { UserIcon, BotIcon } from './icons';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === SenderType.USER;
  const isAI = message.sender === SenderType.AI;

  const bubbleClasses = isUser
    ? 'bg-sky-600 text-white self-end'
    : 'bg-slate-200 text-slate-800 self-start';
  
  const alignmentClasses = isUser ? 'items-end' : 'items-start';

  if (message.sender === SenderType.SYSTEM) {
    return (
      <div className="my-2 text-center">
        <p className="text-xs text-gray-500 italic px-4 py-1 bg-gray-100 rounded-full inline-block">{message.text}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full my-2 ${alignmentClasses}`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xl lg:max-w-2xl`}>
        <div className={`mx-2 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-sky-500' : 'bg-indigo-500'}`}>
          {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <BotIcon className="w-5 h-5 text-white" />}
        </div>
        <div
          className={`px-4 py-3 rounded-2xl shadow-md ${bubbleClasses} ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
      <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right mr-12' : 'text-left ml-12'}`}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
};

export default MessageBubble;
