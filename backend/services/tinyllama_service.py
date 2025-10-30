from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from typing import Dict, Any
import re

class TinyLlamaService:
    def __init__(self):
        self.model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        self.tokenizer = None
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load TinyLlama model and tokenizer"""
        try:
            print("Loading TinyLlama model...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            print("TinyLlama model loaded successfully")
        except Exception as e:
            print(f"Error loading TinyLlama model: {e}")
            raise e
    
    def compress_prompt(self, prompt: str, compression_ratio: float = 0.5) -> Dict[str, Any]:
        """
        Compress a prompt using TinyLlama while maintaining semantic meaning
        
        Args:
            prompt: Original prompt text
            compression_ratio: Target compression ratio (0.1 to 0.9)
        
        Returns:
            Dictionary containing compressed prompt and metadata
        """
        try:
            # Tokenize the original prompt
            original_tokens = self.tokenizer.encode(prompt, return_tensors="pt")
            original_token_count = len(original_tokens[0])
            
            # Calculate target token count
            target_tokens = max(1, int(original_token_count * compression_ratio))
            
            # Create compression prompt
            compression_prompt = f"""<|system|>
You are an expert at compressing text while preserving all essential information and meaning. 
Compress the following text to approximately {target_tokens} tokens while maintaining:
- All key concepts and requirements
- Technical accuracy
- Complete instructions
- Important details

<|user|>
Compress this text: {prompt}

<|assistant|>
Compressed version:"""
            
            # Generate compressed version
            inputs = self.tokenizer.encode(compression_prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=target_tokens * 2,  # Allow some flexibility
                    temperature=0.3,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    repetition_penalty=1.1
                )
            
            # Decode the generated text
            generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract the compressed prompt
            compressed_prompt = self._extract_compressed_text(generated_text, prompt)
            
            # Count tokens in compressed version
            compressed_tokens = self.tokenizer.encode(compressed_prompt, return_tensors="pt")
            compressed_token_count = len(compressed_tokens[0])
            
            # Calculate actual compression ratio
            actual_compression_ratio = compressed_token_count / original_token_count
            savings_percentage = (1 - actual_compression_ratio) * 100
            
            return {
                "optimized_prompt": compressed_prompt,
                "original_tokens": original_token_count,
                "optimized_tokens": compressed_token_count,
                "compression_ratio": actual_compression_ratio,
                "savings_percentage": savings_percentage
            }
            
        except Exception as e:
            print(f"Error compressing prompt: {e}")
            # Fallback: return original prompt with basic compression
            return self._fallback_compression(prompt, compression_ratio)
    
    def _extract_compressed_text(self, generated_text: str, original_prompt: str) -> str:
        """Extract the compressed text from the generated response"""
        # Look for the compressed version after "Compressed version:"
        if "Compressed version:" in generated_text:
            compressed = generated_text.split("Compressed version:")[-1].strip()
        else:
            # Fallback: use the last part of generated text
            compressed = generated_text.split("<|assistant|>")[-1].strip()
        
        # Clean up the text
        compressed = re.sub(r'<\|.*?\|>', '', compressed).strip()
        
        # If compression failed or is too short, use original
        if len(compressed) < len(original_prompt) * 0.1:
            return self._fallback_compression(original_prompt, 0.5)["optimized_prompt"]
        
        return compressed
    
    def _fallback_compression(self, prompt: str, compression_ratio: float) -> Dict[str, Any]:
        """Fallback compression method using simple text reduction"""
        # Simple word-based compression
        words = prompt.split()
        target_word_count = max(1, int(len(words) * compression_ratio))
        
        # Keep important words (longer words, words with capitals, etc.)
        word_importance = []
        for word in words:
            importance = 0
            if len(word) > 4:
                importance += 1
            if word[0].isupper():
                importance += 1
            if any(char.isdigit() for char in word):
                importance += 1
            word_importance.append((word, importance))
        
        # Sort by importance and take top words
        word_importance.sort(key=lambda x: x[1], reverse=True)
        selected_words = [word for word, _ in word_importance[:target_word_count]]
        
        # Reconstruct prompt maintaining some structure
        compressed_prompt = " ".join(selected_words)
        
        # Count tokens (rough estimate)
        original_tokens = len(prompt.split())
        compressed_tokens = len(compressed_prompt.split())
        actual_compression_ratio = compressed_tokens / original_tokens
        savings_percentage = (1 - actual_compression_ratio) * 100
        
        return {
            "optimized_prompt": compressed_prompt,
            "original_tokens": original_tokens,
            "optimized_tokens": compressed_tokens,
            "compression_ratio": actual_compression_ratio,
            "savings_percentage": savings_percentage
        }
