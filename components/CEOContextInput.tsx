
import React, { useState } from 'react';

interface CEOContextInputProps {
  initialContext: string;
  onContextUpdate: (newContext: string) => void;
  disabled: boolean;
}

const CEOContextInput: React.FC<CEOContextInputProps> = ({ initialContext, onContextUpdate, disabled }) => {
  const [context, setContext] = useState(initialContext);

  const handleUpdate = () => {
    onContextUpdate(context);
  };

  return (
    <div className="p-6 bg-slate-800 text-white rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold mb-4 text-sky-400">CEO Context Panel</h3>
      <p className="text-sm text-slate-300 mb-3">
        Provide additional context, key talking points, or recent updates for the AI. This information will be used by AlphaRose AI to answer investor questions.
      </p>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        rows={6}
        className="w-full p-3 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150"
        placeholder="Enter any new information or key messages here..."
        disabled={disabled}
      />
      <button
        onClick={handleUpdate}
        className="mt-4 w-full p-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150"
        disabled={disabled}
      >
        Update AI Context
      </button>
       {disabled && <p className="text-xs text-amber-400 mt-2">Context updates are disabled until the AI is properly initialized (API Key required).</p>}
    </div>
  );
};

export default CEOContextInput;
