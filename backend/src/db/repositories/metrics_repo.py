"""Generation metrics repository."""
from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class MetricsRepository:
    """Repository for generation metrics operations."""

    @staticmethod
    def create(
        chat_id: UUID,
        model_name: str,
        input_tokens: int,
        output_tokens: int,
        total_tokens: int,
        latency_ms: int,
        document_id: Optional[UUID] = None,
        context_tokens_retrieved: Optional[int] = None,
        is_differential: bool = False
    ) -> dict:
        """Create a new generation metric."""
        supabase = get_supabase_admin_client()
        data = {
            "chat_id": str(chat_id),
            "model_name": model_name,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "latency_ms": latency_ms,
            "is_differential": is_differential
        }
        
        if document_id:
            data["document_id"] = str(document_id)
        if context_tokens_retrieved is not None:
            data["context_tokens_retrieved"] = context_tokens_retrieved
        
        result = supabase.table("generation_metrics").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create generation metric")

    @staticmethod
    def get_by_chat(chat_id: UUID) -> list[dict]:
        """Get all metrics for a chat."""
        supabase = get_supabase_admin_client()
        result = supabase.table("generation_metrics").select("*").eq(
            "chat_id", str(chat_id)
        ).order("created_at", desc=True).execute()
        
        return result.data if result.data else []

    @staticmethod
    def get_aggregated_by_chat(chat_id: UUID) -> dict:
        """Get aggregated metrics for a chat."""
        metrics = MetricsRepository.get_by_chat(chat_id)
        
        if not metrics:
            return {
                "total_tokens": 0,
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "average_latency_ms": 0.0,
                "generation_count": 0,
                "differential_generations": 0,
                "metrics": []
            }
        
        total_tokens = sum(m["total_tokens"] for m in metrics)
        total_input_tokens = sum(m["input_tokens"] for m in metrics)
        total_output_tokens = sum(m["output_tokens"] for m in metrics)
        total_latency = sum(m["latency_ms"] for m in metrics)
        generation_count = len(metrics)
        differential_generations = sum(1 for m in metrics if m.get("is_differential", False))
        average_latency_ms = total_latency / generation_count if generation_count > 0 else 0.0
        
        return {
            "total_tokens": total_tokens,
            "total_input_tokens": total_input_tokens,
            "total_output_tokens": total_output_tokens,
            "average_latency_ms": average_latency_ms,
            "generation_count": generation_count,
            "differential_generations": differential_generations,
            "metrics": metrics
        }

