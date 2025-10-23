import { supabase, Prompt } from '../lib/supabase';
import { optimizePrompt } from './promptOptimizer';
import { optimizePromptWithAI, isGeminiConfigured } from './geminiService';
import { estimateTokenCount, calculateCostSaved } from './tokenCounter';

type OptimizationLevel = 'aggressive' | 'moderate' | 'minimal';

export const createOptimizedPrompt = async (
  userId: string,
  originalText: string,
  level: OptimizationLevel = 'moderate'
): Promise<Prompt> => {
  const originalTokenCount = estimateTokenCount(originalText);

  // Use AI optimization if Gemini is configured, otherwise fall back to regex
  let optimizedText: string;
  if (isGeminiConfigured()) {
    optimizedText = await optimizePromptWithAI(originalText, level);
  } else {
    const result = optimizePrompt(originalText, level);
    optimizedText = result.optimizedText;
  }
  
  const optimizedTokenCount = estimateTokenCount(optimizedText);

  const tokensSaved = Math.max(0, originalTokenCount - optimizedTokenCount);
  const costSaved = calculateCostSaved(tokensSaved);

  const { data, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      original_text: originalText,
      original_token_count: originalTokenCount,
      optimized_text: optimizedText,
      optimized_token_count: optimizedTokenCount,
      tokens_saved: tokensSaved,
      optimization_level: level,
      language: 'en',
      status: 'completed',
      cost_saved_usd: costSaved,
    })
    .select()
    .single();

  if (error) throw error;

  await updateUserTokenUsage(userId, originalTokenCount);
  await updateDailyAnalytics(userId, tokensSaved, costSaved);

  return data;
};

export const getUserPrompts = async (
  userId: string,
  limit: number = 50
): Promise<Prompt[]> => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const updateUserTokenUsage = async (
  userId: string,
  tokensUsed: number
): Promise<void> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tokens_used_this_month')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        tokens_used_this_month: profile.tokens_used_this_month + tokensUsed,
      })
      .eq('id', userId);
  }
};

export const updateDailyAnalytics = async (
  userId: string,
  tokensSaved: number,
  costSaved: number
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('analytics_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    const newTotalPrompts = existing.total_prompts + 1;
    const newTotalTokensSaved = existing.total_tokens_saved + tokensSaved;
    const newTotalCostSaved = parseFloat(existing.total_cost_saved_usd.toString()) + costSaved;

    await supabase
      .from('analytics_daily')
      .update({
        total_prompts: newTotalPrompts,
        total_tokens_saved: newTotalTokensSaved,
        total_cost_saved_usd: newTotalCostSaved,
        avg_compression_rate: (newTotalTokensSaved / newTotalPrompts) || 0,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('analytics_daily')
      .insert({
        user_id: userId,
        date: today,
        total_prompts: 1,
        total_tokens_saved: tokensSaved,
        total_cost_saved_usd: costSaved,
        avg_compression_rate: tokensSaved,
      });
  }
};
