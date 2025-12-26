import React, { useState } from 'react';
import { Sparkles, Send, X, Loader2 } from 'lucide-react';
import { getInventoryInsights } from '../services/geminiService';
import { Product } from '../types';

interface GeminiAssistantProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ products, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);
    
    try {
      const result = await getInventoryInsights(products, query);
      setResponse(result);
    } catch (e) {
      setResponse("An error occurred while contacting the assistant.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h2 className="font-semibold text-lg">Inventory AI Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
           {!response && !isLoading && (
             <div className="text-center text-slate-500 py-8">
               <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-300" />
               <p className="text-sm">Ask me anything about your stock levels, sales performance, or which colors are trending.</p>
               <div className="mt-4 flex flex-wrap justify-center gap-2">
                 <button 
                   onClick={() => setQuery("Which product is selling the fastest?")}
                   className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-300 transition-colors"
                 >
                   Which product is selling fastest?
                 </button>
                 <button 
                   onClick={() => setQuery("List all colors that are out of stock.")}
                   className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-indigo-300 transition-colors"
                 >
                   Any colors out of stock?
                 </button>
               </div>
             </div>
           )}

           {isLoading && (
             <div className="flex flex-col items-center justify-center py-8 text-indigo-600">
               <Loader2 className="w-8 h-8 animate-spin mb-2" />
               <p className="text-sm font-medium">Analyzing inventory data...</p>
             </div>
           )}

           {response && (
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-700 leading-relaxed text-sm whitespace-pre-line">
               {response}
             </div>
           )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your inventory..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
              rows={2}
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;