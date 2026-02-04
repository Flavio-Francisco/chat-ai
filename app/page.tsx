'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Send, Droplets, Loader2, User, Bot } from 'lucide-react';
import { useChat } from './hooks/useChat';

export default function AnalisadorDeLaudos() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useChat({
    api: '/api/ex1',
  });

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between p-3 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2 ml-4">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Droplets size={18} className="text-white" />
          </div>
          <h1 className="font-semibold text-sm tracking-tight">HemoCheck AI <span className="text-slate-400 font-normal">v1.0</span></h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 space-y-10">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FileText className="text-slate-300" />
              </div>
              <h2 className="text-2xl font-medium text-slate-800">Como posso ajudar com o laudo hoje?</h2>
              <p className="text-slate-500 mt-2">Anexe o arquivo PDF e solicite a conferência da RDC 11/2014.</p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="group px-4 md:px-0">
              <div className={`flex gap-4 items-start ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm shrink-0">
                    <Bot size={18} className="text-blue-600" />
                  </div>
                )}

                <div className={`relative px-5 py-3 rounded-2xl max-w-[85%] ${m.role === 'user'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-transparent text-slate-800'
                  }`}>
                  <div className="prose prose-slate prose-sm max-w-none break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 px-4 md:px-0 items-start">
              <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shrink-0">
                <Loader2 size={16} className="text-blue-600 animate-spin" />
              </div>
              <div className="text-slate-400 text-sm mt-1.5 animate-pulse">Pensando...</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-t from-white via-white to-transparent">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
            handleSubmit(e, { experimental_attachments: fileInput.files || undefined });
          }}
          className="max-w-3xl mx-auto relative group"
        >
          <div className="relative flex flex-col w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:border-slate-300 focus-within:ring-1 focus-within:ring-slate-200 shadow-sm">

            <textarea
              rows={1}
              className="w-full resize-none bg-transparent rounded-xl  border-slate-700  text-slate-700 py-2 px-3 min-h-[44px] max-h-40"
              value={input}
              placeholder="Envie uma mensagem ou anexe um laudo..."
              onChange={(e) => {
                handleInputChange(e);
                e.target.style.height = 'inherit';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />

            <div className="flex items-center justify-between mt-1 px-1">
              <div className="flex items-center gap-2">
                <label htmlFor="pdf-upload" className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <FileText size={20} />
                  <input type="file" id="pdf-upload" accept=".pdf" className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!input && !isLoading)}
                className="bg-slate-900 hover:bg-black  text-white p-2 rounded-xl transition-all disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
            O HemoCheck pode cometer erros. Verifique informações importantes.
          </p>
        </form>
      </div>
    </div>
  );
}