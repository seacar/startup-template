// Data models matching backend Pydantic schemas

export interface User {
  id: string;
  cookie_id: string;
  name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserListItem {
  id: string;
  cookie_id: string;
  name?: string | null;
  created_at: string;
  project_count: number;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
}

export interface UserSwitchRequest {
  user_id: string;
}

export interface UserSwitchResponse {
  id: string;
  cookie_id: string;
  name?: string | null;
  message: string;
}

export interface UserUpdate {
  name?: string | null;
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  chat_count: number;
}

export interface ProjectListResponse {
  projects: ProjectListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProjectCreate {
  name: string;
  description?: string | null;
}

export interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
}

export interface ProjectDetail extends Project {
  chat_count: number;
  context_count: number;
}

// Chat types
export interface Chat {
  id: string;
  project_id: string;
  title: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

export interface ChatListItem {
  id: string;
  project_id: string;
  title: string;
  document_type: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  latest_document_version?: number | null;
}

export interface ChatListResponse {
  chats: ChatListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatCreate {
  document_type: string;
}

export interface ChatCreateResponse extends Chat {
  suggested_questions: string[];
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatDetail extends Chat {
  messages: Message[];
  current_document?: Document | null;
}

// Document types
export interface Document {
  id: string;
  chat_id: string;
  version: number;
  content: string;
  diff_from_previous?: string | null;
  token_input: number;
  token_output: number;
  generation_time_ms?: number | null;
  created_at: string;
}

export interface DocumentListItem {
  id: string;
  version: number;
  token_input: number;
  token_output: number;
  generation_time_ms?: number | null;
  created_at: string;
}

export interface DocumentListResponse {
  documents: DocumentListItem[];
  total_versions: number;
}

// WebSocket message types
export interface WebSocketMessageRequest {
  type: "message";
  content: string;
  selected_response_id?: string;
  regenerate?: boolean;
}

export interface WebSocketTokenEvent {
  type: "token";
  token: string;
  content_type: "content";
}

export interface WebSocketFollowUpEvent {
  type: "follow_up";
  question: string;
  suggested_responses: string[];
  id: string;
}

export interface WebSocketMetricsEvent {
  type: "metrics";
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
}

export interface WebSocketCompleteEvent {
  type: "complete";
  document_id: string;
  version: number;
  message_id: string;
}

export interface WebSocketErrorEvent {
  type: "error";
  error: string;
}

export type WebSocketEvent =
  | WebSocketTokenEvent
  | WebSocketFollowUpEvent
  | WebSocketMetricsEvent
  | WebSocketCompleteEvent
  | WebSocketErrorEvent;

// Context types
export type ContextScope = "global" | "user" | "project" | "chat";

export interface ContextItem {
  id: string;
  user_id?: string | null;
  project_id?: string | null;
  chat_id?: string | null;
  scope: ContextScope;
  title: string;
  content: string;
  file_url?: string | null;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContextItemCreate {
  scope: ContextScope;
  project_id?: string;
  chat_id?: string;
  title: string;
  content?: string;
  file?: File;
}

export interface ContextItemResponse extends ContextItem {
  chunks_created: number;
  embeddings_created: number;
}

export interface ContextListResponse {
  context_items: ContextItem[];
  total: number;
  limit: number;
  offset: number;
}

// Document type types
export interface DocumentType {
  id: string;
  name: string;
  description?: string | null;
  template_prompt?: string | null;
  example_output?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DocumentTypeListResponse {
  document_types: DocumentType[];
}

// Metrics types
export interface GenerationMetrics {
  id: string;
  chat_id: string;
  document_id?: string | null;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  latency_ms: number;
  context_tokens_retrieved?: number | null;
  is_differential: boolean;
  created_at: string;
}

export interface ChatMetricsResponse {
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  average_latency_ms: number;
  generation_count: number;
  differential_generations: number;
  metrics: GenerationMetrics[];
}

