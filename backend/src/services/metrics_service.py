"""Generation metrics service."""
from typing import Optional
from uuid import UUID

from src.db.repositories.metrics_repo import MetricsRepository
from src.db.repositories.chat_repo import ChatRepository
from src.db.repositories.project_repo import ProjectRepository
from src.schemas.metrics import GenerationMetric, GenerationMetricCreate, ChatMetricsResponse


class MetricsService:
    """Service for generation metrics operations."""

    @staticmethod
    def create(chat_id: UUID, user_id: UUID, metric_data: GenerationMetricCreate) -> GenerationMetric:
        """Create a new generation metric (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        metric_dict = MetricsRepository.create(
            chat_id=chat_id,
            model_name=metric_data.model_name,
            input_tokens=metric_data.input_tokens,
            output_tokens=metric_data.output_tokens,
            total_tokens=metric_data.total_tokens,
            latency_ms=metric_data.latency_ms,
            document_id=metric_data.document_id,
            context_tokens_retrieved=metric_data.context_tokens_retrieved,
            is_differential=metric_data.is_differential
        )
        return GenerationMetric(**metric_dict)

    @staticmethod
    def get_by_chat(chat_id: UUID, user_id: UUID) -> ChatMetricsResponse:
        """Get aggregated metrics for a chat (with user validation)."""
        # Validate chat ownership
        chat = ChatRepository.get_by_id(chat_id)
        if not chat:
            raise ValueError("Chat not found")
        
        project = ProjectRepository.get_by_id(UUID(chat["project_id"]))
        if not project or project["user_id"] != str(user_id):
            raise ValueError("Access denied")
        
        aggregated = MetricsRepository.get_aggregated_by_chat(chat_id)
        metrics = [GenerationMetric(**m) for m in aggregated["metrics"]]
        
        return ChatMetricsResponse(
            total_tokens=aggregated["total_tokens"],
            total_input_tokens=aggregated["total_input_tokens"],
            total_output_tokens=aggregated["total_output_tokens"],
            average_latency_ms=aggregated["average_latency_ms"],
            generation_count=aggregated["generation_count"],
            differential_generations=aggregated["differential_generations"],
            metrics=metrics
        )

