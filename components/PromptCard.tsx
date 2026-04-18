
import React from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { PromptRenderer } from './PromptRenderer';

interface PromptCardProps {
  prompt: string;
  onCopy: (text: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy }) => {
  return (
    <div className="group relative bg-slate-800/50 p-6 rounded-lg border border-slate-700 transition-all hover:border-orange-500/50">
      <button
        onClick={() => onCopy(prompt)}
        className="absolute top-3 right-3 p-2 bg-slate-700 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-orange-600 hover:text-white"
        aria-label="Copy prompt"
      >
        <CopyIcon className="h-4 w-4" />
      </button>
      <PromptRenderer content={prompt} />
    </div>
  );
};
