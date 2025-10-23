import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key not found. AI optimization will be unavailable.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

type OptimizationLevel = 'aggressive' | 'moderate' | 'minimal';

const getSystemPrompt = (level: OptimizationLevel): string => {
  const basePrompt = `You are an expert AI prompt optimizer. Your task is to optimize prompts to reduce token count while preserving meaning and intent.`;

  const levelInstructions = {
    aggressive: `
Be VERY aggressive in optimization:
- Remove ALL unnecessary words, politeness terms, filler words
- Use abbreviations where possible (info, config, db, etc.)
- Eliminate redundancy completely
- Use shortest possible phrasing
- Remove examples unless critical
- Aim for 40-60% token reduction
`,
    moderate: `
Apply moderate optimization:
- Remove politeness terms (please, kindly) and filler words
- Simplify sentence structures
- Keep essential details and context
- Use some common abbreviations
- Aim for 20-35% token reduction
`,
    minimal: `
Apply minimal optimization:
- Remove only obvious filler words
- Clean up extra whitespace
- Keep the overall structure intact
- Maintain all context and details
- Aim for 10-20% token reduction
`,
  };

  return `${basePrompt}

${levelInstructions[level]}

IMPORTANT RULES:
1. Return ONLY the optimized prompt text, no explanations
2. Do NOT add quotes or formatting
3. Preserve the core meaning and intent
4. Maintain any specific technical terms or requirements
5. Keep numbered lists or structured formats if present`;
};

export const optimizePromptWithAI = async (
  originalText: string,
  level: OptimizationLevel = 'moderate'
): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const systemPrompt = getSystemPrompt(level);
    const userPrompt = `Optimize this prompt:\n\n${originalText}`;
    
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const response = result.response;
    const optimizedText = response.text().trim();
    
    // Remove quotes if the AI added them
    return optimizedText.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`AI optimization failed: ${errorMessage}`);
  }
};

export const isGeminiConfigured = (): boolean => {
  return !!apiKey;
};

