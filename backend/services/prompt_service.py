from supabase import Client
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid
from .tinyllama_service import TinyLlamaService
from database import get_supabase
from models import Prompt

class PromptOptimizationService:
    def __init__(self):
        self.tinyllama_service = TinyLlamaService()
        self.supabase = get_supabase()
    
    async def optimize_prompt(
        self, 
        user_id: str,
        original_prompt: str, 
        optimization_level: str = "moderate",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Optimize a prompt using TinyLlama compression and save to Supabase
        
        Args:
            user_id: User ID
            original_prompt: The original prompt to optimize
            optimization_level: Optimization level (aggressive, moderate, minimal)
            language: Language code
        
        Returns:
            Dictionary with optimization results
        """
        try:
            # Map optimization level to compression ratio
            compression_ratios = {
                "minimal": 0.8,
                "moderate": 0.5,
                "aggressive": 0.3
            }
            compression_ratio = compression_ratios.get(optimization_level, 0.5)
            
            # Use TinyLlama to compress the prompt
            result = self.tinyllama_service.compress_prompt(
                prompt=original_prompt,
                compression_ratio=compression_ratio
            )
            
            # Calculate cost savings (assuming $0.03 per 1K tokens)
            cost_per_token = 0.03 / 1000
            tokens_saved = result["original_tokens"] - result["optimized_tokens"]
            cost_saved_usd = tokens_saved * cost_per_token
            
            # Create prompt record in Supabase
            prompt_id = str(uuid.uuid4())
            prompt_data = {
                "id": prompt_id,
                "user_id": user_id,
                "original_text": original_prompt,
                "original_token_count": result["original_tokens"],
                "optimized_text": result["optimized_prompt"],
                "optimized_token_count": result["optimized_tokens"],
                "tokens_saved": tokens_saved,
                "optimization_level": optimization_level,
                "language": language,
                "status": "completed",
                "cost_saved_usd": cost_saved_usd
            }
            
            # Insert into Supabase
            self.supabase.table("prompts").insert(prompt_data).execute()
            
            # Update user's token usage
            self._update_user_token_usage(user_id, tokens_saved)
            
            # Update daily analytics
            self._update_daily_analytics(user_id, tokens_saved, cost_saved_usd)
            
            return {
                "id": prompt_id,
                "original_text": original_prompt,
                "optimized_text": result["optimized_prompt"],
                "original_token_count": result["original_tokens"],
                "optimized_token_count": result["optimized_tokens"],
                "tokens_saved": tokens_saved,
                "optimization_level": optimization_level,
                "cost_saved_usd": cost_saved_usd,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error in prompt optimization: {e}")
            # Return original prompt with basic metrics
            return {
                "id": str(uuid.uuid4()),
                "original_text": original_prompt,
                "optimized_text": original_prompt,
                "original_token_count": len(original_prompt.split()),
                "optimized_token_count": len(original_prompt.split()),
                "tokens_saved": 0,
                "optimization_level": optimization_level,
                "cost_saved_usd": 0.0,
                "created_at": datetime.utcnow().isoformat()
            }
    
    def _update_user_token_usage(self, user_id: str, tokens_saved: int):
        """Update user's monthly token usage"""
        try:
            # Get current profile
            result = self.supabase.table("profiles").select("tokens_used_this_month").eq("id", user_id).execute()
            if result.data:
                current_usage = result.data[0]["tokens_used_this_month"]
                new_usage = current_usage + tokens_saved
                
                # Update the profile
                self.supabase.table("profiles").update({
                    "tokens_used_this_month": new_usage
                }).eq("id", user_id).execute()
        except Exception as e:
            print(f"Error updating user token usage: {e}")
    
    def _update_daily_analytics(self, user_id: str, tokens_saved: int, cost_saved_usd: float):
        """Update daily analytics"""
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Check if analytics record exists for today
            result = self.supabase.table("analytics_daily").select("*").eq("user_id", user_id).eq("date", today).execute()
            
            if result.data:
                # Update existing record
                current = result.data[0]
                self.supabase.table("analytics_daily").update({
                    "total_prompts": current["total_prompts"] + 1,
                    "total_tokens_saved": current["total_tokens_saved"] + tokens_saved,
                    "total_cost_saved_usd": current["total_cost_saved_usd"] + cost_saved_usd,
                    "avg_compression_rate": (current["avg_compression_rate"] + (tokens_saved / max(current["total_tokens_saved"] + tokens_saved, 1))) / 2
                }).eq("id", current["id"]).execute()
            else:
                # Create new record
                analytics_data = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "date": today,
                    "total_prompts": 1,
                    "total_tokens_saved": tokens_saved,
                    "total_cost_saved_usd": cost_saved_usd,
                    "avg_compression_rate": 0.5  # Default compression rate
                }
                self.supabase.table("analytics_daily").insert(analytics_data).execute()
        except Exception as e:
            print(f"Error updating daily analytics: {e}")
    
    def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """
        Get usage analytics for a user
        
        Args:
            user_id: User ID to get analytics for
        
        Returns:
            Dictionary with analytics data
        """
        try:
            # Get total prompts
            prompts_result = self.supabase.table("prompts").select("*").eq("user_id", user_id).execute()
            total_prompts = len(prompts_result.data) if prompts_result.data else 0
            
            # Calculate totals
            total_tokens_saved = sum(prompt["tokens_saved"] for prompt in prompts_result.data) if prompts_result.data else 0
            total_cost_saved = sum(prompt["cost_saved_usd"] for prompt in prompts_result.data) if prompts_result.data else 0
            
            # Calculate average compression rate
            if prompts_result.data and total_tokens_saved > 0:
                total_original_tokens = sum(prompt["original_token_count"] for prompt in prompts_result.data)
                avg_compression_rate = total_tokens_saved / total_original_tokens if total_original_tokens > 0 else 0
            else:
                avg_compression_rate = 0.0
            
            # Get prompts this month
            month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_prompts = [p for p in (prompts_result.data or []) if datetime.fromisoformat(p["created_at"].replace('Z', '+00:00')) >= month_start]
            prompts_this_month = len(month_prompts)
            
            return {
                "total_prompts": total_prompts,
                "total_tokens_saved": total_tokens_saved,
                "total_cost_saved_usd": total_cost_saved,
                "avg_compression_rate": round(avg_compression_rate, 3),
                "prompts_this_month": prompts_this_month
            }
            
        except Exception as e:
            print(f"Error getting user analytics: {e}")
            return {
                "total_prompts": 0,
                "total_tokens_saved": 0,
                "total_cost_saved_usd": 0.0,
                "avg_compression_rate": 0.0,
                "prompts_this_month": 0
            }
