import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPrompts } from '../services/promptService';
import { Prompt } from '../lib/supabase';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export const PromptHistory: React.FC = () => {
  const { profile } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadPrompts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadPrompts = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const data = await getUserPrompts(profile.id);
      setPrompts(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
        <div className="text-slate-400 text-lg mb-2">No prompts optimized yet</div>
        <div className="text-slate-500 text-sm">
          Start optimizing prompts to see your history here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt) => {
        const isExpanded = expandedId === prompt.id;

        return (
          <div
            key={prompt.id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                      {prompt.optimization_level}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(prompt.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm line-clamp-2">
                    {prompt.original_text}
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(prompt.id)}
                  className="ml-4 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Original</div>
                  <div className="text-sm font-medium text-white">
                    {prompt.original_token_count} tokens
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Optimized</div>
                  <div className="text-sm font-medium text-white">
                    {prompt.optimized_token_count} tokens
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Saved</div>
                  <div className="text-sm font-medium text-green-400">
                    {prompt.tokens_saved} tokens
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-1">Cost Saved</div>
                  <div className="text-sm font-medium text-emerald-400">
                    ${prompt.cost_saved_usd.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-slate-700 p-4 bg-slate-900/50">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-300">Original Prompt</div>
                    </div>
                    <div className="px-4 py-3 bg-slate-800 rounded-lg text-sm text-slate-300">
                      {prompt.original_text}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-slate-300">Optimized Prompt</div>
                      <button
                        onClick={() => handleCopy(prompt.optimized_text || '', prompt.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                      >
                        {copiedId === prompt.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="px-4 py-3 bg-slate-800 rounded-lg text-sm text-slate-300">
                      {prompt.optimized_text}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
