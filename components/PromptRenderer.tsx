import React from 'react';

interface PromptRendererProps {
  content: string;
}

export const PromptRenderer: React.FC<PromptRendererProps> = ({ content }) => {
  const formattedHtml = content
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/### (.*)/g, '<h3 class="text-orange-400 font-semibold text-lg">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>')
    .replace(/^\s*-\s(.*)/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/((<li.*<\/li>\s*)+)/g, '<ul>$1</ul>');

  return (
    <div
      className="text-slate-300 whitespace-pre-wrap leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};
