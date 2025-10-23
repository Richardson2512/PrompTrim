type OptimizationLevel = 'aggressive' | 'moderate' | 'minimal';

interface OptimizationResult {
  optimizedText: string;
  strategy: string;
}

const aggressiveOptimizations = [
  { pattern: /\b(please|kindly|could you|would you|can you)\b/gi, replacement: '' },
  { pattern: /\b(very|really|quite|extremely|highly)\b/gi, replacement: '' },
  { pattern: /\b(I want you to|I need you to|You should|You must)\b/gi, replacement: '' },
  { pattern: /\b(basically|actually|literally|honestly)\b/gi, replacement: '' },
  { pattern: /\.\s+/g, replacement: '. ' },
  { pattern: /\s{2,}/g, replacement: ' ' },
  { pattern: /\b(that is|which is|who is)\b/gi, replacement: '' },
];

const moderateOptimizations = [
  { pattern: /\s{2,}/g, replacement: ' ' },
  { pattern: /\b(please|kindly)\b/gi, replacement: '' },
  { pattern: /\b(very|really)\b/gi, replacement: '' },
  { pattern: /\.\s+/g, replacement: '. ' },
];

const minimalOptimizations = [
  { pattern: /\s{2,}/g, replacement: ' ' },
  { pattern: /\.\s{2,}/g, replacement: '. ' },
];

const abbreviate = (text: string): string => {
  const abbreviations: Record<string, string> = {
    'information': 'info',
    'description': 'desc',
    'example': 'ex',
    'examples': 'exs',
    'documentation': 'docs',
    'application': 'app',
    'applications': 'apps',
    'development': 'dev',
    'production': 'prod',
    'environment': 'env',
    'configuration': 'config',
    'database': 'db',
    'number': 'num',
    'maximum': 'max',
    'minimum': 'min',
    'average': 'avg',
    'approximately': 'approx',
    'management': 'mgmt',
  };

  let result = text;
  Object.entries(abbreviations).forEach(([full, abbr]) => {
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, abbr);
  });

  return result;
};

const removeRedundancy = (text: string): string => {
  const sentences = text.split(/\.\s+/);
  const uniqueSentences = [...new Set(sentences.map(s => s.trim().toLowerCase()))];

  if (uniqueSentences.length < sentences.length) {
    return sentences.filter((sent, idx) => {
      const normalized = sent.trim().toLowerCase();
      return sentences.findIndex(s => s.trim().toLowerCase() === normalized) === idx;
    }).join('. ');
  }

  return text;
};

const simplifyStructure = (text: string): string => {
  let result = text;

  result = result.replace(/\b(in order to)\b/gi, 'to');
  result = result.replace(/\b(due to the fact that)\b/gi, 'because');
  result = result.replace(/\b(at this point in time)\b/gi, 'now');
  result = result.replace(/\b(for the purpose of)\b/gi, 'for');
  result = result.replace(/\b(in the event that)\b/gi, 'if');
  result = result.replace(/\b(with regard to|with respect to)\b/gi, 'about');

  return result;
};

export const optimizePrompt = (
  originalText: string,
  level: OptimizationLevel = 'moderate'
): OptimizationResult => {
  let optimized = originalText.trim();
  const strategies: string[] = [];

  const optimizations =
    level === 'aggressive' ? aggressiveOptimizations :
    level === 'moderate' ? moderateOptimizations :
    minimalOptimizations;

  optimizations.forEach(({ pattern, replacement }) => {
    optimized = optimized.replace(pattern, replacement);
  });

  if (level === 'aggressive' || level === 'moderate') {
    optimized = simplifyStructure(optimized);
    strategies.push('simplified structure');
  }

  if (level === 'aggressive') {
    optimized = abbreviate(optimized);
    strategies.push('used abbreviations');

    optimized = removeRedundancy(optimized);
    strategies.push('removed redundancy');
  }

  optimized = optimized.replace(/\s{2,}/g, ' ').trim();

  if (!optimized.endsWith('.') && !optimized.endsWith('?') && !optimized.endsWith('!')) {
    if (originalText.endsWith('.') || originalText.endsWith('?') || originalText.endsWith('!')) {
      optimized += originalText.slice(-1);
    }
  }

  strategies.unshift('removed filler words');

  return {
    optimizedText: optimized,
    strategy: strategies.join(', '),
  };
};
