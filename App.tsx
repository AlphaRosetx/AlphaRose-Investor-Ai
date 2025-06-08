
import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, SenderType } from './types';
import { BUSINESS_PLAN_TEXT, INVESTMENT_LINK, INITIAL_AI_GREETING_TEXT } from './constants';
import ChatInterface from './components/ChatInterface';
import CEOContextInput from './components/CEOContextInput';
import { initializeGeminiClient, startNewChatSession, sendMessageToGemini } from './services/geminiService';
import { BrainCircuitIcon } from './components/icons';

// Attempt to get API key from environment.
const ENV_API_KEY = process.env.API_KEY;

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ceoContext, setCeoContext] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | undefined>(ENV_API_KEY);
  
  const [isGeminiClientInitialized, setIsGeminiClientInitialized] = useState<boolean>(false);
  const [isChatSessionActive, setIsChatSessionActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isCeoPanelVisible, setIsCeoPanelVisible] = useState<boolean>(false);
  const [typedSequence, setTypedSequence] = useState<string>('');
  const CEO_TARGET_SEQUENCE = "ceoupdates"; // lowercase for case-insensitive comparison

  const constructSystemInstruction = useCallback((currentCeoContext: string): string => {
    return `You are AlphaRose AI, an intelligent assistant for AlphaRose Therapeutics.
Your primary goal is to inform potential investors about the company based on the provided business plan and any additional context from the CEO.
You should also act as a sales agent, encouraging investment and directing users to ${INVESTMENT_LINK} when appropriate.
Be professional, knowledgeable, concise, and persuasive. Keep your answers focused and to the point.

Business Plan Information:
---
${BUSINESS_PLAN_TEXT}
---

Additional Context/Key Talking Points from CEO (use this to supplement or override business plan info if more current):
---
${currentCeoContext || "No additional context from CEO at this moment."}
---

When a user asks a question, use all the above information to formulate your answer.
If a topic seems relevant to investment or showcases strong potential, gently guide the conversation towards the investment opportunity.
Always provide the investment link (${INVESTMENT_LINK}) if the user expresses interest in investing, asks how to invest, or if you are summarizing key investment highlights.
Do not make up information. If the answer is not in the provided materials, state that you don't have that specific information.
`;
  }, []);

  useEffect(() => {
    if (apiKey) {
      const success = initializeGeminiClient(apiKey);
      setIsGeminiClientInitialized(success);
      if (!success) {
        setError("Failed to initialize Gemini AI client. Please check the API key and console for details.");
      } else {
        setError(null); 
      }
    } else {
      setError("Gemini API Key is not set. Please configure the API_KEY environment variable.");
      setIsGeminiClientInitialized(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isGeminiClientInitialized) {
      setIsLoading(true);
      setError(null);
      const systemInstruction = constructSystemInstruction(ceoContext);
      const success = startNewChatSession(systemInstruction);
      setIsChatSessionActive(success);
      if (success) {
         setMessages([
          { 
            id: crypto.randomUUID(), 
            text: INITIAL_AI_GREETING_TEXT, 
            sender: SenderType.AI,
            timestamp: Date.now()
          }
        ]);
      } else {
        setError("Failed to start a new AI chat session. The AI may not be able to respond.");
      }
      setIsLoading(false);
    } else {
      setIsChatSessionActive(false); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGeminiClientInitialized, ceoContext, constructSystemInstruction]);

  // Keyboard listener for CEO panel toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const targetNodeName = (event.target as HTMLElement)?.nodeName;
      if (targetNodeName === 'INPUT' || targetNodeName === 'TEXTAREA') {
        setTypedSequence(''); // Reset sequence if user starts typing in an input
        return;
      }

      const newSequence = (typedSequence + event.key).toLowerCase();
      
      if (CEO_TARGET_SEQUENCE.startsWith(newSequence)) {
        setTypedSequence(newSequence);
        if (newSequence === CEO_TARGET_SEQUENCE) {
          setIsCeoPanelVisible(prev => !prev);
          setTypedSequence(''); // Reset sequence after successful trigger
        }
      } else {
        // If the sequence is broken, reset it, but if the new key starts the sequence, keep it.
        setTypedSequence(CEO_TARGET_SEQUENCE.startsWith(event.key.toLowerCase()) ? event.key.toLowerCase() : '');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [typedSequence]);


  const handleSendMessage = async (messageText: string) => {
    if (!isChatSessionActive) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: "AI chat session is not active. Please check configuration.",
        sender: SenderType.SYSTEM,
        timestamp: Date.now()
      }]);
      return;
    }

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: messageText,
      sender: SenderType.USER,
      timestamp: Date.now()
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(messageText);
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: SenderType.AI,
        timestamp: Date.now()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (e) {
      console.error("Failed to send message or get response:", e);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        text: e instanceof Error ? e.message : "An unexpected error occurred.",
        sender: SenderType.SYSTEM,
        timestamp: Date.now()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCeoContextUpdate = (newContext: string) => {
    setCeoContext(newContext);
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      text: "CEO context updated. AI is re-initializing with new information...",
      sender: SenderType.SYSTEM,
      timestamp: Date.now()
    }]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-indigo-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl mb-6 text-center">
        <div className="flex items-center justify-center space-x-3">
          <BrainCircuitIcon className="w-12 h-12 text-sky-400" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            AlphaRose Therapeutics Investor AI
          </h1>
        </div>
        <p className="text-slate-300 mt-2">Your intelligent partner for information and investment insights.</p>
        <a href={INVESTMENT_LINK} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors duration-150 shadow-md">
          Invest in AlphaRose
        </a>
      </header>

      {error && (
        <div className="w-full max-w-3xl p-4 mb-6 bg-red-500 text-white rounded-lg shadow-lg text-center">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] min-h-[400px]">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            isChatReady={isChatSessionActive}
          />
        </div>
        <div className="md:col-span-1">
          {isCeoPanelVisible && (
            <CEOContextInput 
              initialContext={ceoContext} 
              onContextUpdate={handleCeoContextUpdate}
              disabled={!isGeminiClientInitialized}
            />
          )}
        </div>
      </div>
      
      {/* Blue dot button removed */}

      <footer className="w-full max-w-5xl mt-8 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} AlphaRose Therapeutics. All information is based on the business plan and current CEO context.</p>
        <p>This AI is for informational purposes and to facilitate investment interest. For official investment, please visit <a href={INVESTMENT_LINK} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline">{INVESTMENT_LINK}</a>.</p>
      </footer>
    </div>
  );
};

export default App;
