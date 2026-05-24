"use client";

import React, { useState, useRef } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
   name: string;
   label: React.ReactNode;
   placeholder?: string;
   rules?: RegisterOptions;
   rows?: number;
   className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
   name,
   label,
   placeholder = "Type your description here...",
   rules,
   rows = 8,
   className = '',
}) => {
   const { register, watch, setValue, formState: { errors } } = useFormContext();
   const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
   const error = errors[name];
   const markdownContent = watch(name) || '';

   const textareaRef = useRef<HTMLTextAreaElement | null>(null);
   const { ref: registerRef, ...registerProps } = register(name, rules);

   const insertMarkdown = (syntaxBefore: string, syntaxAfter = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      const selectedText = text.substring(start, end);
      const replacement = `${syntaxBefore}${selectedText}${syntaxAfter}`;

      setValue(name, text.substring(0, start) + replacement + text.substring(end), {
         shouldDirty: true,
         shouldValidate: true,
      });

      setTimeout(() => {
         textarea.focus();
         textarea.setSelectionRange(
            start + syntaxBefore.length,
            start + syntaxBefore.length + selectedText.length
         );
      }, 0);
   };

   return (
      <div className={`flex flex-col w-full text-base-content ${className}`}>
         {/* Label section */}
         <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-sm font-semibold animate-none" htmlFor={name}>
               {label}
            </label>
         </div>

         {/* GitHub-style Wrapper Border Frame */}
         <div className={`w-full border rounded-lg bg-base-100 overflow-hidden shadow-sm flex flex-col ${error ? 'border-error' : 'border-base-300'
            }`}>

            {/* Navigation Toolbar Header */}
            <div className="flex flex-row justify-between items-end bg-base-200 border-b border-base-300 px-3 pt-2 gap-4 select-none min-h-[44px]">

               {/* Write / Preview Tabs */}
               <div className="flex flex-row gap-1 -mb-[1px]">
                  <button
                     type="button"
                     className={`px-4 py-1.5 text-sm font-medium border-t border-x rounded-t-md transition-colors ${activeTab === 'edit'
                           ? 'bg-base-100 border-base-300 text-base-content border-b-base-100 z-10 font-semibold'
                           : 'bg-transparent border-transparent text-base-content/60 hover:text-base-content'
                        }`}
                     onClick={() => setActiveTab('edit')}
                  >
                     Write
                  </button>
                  <button
                     type="button"
                     className={`px-4 py-1.5 text-sm font-medium border-t border-x rounded-t-md transition-colors ${activeTab === 'preview'
                           ? 'bg-base-100 border-base-300 text-base-content border-b-base-100 z-10 font-semibold'
                           : 'bg-transparent border-transparent text-base-content/60 hover:text-base-content'
                        }`}
                     onClick={() => setActiveTab('preview')}
                  >
                     Preview
                  </button>
               </div>

               {/* Action Toolbar Icon Deck */}
               {activeTab === 'edit' && (
                  <div className="flex items-center flex-row gap-1 pb-1.5 text-base-content/70 overflow-x-auto max-w-full">
                     <button type="button" onClick={() => insertMarkdown('### ')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300 font-bold text-xs" title="Heading">H</button>
                     <button type="button" onClick={() => insertMarkdown('**', '**')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300 font-extrabold text-xs" title="Bold">B</button>
                     <button type="button" onClick={() => insertMarkdown('*', '*')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300 italic font-serif text-sm" title="Italic">I</button>

                     <div className="w-[1px] h-4 bg-base-300 mx-1 flex-shrink-0" />

                     <button type="button" onClick={() => insertMarkdown('> ')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Quote">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2-2-2H4c-1.25 0-2 .756-2 2v3c0 1.25.756 2 2 2h3c0 4-2.5 6-5 7v3zm11 0c3 0 7-1 7-8V5c0-1.25-.756-2-2-2h-4c-1.25 0-2 .756-2 2v3c0 1.25.756 2 2 2h3c0 4-2.5 6-5 7v3z" /></svg>
                     </button>
                     <button type="button" onClick={() => insertMarkdown('`', '`')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Code block">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                     </button>
                     <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Link">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                     </button>

                     <div className="w-[1px] h-4 bg-base-300 mx-1 flex-shrink-0" />

                     <button type="button" onClick={() => insertMarkdown('- ')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Bulleted List">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                     </button>
                     <button type="button" onClick={() => insertMarkdown('1. ')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Numbered List">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
                     </button>
                     <button type="button" onClick={() => insertMarkdown('- [ ] ')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-base-300" title="Tasklist Checkboxes">
                        <svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><polyline points="9 11 11 13 15 9" /></svg>
                     </button>
                  </div>
               )}
            </div>

            {/* Content Body Pane Panel */}
            <div className="w-full bg-base-100 flex-1 flex flex-col">
               {activeTab === 'edit' ? (
                  <textarea
                     id={name}
                     rows={rows}
                     placeholder={placeholder}
                     {...registerProps}
                     ref={(e) => {
                        registerRef(e);
                        textareaRef.current = e;
                     }}
                     className="w-full p-4 resize-y font-mono text-sm leading-relaxed bg-transparent text-base-content border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none min-h-[14rem]"
                  />
               ) : (
                  <div
                     className="w-full p-4 overflow-y-auto prose prose-base max-w-none text-base-content bg-base-50/50 min-h-[14rem]"
                     style={{ minHeight: `${rows * 1.5}rem` }}
                  >
                     {markdownContent ? (
                        /* EXPLICIT CHILDREN BINDING ENFORCED */
                           <ReactMarkdown>{markdownContent}</ReactMarkdown>
                     ) : (
                        <span className="text-base-content/40 italic text-sm">Nothing to preview</span>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Validation alert block */}
         <div className="min-h-[1.5rem] pt-1 px-1">
            {error && (
               <span className="text-xs text-error font-medium">
                  {typeof error.message === 'string' ? error.message : 'Invalid input'}
               </span>
            )}
         </div>
      </div>
   );
};
