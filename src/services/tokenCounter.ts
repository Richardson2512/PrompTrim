export const estimateTokenCount = (text: string): number => {
  const cleanText = text.trim();
  const words = cleanText.split(/\s+/).length;
  const characters = cleanText.length;

  const tokenEstimate = Math.ceil((words * 1.3 + characters * 0.25) / 2);

  return Math.max(1, tokenEstimate);
};

export const calculateCostSaved = (tokensSaved: number, pricePerMillionTokens: number = 2.0): number => {
  return (tokensSaved / 1_000_000) * pricePerMillionTokens;
};

export const calculateCompressionRate = (originalTokens: number, optimizedTokens: number): number => {
  if (originalTokens === 0) return 0;
  return ((originalTokens - optimizedTokens) / originalTokens) * 100;
};
