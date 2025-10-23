import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createOptimizedPrompt } from '../services/promptService';
import { isGeminiConfigured } from '../services/geminiService';
import { Loader2, Zap, Copy, Check, Sparkles } from 'lucide-react';
import { estimateTokenCount } from '../services/tokenCounter';

type OptimizationLevel = 'aggressive' | 'moderate' | 'minimal';

export const PromptOptimizer: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [level, setLevel] = useState<OptimizationLevel>('moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [stats, setStats] = useState<{
    originalTokens: number;
    optimizedTokens: number;
    tokensSaved: number;
    compressionRate: number;
  } | null>(null);

  useEffect(() => {
    setAiEnabled(isGeminiConfigured());
  }, []);

  const handleOptimize = async () => {
    if (!profile || !originalPrompt.trim()) return;

    setError('');
    setLoading(true);
    setOptimizedPrompt('');
    setStats(null);

    try {
      const result = await createOptimizedPrompt(profile.id, originalPrompt, level);

      setOptimizedPrompt(result.optimized_text || '');
      setStats({
        originalTokens: result.original_token_count,
        optimizedTokens: result.optimized_token_count || 0,
        tokensSaved: result.tokens_saved,
        compressionRate:
          ((result.tokens_saved / result.original_token_count) * 100) || 0,
      });

      await refreshProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize prompt';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (optimizedPrompt) {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const estimatedTokens = estimateTokenCount(originalPrompt);

  return (
    <div className="space-y-6">
      {aiEnabled && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-purple-200 font-medium">AI-Powered Optimization Enabled</div>
            <div className="text-purple-300/70 text-sm">Using Google Gemini for intelligent prompt optimization</div>
          </div>
        </div>
      )}
      
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Original Prompt</h2>
          <span className="text-sm text-slate-400">
            ~{estimatedTokens} tokens
          </span>
        </div>

        <textarea
          value={originalPrompt}
          onChange={(e) => setOriginalPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={6}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-300">Optimization Level:</label>
            <div className="flex gap-2">
              {(['minimal', 'moderate', 'aggressive'] as OptimizationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    level === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !originalPrompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Optimize
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {optimizedPrompt && (
        <>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Optimized Prompt</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
              {optimizedPrompt}
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="text-sm text-slate-400 mb-1">Original Tokens</div>
                <div className="text-2xl font-bold text-white">{stats.originalTokens}</div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="text-sm text-slate-400 mb-1">Optimized Tokens</div>
                <div className="text-2xl font-bold text-white">{stats.optimizedTokens}</div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="text-sm text-slate-400 mb-1">Tokens Saved</div>
                <div className="text-2xl font-bold text-green-400">{stats.tokensSaved}</div>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="text-sm text-slate-400 mb-1">Compression</div>
                <div className="text-2xl font-bold text-blue-400">
                  {stats.compressionRate.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
