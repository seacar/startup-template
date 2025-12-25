"""Generation metrics schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class GenerationMetricBase(BaseModel):
    """Base generation metric schema."""
    model_name: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    latency_ms: int


class GenerationMetricCreate(BaseModel):
    """Schema for creating a generation metric."""
    model_name: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    latency_ms: int
    context_tokens_retrieved: Optional[int] = None
    is_differential: bool = False
    document_id: Optional[UUID] = None


class GenerationMetric(GenerationMetricBase):
    """Generation metric schema."""
    id: UUID
    chat_id: UUID
    document_id: Optional[UUID] = None
    context_tokens_retrieved: Optional[int] = None
    is_differential: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMetricsResponse(BaseModel):
    """Response schema for chat metrics."""
    total_tokens: int
    total_input_tokens: int
    total_output_tokens: int
    average_latency_ms: float
    generation_count: int
    differential_generations: int
    metrics: list[GenerationMetric]

