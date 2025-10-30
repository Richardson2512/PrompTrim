from typing import Tuple, Dict, Any
import logging

import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import numpy as np


class QualityAssuredSummarizer:
    def __init__(self, similarity_threshold: float = 0.75):
        # BART for summarization
        self.summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=0 if torch.cuda.is_available() else -1
        )

        # MiniLM for semantic similarity
        self.similarity_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Quality control
        self.similarity_threshold = similarity_threshold
        self.max_iterations = 3
        self.logger = logging.getLogger(__name__)

    def calculate_similarity(self, original: str, compressed: str) -> float:
        """Measure semantic similarity between original and compressed text."""
        original_emb = self.similarity_model.encode(original, convert_to_tensor=True)
        compressed_emb = self.similarity_model.encode(compressed, convert_to_tensor=True)
        similarity = util.cos_sim(original_emb, compressed_emb).item()
        return similarity

    def smart_recompression(self, original: str, poor_summary: str, iteration: int) -> str:
        """Apply targeted fixes based on similarity failure patterns."""
        if iteration == 1:
            prompt = f"Summarize this while preserving ALL key facts and entities:\n\n{original}"
        elif iteration == 2:
            sentences = self.extractive_summary(original, n_sentences=3)
            prompt = f"Expand this into a complete summary: {sentences}"
        else:
            return self.extractive_summary(original, n_sentences=2)

        result = self.summarizer(prompt, max_length=120, min_length=50, do_sample=True)[0]
        return result["summary_text"]

    def extractive_summary(self, text: str, n_sentences: int = 3) -> str:
        """Fallback: Extract top sentences by TF-IDF."""
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        sentences = [s.strip() for s in text.split('. ') if s.strip()]
        if len(sentences) <= n_sentences:
            return text

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(sentences)
        similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

        scores = np.mean(similarity_matrix, axis=1)
        top_indices = np.argsort(scores)[-n_sentences:]

        return ' '.join([sentences[i] + '.' for i in top_indices])

    def summarize_with_quality_check(
        self,
        text: str,
        max_length: int = 100,
        target_similarity: float = 0.75
    ) -> Tuple[str, float, int]:
        """
        Compress with iterative quality improvement.
        Returns: (summary, final_similarity, iterations_used)
        """
        original = text
        if not original:
            return "", 1.0, 0

        for iteration in range(self.max_iterations):
            if len(original) < 50:
                return original, 1.0, 0

            summary = self.summarizer(
                original,
                max_length=max(30, min(max_length, max(30, len(original) // 3))),
                min_length=30,
                do_sample=(iteration > 0)
            )[0]["summary_text"]

            similarity = self.calculate_similarity(text, summary)
            self.logger.info(f"Iteration {iteration + 1}: Similarity = {similarity:.3f}")

            if similarity >= target_similarity or iteration == self.max_iterations - 1:
                return summary, similarity, iteration + 1

            # Poor quality: try smarter compression on the original text
            original = self.smart_recompression(text, summary, iteration + 1)

        # Fallback
        fallback = self.extractive_summary(text)
        similarity = self.calculate_similarity(text, fallback)
        return fallback, similarity, self.max_iterations


def build_quality_summary_response(raw_output: str, final_summary: str, similarity_score: float, iterations: int) -> Dict[str, Any]:
    original_tokens = len(raw_output.split())
    compressed_tokens = len(final_summary.split())
    reduction = 0.0
    if original_tokens > 0:
        reduction = (original_tokens - compressed_tokens) / original_tokens
    return {
        "output": final_summary,
        "quality_metrics": {
            "similarity_to_original": similarity_score,
            "iterations_used": iterations,
            "target_met": similarity_score >= 0.75
        },
        "token_savings": {
            "original_output": original_tokens,
            "compressed_output": compressed_tokens,
            "reduction_percent": round(reduction * 100, 2)
        }
    }


