from typing import Dict, Any, List, Optional
import spacy
from textstat import syllable_count
import re

class GrammarService:
    def __init__(self):
        # Load spaCy English model
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("spaCy model loaded successfully")
        except OSError:
            print("Warning: spaCy English model not found. Install with: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def check_grammar(self, text: str) -> Dict[str, Any]:
        """
        Check grammar using Grammarkit-style rules and spaCy parsing
        
        Args:
            text: The text to check
            
        Returns:
            Dictionary with grammar check results
        """
        if not self.nlp:
            return {
                "hasErrors": False,
                "errors": [],
                "errorCount": 0,
                "warnings": []
            }
        
        doc = self.nlp(text)
        errors = []
        
        # Check for various grammar issues
        sentence_errors = self._check_sentence_structure(doc)
        errors.extend(sentence_errors)
        
        word_errors = self._check_word_usage(doc)
        errors.extend(word_errors)
        
        punctuation_errors = self._check_punctuation(text)
        errors.extend(punctuation_errors)
        
        # Remove duplicate errors (same position)
        unique_errors = self._remove_duplicate_errors(errors)
        
        return {
            "hasErrors": len(unique_errors) > 0,
            "errors": unique_errors,
            "errorCount": len(unique_errors),
            "warnings": []
        }
    
    def _check_sentence_structure(self, doc) -> List[Dict[str, Any]]:
        """Check sentence structure issues"""
        errors = []
        
        for sent in doc.sents:
            # Check for run-on sentences (too many clauses)
            clauses = sum(1 for token in sent if token.dep_ == "ROOT")
            if len(sent) > 30 and clauses > 3:
                errors.append({
                    "message": "Run-on sentence detected",
                    "shortMessage": "Run-on sentence",
                    "replacements": [],
                    "offset": sent.start_char,
                    "length": len(sent.text),
                    "rule": "run_on_sentence"
                })
            
            # Check for sentence fragments
            if not any(token.pos_ == "VERB" for token in sent):
                errors.append({
                    "message": "Sentence fragment detected",
                    "shortMessage": "Fragment",
                    "replacements": [],
                    "offset": sent.start_char,
                    "length": len(sent.text),
                    "rule": "fragment"
                })
        
        return errors
    
    def _check_word_usage(self, doc) -> List[Dict[str, Any]]:
        """Check word usage issues (their/there, its/it's, etc.)"""
        errors = []
        
        # Common confusion pairs
        confusion_pairs = {
            "their": "there",
            "there": "their",
            "they're": "their",
            "your": "you're",
            "you're": "your",
            "its": "it's",
            "it's": "its"
        }
        
        for token in doc:
            word_lower = token.text.lower()
            if word_lower in confusion_pairs:
                # Check if it's used correctly in context
                # This is simplified - in production, use proper context analysis
                continue
        
        # Check for repeated words
        prev_token = None
        for token in doc:
            if prev_token and token.text.lower() == prev_token.text.lower():
                errors.append({
                    "message": f"Repeated word: '{token.text}'",
                    "shortMessage": "Repeated word",
                    "replacements": [],
                    "offset": token.idx,
                    "length": len(token.text),
                    "rule": "repeated_word"
                })
            prev_token = token
        
        return errors
    
    def _check_punctuation(self, text: str) -> List[Dict[str, Any]]:
        """Check punctuation issues"""
        errors = []
        
        # Check for missing apostrophes in contractions
        contractions = [
            (r"(\w+)\s+nt\b", r"\1n't"),
            (r"(\w+)\s+ll\b", r"\1'll"),
            (r"(\w+)\s+re\b", r"\1're"),
            (r"(\w+)\s+ve\b", r"\1've"),
        ]
        
        for pattern, replacement in contractions:
            matches = re.finditer(pattern, text)
            for match in matches:
                errors.append({
                    "message": "Missing apostrophe in contraction",
                    "shortMessage": "Missing apostrophe",
                    "replacements": [replacement],
                    "offset": match.start(),
                    "length": match.end() - match.start(),
                    "rule": "contraction"
                })
        
        # Check for double spaces
        double_spaces = re.finditer(r' {2,}', text)
        for match in double_spaces:
            errors.append({
                "message": "Multiple spaces detected",
                "shortMessage": "Extra spaces",
                "replacements": [" "],
                "offset": match.start(),
                "length": match.end() - match.start(),
                "rule": "double_space"
            })
        
        return errors
    
    def _remove_duplicate_errors(self, errors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate errors at the same position"""
        seen = set()
        unique = []
        
        for error in errors:
            key = (error["offset"], error["length"], error["rule"])
            if key not in seen:
                seen.add(key)
                unique.append(error)
        
        return unique
    
    def correct_grammar(self, text: str, errors: List[Dict[str, Any]]) -> str:
        """
        Apply grammar corrections to text
        
        Args:
            text: Original text
            errors: List of grammar errors
            
        Returns:
            Corrected text
        """
        if not errors:
            return text
        
        # Sort errors by position (backwards to maintain indices)
        sorted_errors = sorted(errors, key=lambda e: e["offset"], reverse=True)
        
        corrected_text = text
        
        for error in sorted_errors:
            start = error["offset"]
            end = start + error["length"]
            
            # Get replacement
            replacement = error.get("replacements", [])
            if replacement and len(replacement) > 0:
                new_text = replacement[0]
            else:
                # No replacement provided, keep original
                new_text = text[start:end]
            
            corrected_text = corrected_text[:start] + new_text + corrected_text[end:]
        
        return corrected_text


# Initialize service
grammar_service = GrammarService()

def get_grammar_service():
    """Get the grammar service instance"""
    return grammar_service

