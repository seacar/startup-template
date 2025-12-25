# AI Document Generator - Project Specification

**Version:** 1.0  
**Last Updated:** December 24, 2025  
**Author:** Sean Carroll

---

**Note:** This project focuses exclusively on web application development. Mobile application development (Expo/React Native) is explicitly excluded from scope and can be added as a future enhancement if needed.

---

## Project Overview

A simplified AI-powered document generation platform that leverages Google's Gemini 3 Pro model to create high-quality markdown documents based on hierarchical context (global, user, project, and chat-specific). The system features real-time streaming generation via WebSockets with Claude-style artifacts, intelligent follow-up questions, differential document updates, and an optional user selector for easy switching between different user contexts.

### Core Principles

- **Simplicity First:** Minimal tables, cookie-based user tracking with optional user selection
- **Context Hierarchy:** Global → User → Project → Chat specific context management
- **Real-time Experience:** WebSocket streaming with artifact-style document display
- **Intelligent Interactions:** Clarifying questions with selectable responses
- **Efficient Updates:** Differential document generation to minimize token usage
- **Token Awareness:** Track and display input/output token usage per transaction
- **Developer Friendly:** Auto-generated API documentation, minimal observability overhead

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15+ (App Router, React 19)
- **Styling:** Tailwind CSS
- **Components:** Headless UI
- **Icons:** FontAwesome
- **State Management:** Zustand
- **HTTP Client:** Native fetch with Server Actions

### Backend
- **API Framework:** FastAPI (Python)
- **Deployment:** Railway
- **AI Framework:** LangGraph for orchestration
- **LLM Provider:** Google GenAI (Gemini 3 Pro)
  - Model: `gemini-3-pro`
  - Input Token Limit: 1M tokens
  - Output Token Limit: 68K tokens
- **Embeddings:** Gemini Embedding 001 (`gemini-embedding-001`)

### Database & Storage
- **Primary Database:** Supabase (PostgreSQL)
- **Vector Store:** Supabase pgvector
- **File Storage:** Supabase Storage

### API Documentation
- **Built-in Documentation:** FastAPI auto-generated OpenAPI/Swagger docs at `/docs`

---

## Architecture Overview

### System Flow

```
User (Cookie-based) 
  ↓
Next.js Frontend (Vercel)
  ↓
FastAPI Backend (Railway)
  ↓
├─→ Supabase PostgreSQL (Data)
├─→ Supabase pgvector (Embeddings)
├─→ Supabase Storage (Files)
└─→ Google GenAI API
     ├─→ Gemini 3 Pro (Generation)
     └─→ Gemini Embedding 001 (Embeddings)
```

### Key Features

1. **User Management**
   - Cookie-based user tracking (no authentication required)
   - User selector dropdown for switching between users
   - Optional display names for better organization
   - All user data isolated per cookie

2. **Hierarchical Context Management**
   - Global context (system-wide, across all users)
   - User-specific context (personal to each user)
   - Project-specific context (scoped to project)
   - Chat-specific context (scoped to individual conversation)
   - All contexts stored in vector database for semantic retrieval

3. **Intelligent Document Generation**
   - LangGraph-orchestrated multi-step generation
   - Real-time streaming via WebSockets
   - Differential updates for efficiency
   - Token usage tracking and display

4. **Interactive Workflow**
   - Initial document type suggestions
   - Clarifying questions with selectable responses
   - Free-form follow-up discussions
   - Document version history

5. **User Experience**
   - Sidebar navigation (Projects → Chats)
   - Artifact-style document display
   - Download/copy document functionality
   - Real-time generation progress

---

## Database Schema

### Tables

#### 1. `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cookie_id TEXT UNIQUE NOT NULL,
    name TEXT, -- Optional display name for user selection dropdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast cookie lookups
CREATE INDEX idx_users_cookie_id ON users(cookie_id);
```

#### 2. `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
```

#### 3. `chats`
```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- Format: "YYYY-MM-DD - Document Type"
    document_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chats_project_id ON chats(project_id);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
```

#### 4. `messages`
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing token counts, model info, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 5. `documents`
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL, -- Markdown content
    diff_from_previous TEXT, -- JSON diff for version tracking
    token_input INTEGER NOT NULL,
    token_output INTEGER NOT NULL,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_id, version)
);

-- Indexes
CREATE INDEX idx_documents_chat_id ON documents(chat_id);
CREATE INDEX idx_documents_version ON documents(chat_id, version DESC);
```

#### 6. `document_types`
```sql
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    template_prompt TEXT, -- Base prompt for this document type
    example_output TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed with common document types
INSERT INTO document_types (name, description, template_prompt) VALUES
    ('Technical Specification', 'Detailed technical documentation for software projects', 'Create a comprehensive technical specification that includes...'),
    ('Business Plan', 'Strategic business planning document', 'Generate a business plan covering...'),
    ('Product Requirements', 'Product requirements document (PRD)', 'Write a PRD that defines...'),
    ('API Documentation', 'REST API documentation', 'Document the API endpoints including...'),
    ('User Guide', 'End-user documentation', 'Create user-friendly documentation that...'),
    ('Architecture Design', 'System architecture documentation', 'Design and document the system architecture...'),
    ('Database Schema', 'Database design documentation', 'Create database schema documentation with...'),
    ('Project Proposal', 'Project proposal document', 'Write a compelling project proposal that...');
```

#### 7. `context_items`
```sql
CREATE TABLE context_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'user', 'project', 'chat')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT, -- If uploaded as file, reference to Supabase Storage
    file_type TEXT, -- e.g., 'pdf', 'txt', 'md', 'docx'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints to ensure proper scoping
    CHECK (
        (scope = 'global' AND user_id IS NULL AND project_id IS NULL AND chat_id IS NULL) OR
        (scope = 'user' AND user_id IS NOT NULL AND project_id IS NULL AND chat_id IS NULL) OR
        (scope = 'project' AND user_id IS NOT NULL AND project_id IS NOT NULL AND chat_id IS NULL) OR
        (scope = 'chat' AND user_id IS NOT NULL AND project_id IS NOT NULL AND chat_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_context_items_user_id ON context_items(user_id);
CREATE INDEX idx_context_items_project_id ON context_items(project_id);
CREATE INDEX idx_context_items_chat_id ON context_items(chat_id);
CREATE INDEX idx_context_items_scope ON context_items(scope);
```

#### 8. `context_embeddings`
```sql
CREATE TABLE context_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_item_id UUID NOT NULL REFERENCES context_items(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL, -- The chunked text
    embedding vector(768), -- Gemini Embedding 001 produces 768-dim vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(context_item_id, chunk_index)
);

-- Create vector index for similarity search
CREATE INDEX idx_context_embeddings_vector ON context_embeddings 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Regular index
CREATE INDEX idx_context_embeddings_context_item_id ON context_embeddings(context_item_id);
```

#### 9. `follow_up_questions`
```sql
CREATE TABLE follow_up_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    suggested_responses JSONB, -- Array of suggested response options
    user_response TEXT,
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_follow_up_questions_chat_id ON follow_up_questions(chat_id);
CREATE INDEX idx_follow_up_questions_message_id ON follow_up_questions(message_id);
```

#### 10. `generation_metrics`
```sql
CREATE TABLE generation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    context_tokens_retrieved INTEGER, -- Tokens from vector search
    is_differential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generation_metrics_chat_id ON generation_metrics(chat_id);
CREATE INDEX idx_generation_metrics_created_at ON generation_metrics(created_at);
```

---

## API Endpoints

### Base URL
- **Development:** `http://localhost:8000`
- **Production:** `https://api.yourdomain.com`

### Authentication
All endpoints use cookie-based user identification. The `user_cookie` is set on first visit and used to track user session.

---

### User Management

#### `GET /api/v1/users/me`
Get or create current user based on cookie.

**Response:**
```json
{
  "id": "uuid",
  "cookie_id": "string",
  "name": "string (optional)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### `GET /api/v1/users`
List all users for user selection dropdown.

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "cookie_id": "string",
      "name": "User 1 (or cookie_id if no name)",
      "created_at": "timestamp",
      "project_count": 3
    }
  ],
  "total": 5
}
```

#### `POST /api/v1/users/switch`
Switch to a different user by setting cookie.

**Request Body:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "cookie_id": "string",
  "name": "string (optional)",
  "message": "Switched to user successfully"
}
```
**Note:** This endpoint sets the `user_cookie` in the response headers.

#### `PATCH /api/v1/users/me`
Update current user's display name.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "cookie_id": "string",
  "name": "string",
  "updated_at": "timestamp"
}
```

---

### Projects

#### `GET /api/v1/projects`
List all projects for current user.

**Query Parameters:**
- `limit` (optional): Number of projects to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "string",
      "description": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "chat_count": 5
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

#### `POST /api/v1/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "description": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### `GET /api/v1/projects/{project_id}`
Get project details.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "description": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "chat_count": 5,
  "context_count": 3
}
```

#### `PATCH /api/v1/projects/{project_id}`
Update project details.

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

#### `DELETE /api/v1/projects/{project_id}`
Delete a project and all associated chats.

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

### Chats

#### `GET /api/v1/projects/{project_id}/chats`
List all chats in a project.

**Query Parameters:**
- `limit` (optional): Number of chats to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "chats": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "2025-12-24 - Technical Specification",
      "document_type": "Technical Specification",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "message_count": 12,
      "latest_document_version": 3
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

#### `POST /api/v1/projects/{project_id}/chats`
Create a new chat.

**Request Body:**
```json
{
  "document_type": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "2025-12-24 - Technical Specification",
  "document_type": "Technical Specification",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "suggested_questions": [
    "What is the main purpose of this project?",
    "Who is the target audience?",
    "What are the key technical requirements?"
  ]
}
```

#### `GET /api/v1/chats/{chat_id}`
Get chat details with message history.

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "2025-12-24 - Technical Specification",
  "document_type": "Technical Specification",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "messages": [
    {
      "id": "uuid",
      "role": "assistant",
      "content": "string",
      "metadata": {
        "input_tokens": 2500,
        "output_tokens": 1200
      },
      "created_at": "timestamp"
    }
  ],
  "current_document": {
    "id": "uuid",
    "version": 3,
    "content": "markdown string",
    "token_input": 2500,
    "token_output": 1200
  }
}
```

#### `DELETE /api/v1/chats/{chat_id}`
Delete a chat and all associated messages and documents.

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

### Messages & Document Generation

#### `WS /api/v1/chats/{chat_id}/messages`
WebSocket endpoint for real-time message streaming and document generation.

**Connection:**
```javascript
const ws = new WebSocket(`ws://localhost:8000/api/v1/chats/${chatId}/messages`);
```

**Send Message:**
```json
{
  "type": "message",
  "content": "string",
  "selected_response_id": "uuid (optional)",
  "regenerate": false
}
```

**Receive Events (WebSocket messages):**

```json
// Token streaming
{
  "type": "token",
  "token": "## Project",
  "content_type": "content"
}

// Follow-up question
{
  "type": "follow_up",
  "question": "What database will you use?",
  "suggested_responses": ["PostgreSQL", "MongoDB", "MySQL", "Other"],
  "id": "uuid"
}

// Token usage metrics
{
  "type": "metrics",
  "input_tokens": 2500,
  "output_tokens": 1200,
  "latency_ms": 3400
}

// Generation complete
{
  "type": "complete",
  "document_id": "uuid",
  "version": 3,
  "message_id": "uuid"
}

// Error
{
  "type": "error",
  "error": "Error message"
}
```

---

### Documents

#### `GET /api/v1/documents/{document_id}`
Get a specific document version.

**Response:**
```json
{
  "id": "uuid",
  "chat_id": "uuid",
  "version": 3,
  "content": "markdown string",
  "token_input": 2500,
  "token_output": 1200,
  "generation_time_ms": 3400,
  "created_at": "timestamp"
}
```

#### `GET /api/v1/chats/{chat_id}/documents`
Get all document versions for a chat.

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "version": 3,
      "token_input": 2500,
      "token_output": 1200,
      "generation_time_ms": 3400,
      "created_at": "timestamp"
    }
  ],
  "total_versions": 3
}
```

#### `GET /api/v1/documents/{document_id}/download`
Download document as markdown file.

**Response:** 
File download with `Content-Disposition: attachment; filename="document.md"`

---

### Context Management

#### `POST /api/v1/context`
Add context item (global, user, project, or chat scope).

**Request Body:**
```json
{
  "scope": "global|user|project|chat",
  "project_id": "uuid (required for project/chat scope)",
  "chat_id": "uuid (required for chat scope)",
  "title": "string",
  "content": "string (optional if file provided)",
  "file": "multipart file (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "scope": "user",
  "title": "My Personal Preferences",
  "content": "string",
  "file_url": "https://...",
  "chunks_created": 5,
  "embeddings_created": 5,
  "created_at": "timestamp"
}
```

#### `GET /api/v1/context`
List context items.

**Query Parameters:**
- `scope` (optional): Filter by scope (global|user|project|chat)
- `project_id` (optional): Filter by project
- `chat_id` (optional): Filter by chat
- `limit` (optional): Number of items (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "context_items": [
    {
      "id": "uuid",
      "scope": "user",
      "title": "My Coding Standards",
      "content_preview": "First 200 chars...",
      "file_url": null,
      "file_type": null,
      "created_at": "timestamp"
    }
  ],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

#### `DELETE /api/v1/context/{context_id}`
Delete a context item.

**Response:**
```json
{
  "success": true,
  "message": "Context item deleted successfully"
}
```

---

### Document Types

#### `GET /api/v1/document-types`
List available document types.

**Response:**
```json
{
  "document_types": [
    {
      "id": "uuid",
      "name": "Technical Specification",
      "description": "Detailed technical documentation for software projects",
      "is_active": true
    }
  ]
}
```

---

### Metrics

#### `GET /api/v1/chats/{chat_id}/metrics`
Get generation metrics for a chat.

**Response:**
```json
{
  "total_tokens": 45000,
  "total_input_tokens": 30000,
  "total_output_tokens": 15000,
  "average_latency_ms": 3200,
  "generation_count": 5,
  "differential_generations": 3,
  "metrics": [
    {
      "id": "uuid",
      "model_name": "gemini-3-pro",
      "input_tokens": 2500,
      "output_tokens": 1200,
      "latency_ms": 3400,
      "is_differential": false,
      "created_at": "timestamp"
    }
  ]
}
```

---

## Frontend Structure

### Directory Layout

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── projects/
│   │   └── [projectId]/
│   │       ├── page.tsx         # Project detail
│   │       └── chats/
│   │           └── [chatId]/
│   │               └── page.tsx # Chat interface
│   ├── api/                     # API routes (if needed)
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── layout/
│   │   ├── Sidebar.tsx          # Project/chat navigation
│   │   ├── Header.tsx
│   │   ├── UserSelector.tsx     # Dropdown for switching users
│   │   └── Layout.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   └── CreateProjectModal.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── SuggestedQuestions.tsx
│   │   └── FollowUpQuestion.tsx
│   ├── document/
│   │   ├── DocumentArtifact.tsx # Claude-style artifact display
│   │   ├── DocumentViewer.tsx
│   │   ├── DocumentToolbar.tsx  # Copy, download, version
│   │   └── DocumentVersions.tsx
│   ├── context/
│   │   ├── ContextManager.tsx
│   │   ├── ContextList.tsx
│   │   ├── AddContextModal.tsx
│   │   └── ContextItem.tsx
│   ├── metrics/
│   │   ├── TokenUsage.tsx
│   │   └── GenerationMetrics.tsx
│   └── ui/                      # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Spinner.tsx
│       └── Toast.tsx
│
├── lib/                         # Utilities and helpers
│   ├── api/
│   │   ├── client.ts           # API client
│   │   ├── users.ts            # User management
│   │   ├── projects.ts
│   │   ├── chats.ts
│   │   ├── messages.ts
│   │   ├── documents.ts
│   │   └── context.ts
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useChats.ts
│   │   ├── useMessages.ts
│   │   ├── useWebSocket.ts        # WebSocket connection management
│   │   ├── useUsers.ts            # User management and switching
│   │   └── useContext.ts
│   ├── stores/
│   │   ├── projectStore.ts     # Zustand store
│   │   ├── chatStore.ts
│   │   └── uiStore.ts
│   ├── utils/
│   │   ├── cookies.ts          # Cookie management
│   │   ├── markdown.ts         # Markdown processing
│   │   ├── diff.ts             # Document diffing
│   │   └── formatting.ts
│   └── types/
│       ├── api.ts              # API types
│       ├── models.ts           # Data models
│       └── index.ts
│
├── public/                      # Static assets
│   ├── fonts/
│   └── icons/
│
└── styles/                      # Additional styles
    └── markdown.css            # Markdown rendering styles
```

---

### Key Pages

#### 1. **Home Page** (`/`)
- Welcome screen
- Quick stats (total projects, documents generated)
- Recent projects
- "Create New Project" button

#### 2. **Project Detail** (`/projects/[projectId]`)
- Project information
- Context management (project-level)
- List of chats in sidebar
- "New Chat" button with document type selector

#### 3. **Chat Interface** (`/projects/[projectId]/chats/[chatId]`)
- **Left Sidebar:** Chat list (collapsible)
- **Main Area:** 
  - Document artifact display (right side, 50% width)
  - Chat messages (left side, 50% width)
- **Bottom:** Message input and suggested questions
- **Top Bar:** Token usage, document version, toolbar (copy, download)

---

### Key Components

#### `DocumentArtifact.tsx`
Claude-style artifact display for streaming document generation.

**Features:**
- Real-time markdown rendering
- Syntax highlighting for code blocks
- Smooth scroll to latest content
- Loading state with cursor animation
- Version indicator
- Copy/download toolbar

**Props:**
```typescript
interface DocumentArtifactProps {
  content: string;
  isGenerating: boolean;
  version: number;
  onCopy: () => void;
  onDownload: () => void;
  onVersionChange?: (version: number) => void;
}
```

#### `ChatInterface.tsx`
Main chat interface component.

**Features:**
- Split view (chat + document)
- Message history
- Streaming responses
- Follow-up questions with selectable responses
- Token usage display
- Context indicator (shows active context items)

#### `SuggestedQuestions.tsx`
Display initial document type suggestions and follow-up questions.

**Features:**
- Grid of clickable question cards
- Auto-generated based on document type and context
- Smooth transitions when new questions appear

#### `ContextManager.tsx`
Manage context items at different scopes.

**Features:**
- Tab interface (Global, User, Project, Chat)
- File upload with drag-and-drop
- Text input with title
- List of existing context items
- Delete functionality
- Scope indicator

**Note:** Global context is typically managed by admins/system. User context is personal preferences and knowledge specific to the current user.

#### `UserSelector.tsx`
Dropdown component for viewing and switching between users.

**Features:**
- Dropdown list of all users (shows name or cookie_id)
- Current user indicator
- Switch user functionality
- Edit current user's display name
- Shows project count per user
- Compact header placement

**Props:**
```typescript
interface UserSelectorProps {
  currentUser: User;
  onUserSwitch: (userId: string) => void;
}
```

**Implementation Notes:**
- Uses Headless UI Listbox component
- Positioned in top-right of header
- Persists user selection via cookie
- Refreshes page data after user switch

---

## Backend Structure

### Directory Layout

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Shared dependencies
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── users.py
│   │   │   ├── projects.py
│   │   │   ├── chats.py
│   │   │   ├── messages.py
│   │   │   ├── documents.py
│   │   │   ├── context.py
│   │   │   ├── document_types.py
│   │   │   └── metrics.py
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── chat.py
│   │   ├── message.py
│   │   ├── document.py
│   │   ├── context.py
│   │   └── metrics.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── project_service.py
│   │   ├── chat_service.py
│   │   ├── message_service.py
│   │   ├── document_service.py
│   │   ├── context_service.py
│   │   ├── embedding_service.py
│   │   └── metrics_service.py
│   │
│   ├── agents/                 # LangGraph agents
│   │   ├── __init__.py
│   │   ├── document_generator.py
│   │   ├── context_retriever.py
│   │   ├── question_generator.py
│   │   ├── diff_generator.py
│   │   └── state.py           # Agent state definitions
│   │
│   ├── db/                     # Database
│   │   ├── __init__.py
│   │   ├── supabase.py        # Supabase client
│   │   ├── repositories/      # Data access layer
│   │   │   ├── __init__.py
│   │   │   ├── user_repo.py
│   │   │   ├── project_repo.py
│   │   │   ├── chat_repo.py
│   │   │   ├── message_repo.py
│   │   │   ├── document_repo.py
│   │   │   ├── context_repo.py
│   │   │   └── metrics_repo.py
│   │
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── cookies.py
│   │   ├── embeddings.py
│   │   ├── chunking.py        # Text chunking strategies
│   │   ├── diff.py            # Document diffing
│   │   ├── streaming.py       # SSE utilities
│   │   └── token_counter.py   # Token counting
│   │
│   └── middleware/             # Middleware
│       ├── __init__.py
│       ├── cookie_auth.py
│       ├── cors.py
│       └── error_handler.py
│
├── tests/                      # Tests
│   ├── __init__.py
│   ├── test_api/
│   ├── test_services/
│   ├── test_agents/
│   └── conftest.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt
├── pyproject.toml
├── Dockerfile
└── README.md
```

---

## LangGraph Agent Architecture

### Document Generation Workflow

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

class DocumentGenerationState(TypedDict):
    # Input
    chat_id: str
    user_message: str
    document_type: str
    is_initial: bool
    previous_document: str | None
    
    # Context (4 levels)
    global_context: List[str]
    user_context: List[str]
    project_context: List[str]
    chat_context: List[str]
    conversation_history: List[dict]
    
    # Generation
    retrieved_context: str
    clarifying_questions: List[dict]
    generation_prompt: str
    document_content: str
    document_diff: dict | None
    
    # Metrics
    input_tokens: int
    output_tokens: int
    context_tokens: int
    generation_time_ms: int
    
    # Control
    needs_clarification: bool
    is_complete: bool

# Nodes
def retrieve_context(state: DocumentGenerationState) -> DocumentGenerationState:
    """Retrieve relevant context using vector similarity search."""
    pass

def generate_questions(state: DocumentGenerationState) -> DocumentGenerationState:
    """Generate clarifying questions if needed."""
    pass

def build_prompt(state: DocumentGenerationState) -> DocumentGenerationState:
    """Construct the generation prompt with all context."""
    pass

def generate_document(state: DocumentGenerationState) -> DocumentGenerationState:
    """Generate or update the document using Gemini 3 Pro."""
    pass

def compute_diff(state: DocumentGenerationState) -> DocumentGenerationState:
    """Compute diff if this is an update to existing document."""
    pass

def calculate_metrics(state: DocumentGenerationState) -> DocumentGenerationState:
    """Calculate token usage and performance metrics."""
    pass

# Conditional edges
def should_ask_questions(state: DocumentGenerationState) -> str:
    """Determine if we need more information."""
    if state["is_initial"] and len(state["user_message"]) < 50:
        return "ask_questions"
    return "generate"

def should_use_diff(state: DocumentGenerationState) -> str:
    """Determine if we should use differential generation."""
    if state["previous_document"] and len(state["previous_document"]) > 1000:
        return "compute_diff"
    return "complete"

# Build graph
workflow = StateGraph(DocumentGenerationState)

# Add nodes
workflow.add_node("retrieve_context", retrieve_context)
workflow.add_node("generate_questions", generate_questions)
workflow.add_node("build_prompt", build_prompt)
workflow.add_node("generate_document", generate_document)
workflow.add_node("compute_diff", compute_diff)
workflow.add_node("calculate_metrics", calculate_metrics)

# Add edges
workflow.set_entry_point("retrieve_context")
workflow.add_edge("retrieve_context", "build_prompt")
workflow.add_conditional_edges(
    "build_prompt",
    should_ask_questions,
    {
        "ask_questions": "generate_questions",
        "generate": "generate_document"
    }
)
workflow.add_edge("generate_questions", "generate_document")
workflow.add_conditional_edges(
    "generate_document",
    should_use_diff,
    {
        "compute_diff": "compute_diff",
        "complete": "calculate_metrics"
    }
)
workflow.add_edge("compute_diff", "calculate_metrics")
workflow.add_edge("calculate_metrics", END)

# Compile
document_agent = workflow.compile()
```

---

### Context Retrieval Strategy

**Hierarchical Context Combination:**

1. **Global Context** (10% of context budget)
   - System-wide context available to all users
   - Best practices, templates, common knowledge
   
2. **User Context** (20% of context budget)
   - Personal preferences and knowledge for the current user
   - User's writing style, frequently used patterns
   
3. **Project Context** (35% of context budget)
   - All project-specific context items
   - Project description and goals
   
4. **Chat Context** (35% of context budget)
   - All chat-specific context items
   - Recent conversation history (last 5 messages)

**Vector Search Implementation:**

```python
async def retrieve_relevant_context(
    chat_id: str,
    user_message: str,
    max_tokens: int = 50000  # Reserve ~95% for output
) -> Dict[str, List[str]]:
    # Get chat, project, user info
    chat = await get_chat(chat_id)
    project = await get_project(chat.project_id)
    user = await get_user_from_chat(chat_id)
    
    # Generate embedding for user message
    query_embedding = await generate_embedding(user_message)
    
    # Calculate token budgets
    global_budget = int(max_tokens * 0.1)
    user_budget = int(max_tokens * 0.2)
    project_budget = int(max_tokens * 0.35)
    chat_budget = int(max_tokens * 0.35)
    
    # Retrieve global context (vector search across all global items)
    global_items = await vector_search(
        embedding=query_embedding,
        filter={"scope": "global"},
        limit=10
    )
    global_context = truncate_to_tokens(global_items, global_budget)
    
    # Retrieve user context (vector search for this user)
    user_items = await vector_search(
        embedding=query_embedding,
        filter={"scope": "user", "user_id": user.id},
        limit=10
    )
    user_context = truncate_to_tokens(user_items, user_budget)
    
    # Retrieve project context (no vector search, get all)
    project_items = await get_context_items(
        scope="project",
        project_id=project.id
    )
    project_context = truncate_to_tokens(project_items, project_budget)
    
    # Retrieve chat context (no vector search, get all)
    chat_items = await get_context_items(
        scope="chat",
        chat_id=chat_id
    )
    chat_context = truncate_to_tokens(chat_items, chat_budget)
    
    return {
        "global": global_context,
        "user": user_context,
        "project": project_context,
        "chat": chat_context
    }
```

---

### Differential Document Generation

**Strategy:**

1. **Initial Generation:** Create complete document from scratch
2. **Subsequent Updates:** 
   - Analyze user request to identify changes needed
   - Generate only the modified sections
   - Apply changes to existing document
   - Return both full document and diff

**Implementation:**

```python
async def generate_document_differential(
    previous_document: str,
    user_request: str,
    context: str,
    document_type: str
) -> Tuple[str, dict]:
    """
    Generate document updates using differential strategy.
    
    Returns:
        Tuple of (full_document, diff_dict)
    """
    
    # Prompt for differential generation
    prompt = f"""You are updating an existing {document_type}.

Previous Document:
{previous_document}

User Request:
{user_request}

Context:
{context}

Instructions:
1. Identify the specific sections that need to be updated based on the user's request
2. Generate ONLY the modified sections with clear section markers
3. Preserve all other sections unchanged

Output Format:
SECTION: <section_name>
<updated_content>

SECTION: <another_section>
<updated_content>
"""
    
    # Generate with Gemini
    response = await gemini_generate(prompt, stream=False)
    
    # Parse sections
    sections = parse_sections(response)
    
    # Apply updates to previous document
    updated_document = apply_section_updates(previous_document, sections)
    
    # Create diff
    diff = create_diff(previous_document, updated_document)
    
    return updated_document, diff
```

---

## WebSocket Implementation

### Backend (FastAPI WebSocket)

```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter()

@router.websocket("/chats/{chat_id}/messages")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_id: str
):
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            if data["type"] == "message":
                # Initialize agent state
                state = {
                    "chat_id": chat_id,
                    "user_message": data["content"],
                    "selected_response_id": data.get("selected_response_id"),
                    "regenerate": data.get("regenerate", False),
                    # ... other state fields
                }
                
                # Stream generation through agent
                async for event in document_agent.astream(state):
                    # Send token events
                    if "token" in event:
                        await websocket.send_json({
                            "type": "token",
                            "token": event["token"],
                            "content_type": "content"
                        })
                    
                    # Send follow-up question events
                    if "clarifying_question" in event:
                        await websocket.send_json({
                            "type": "follow_up",
                            "question": event["clarifying_question"]["question"],
                            "suggested_responses": event["clarifying_question"]["suggested_responses"],
                            "id": event["clarifying_question"]["id"]
                        })
                    
                    # Send metrics when complete
                    if event.get("is_complete"):
                        await websocket.send_json({
                            "type": "metrics",
                            "input_tokens": event["input_tokens"],
                            "output_tokens": event["output_tokens"],
                            "latency_ms": event["generation_time_ms"]
                        })
                        
                        await websocket.send_json({
                            "type": "complete",
                            "document_id": event["document_id"],
                            "version": event["version"],
                            "message_id": event["message_id"]
                        })
                    
                    await asyncio.sleep(0)  # Yield control
                    
    except WebSocketDisconnect:
        print(f"Client disconnected from chat {chat_id}")
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "error": str(e)
        })
        await websocket.close()
```

### Frontend (React Hook)

```typescript
// lib/hooks/useWebSocket.ts

import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: 'token' | 'follow_up' | 'metrics' | 'complete' | 'error';
  token?: string;
  question?: string;
  suggested_responses?: string[];
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
  document_id?: string;
  version?: number;
  message_id?: string;
  error?: string;
}

export function useWebSocket(chatId: string) {
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<FollowUpQuestion | null>(null);
  const [metrics, setMetrics] = useState<GenerationMetrics | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/v1/chats/${chatId}/messages`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      
      switch (data.type) {
        case 'token':
          setContent(prev => prev + data.token);
          break;
          
        case 'follow_up':
          setFollowUpQuestion({
            question: data.question!,
            suggested_responses: data.suggested_responses!,
            id: data.id!
          });
          break;
          
        case 'metrics':
          setMetrics({
            input_tokens: data.input_tokens!,
            output_tokens: data.output_tokens!,
            latency_ms: data.latency_ms!
          });
          break;
          
        case 'complete':
          setIsGenerating(false);
          break;
          
        case 'error':
          console.error('WebSocket error:', data.error);
          setIsGenerating(false);
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
    
    wsRef.current = ws;
  }, [chatId]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((message: string, selectedResponseId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    
    setIsGenerating(true);
    setContent('');
    setFollowUpQuestion(null);
    setMetrics(null);
    
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: message,
      selected_response_id: selectedResponseId,
      regenerate: false
    }));
  }, []);

  return {
    content,
    isConnected,
    isGenerating,
    followUpQuestion,
    metrics,
    sendMessage,
  };
}
```

### Usage in Component

```typescript
// components/chat/ChatInterface.tsx

import { useWebSocket } from '@/lib/hooks/useWebSocket';

export function ChatInterface({ chatId }: { chatId: string }) {
  const { 
    content, 
    isConnected, 
    isGenerating, 
    followUpQuestion, 
    metrics, 
    sendMessage 
  } = useWebSocket(chatId);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div>
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-sm">
          Connecting to server...
        </div>
      )}
      
      <DocumentArtifact 
        content={content} 
        isGenerating={isGenerating}
      />
      
      {followUpQuestion && (
        <FollowUpQuestion 
          question={followUpQuestion}
          onSelectResponse={(responseId) => sendMessage(responseId, responseId)}
        />
      )}
      
      {metrics && (
        <TokenUsage {...metrics} />
      )}
      
      <MessageInput 
        onSend={handleSendMessage}
        disabled={isGenerating || !isConnected}
      />
    </div>
  );
}
```

---

## Environment Variables

### Backend (.env)

```bash
# FastAPI
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4
DEBUG=false

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Google GenAI
GOOGLE_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-3-pro
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

# LangSmith (optional, for debugging)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=document-generator

# CORS
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000

# Cookies
COOKIE_DOMAIN=yourdomain.com
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Token Management Strategy

### Input Token Budget

**Total Available:** 1,000,000 tokens  
**Reserved for Output:** 68,000 tokens (Gemini 3 Pro max)  
**Available for Input:** ~932,000 tokens

**Allocation:**
- Context (Global + User + Project + Chat): 50,000 tokens (5%)
- Conversation History: 10,000 tokens (1%)
- System Prompt: 2,000 tokens (0.2%)
- Previous Document: Variable (up to 500,000 tokens)
- User Message: Variable (typically < 1,000 tokens)
- Buffer: 370,000 tokens (40%)

### Token Counting

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """
    Count tokens in text. Using tiktoken as approximation for Gemini.
    Gemini typically uses similar tokenization to GPT-4.
    """
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def truncate_to_tokens(text: str, max_tokens: int) -> str:
    """Truncate text to fit within token budget."""
    encoding = tiktoken.encoding_for_model("gpt-4")
    tokens = encoding.encode(text)
    
    if len(tokens) <= max_tokens:
        return text
    
    truncated_tokens = tokens[:max_tokens]
    return encoding.decode(truncated_tokens)

def prepare_context_with_budget(
    context_items: List[str],
    max_tokens: int
) -> str:
    """
    Combine context items up to token budget.
    Most recent/relevant items prioritized.
    """
    combined = []
    total_tokens = 0
    
    for item in context_items:
        item_tokens = count_tokens(item)
        
        if total_tokens + item_tokens > max_tokens:
            # Truncate this item to fit
            remaining = max_tokens - total_tokens
            if remaining > 100:  # Only include if meaningful
                truncated = truncate_to_tokens(item, remaining)
                combined.append(truncated)
            break
        
        combined.append(item)
        total_tokens += item_tokens
    
    return "\n\n---\n\n".join(combined)
```

### Real-time Token Display

Display token usage in the UI after each generation:

```typescript
interface TokenUsageProps {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  maxInputTokens: number;
  maxOutputTokens: number;
}

export function TokenUsage({ inputTokens, outputTokens, totalTokens, maxInputTokens, maxOutputTokens }: TokenUsageProps) {
  const inputPercentage = (inputTokens / maxInputTokens) * 100;
  const outputPercentage = (outputTokens / maxOutputTokens) * 100;
  
  return (
    <div className="flex gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span>Input:</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(inputPercentage, 100)}%` }}
          />
        </div>
        <span className="font-mono">{inputTokens.toLocaleString()}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span>Output:</span>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all"
            style={{ width: `${Math.min(outputPercentage, 100)}%` }}
          />
        </div>
        <span className="font-mono">{outputTokens.toLocaleString()}</span>
      </div>
      
      <div>
        <span className="font-semibold">Total: {totalTokens.toLocaleString()}</span>
      </div>
    </div>
  );
}
```

---

## Deployment

### Backend (Railway)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY ./app ./app

# Run with Gunicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

**Railway Configuration:**
- Automatic deployment from GitHub
- Environment variables from Railway dashboard
- Automatic HTTPS with custom domain
- Health check endpoint: `/health`

### Frontend (Vercel)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.yourdomain.com/api/:path*"
    }
  ]
}
```

---

---

## Key Component Implementations

### UserSelector Component

```typescript
// components/layout/UserSelector.tsx

import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon, PencilIcon } from '@fortawesome/react-fontawesome';
import { useUsers } from '@/lib/hooks/useUsers';

export function UserSelector() {
  const { currentUser, allUsers, switchUser, updateUserName } = useUsers();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSwitchUser = async (userId: string) => {
    await switchUser(userId);
    // Refresh page data
    window.location.reload();
  };

  const handleUpdateName = async () => {
    if (newName.trim()) {
      await updateUserName(newName);
      setIsEditingName(false);
      setNewName('');
    }
  };

  const displayName = (user: User) => 
    user.name || `User ${user.cookie_id.slice(0, 8)}`;

  return (
    <div className="relative">
      <Listbox value={currentUser.id} onChange={handleSwitchUser}>
        <div className="relative">
          <Listbox.Button className="relative w-48 cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
            <span className="block truncate">
              {displayName(currentUser)}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-1 max-h-60 w-64 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {allUsers.map((user) => (
                <Listbox.Option
                  key={user.id}
                  value={user.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {displayName(user)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.project_count} projects
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
              
              <div className="border-t border-gray-200 mt-1 pt-1">
                {!isEditingName ? (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit display name
                  </button>
                ) : (
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter name"
                      className="w-full px-2 py-1 text-sm border rounded"
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleUpdateName}
                        className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName('');
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
```

### useUsers Hook

```typescript
// lib/hooks/useUsers.ts

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getUsers, getCurrentUser, switchUser as switchUserApi, updateUserName as updateUserNameApi } from '@/lib/api/users';

export function useUsers() {
  const { data: currentUser, mutate: mutateCurrentUser } = useSWR(
    '/api/v1/users/me',
    getCurrentUser
  );
  
  const { data: allUsersData } = useSWR(
    '/api/v1/users',
    getUsers
  );

  const switchUser = async (userId: string) => {
    await switchUserApi(userId);
    await mutateCurrentUser();
  };

  const updateUserName = async (name: string) => {
    await updateUserNameApi(name);
    await mutateCurrentUser();
  };

  return {
    currentUser,
    allUsers: allUsersData?.users || [],
    switchUser,
    updateUserName,
  };
}
```

### Users API Client

```typescript
// lib/api/users.ts

import { apiClient } from './client';

export interface User {
  id: string;
  cookie_id: string;
  name?: string;
  created_at: string;
  updated_at: string;
  project_count?: number;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/users/me');
  return response.data;
}

export async function getUsers(): Promise<{ users: User[]; total: number }> {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function switchUser(userId: string): Promise<User> {
  const response = await apiClient.post('/users/switch', { user_id: userId });
  return response.data;
}

export async function updateUserName(name: string): Promise<User> {
  const response = await apiClient.patch('/users/me', { name });
  return response.data;
}
```

---

## Testing Strategy

### Backend Tests

```python
# tests/test_api/test_chats.py

import pytest
from fastapi.testclient import TestClient

def test_create_chat(client: TestClient, user_cookie: str):
    response = client.post(
        "/api/v1/projects/test-project-id/chats",
        json={"document_type": "Technical Specification"},
        cookies={"user_cookie": user_cookie}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["document_type"] == "Technical Specification"
    assert "suggested_questions" in data

def test_stream_message(client: TestClient, chat_id: str):
    with client.stream(
        "POST",
        f"/api/v1/chats/{chat_id}/messages",
        json={"content": "Add authentication section"}
    ) as response:
        assert response.status_code == 200
        
        events = []
        for line in response.iter_lines():
            if line.startswith(b"event:"):
                events.append(line.decode().split(":")[1].strip())
        
        assert "token" in events
        assert "complete" in events
```

### Frontend Tests

```typescript
// __tests__/components/DocumentArtifact.test.tsx

import { render, screen } from '@testing-library/react';
import { DocumentArtifact } from '@/components/document/DocumentArtifact';

describe('DocumentArtifact', () => {
  it('renders markdown content correctly', () => {
    const content = '# Hello\n\nThis is a test.';
    render(<DocumentArtifact content={content} isGenerating={false} version={1} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('This is a test.')).toBeInTheDocument();
  });
  
  it('shows loading state when generating', () => {
    render(<DocumentArtifact content="" isGenerating={true} version={1} />);
    expect(screen.getByTestId('loading-cursor')).toBeInTheDocument();
  });
});
```

---

## Performance Optimization

### Frontend

1. **Code Splitting**
   - Route-based splitting with Next.js
   - Dynamic imports for heavy components
   - Lazy load markdown renderer

2. **Caching**
   - Cache document versions in Zustand
   - Cache context items locally
   - Use SWR for data fetching

3. **Rendering**
   - Virtual scrolling for long documents
   - Debounced search in context manager
   - Memoized components

### Backend

1. **Database**
   - Indexes on frequently queried columns
   - Connection pooling with Supabase
   - Prepared statements for common queries

2. **Vector Search**
   - IVFFlat index for fast similarity search
   - Limit context retrieval results
   - Cache embeddings for common queries

3. **API**
   - Rate limiting with slowapi
   - Response caching for static content
   - Gzip compression

---

## Security Considerations

### Cookie-Based Authentication

```python
# app/middleware/cookie_auth.py

from fastapi import Request, HTTPException
from app.services.user_service import get_or_create_user
import uuid

async def get_current_user(request: Request):
    """Get user from cookie or create new user."""
    cookie_id = request.cookies.get("user_cookie")
    
    if not cookie_id:
        # Generate new cookie ID
        cookie_id = str(uuid.uuid4())
        
    # Get or create user
    user = await get_or_create_user(cookie_id)
    
    # Set cookie in response (handled by middleware)
    request.state.user = user
    request.state.cookie_id = cookie_id
    
    return user
```

### Input Validation

- Pydantic models for all API inputs
- File upload size limits (10MB max)
- Content type validation
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize user content)

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/v1/chats/{chat_id}/messages")
@limiter.limit("10/minute")
async def send_message(...):
    pass
```

---

## Monitoring & Observability

### API Documentation

FastAPI provides automatic interactive API documentation:

**Swagger UI:** `http://localhost:8000/docs`
- Interactive API testing
- Request/response schemas
- Try out endpoints directly

**ReDoc:** `http://localhost:8000/redoc`
- Clean, readable documentation
- Better for sharing with team

### Logging

```python
import logging

logger = logging.getLogger(__name__)

logger.info(
    f"Document generated - chat_id: {chat_id}, "
    f"type: {document_type}, "
    f"tokens: {input_tokens + output_tokens}, "
    f"latency: {generation_time_ms}ms"
)
```

**Log Levels:**
- INFO: Document generation, user actions
- WARNING: Token limit approaching, API rate limits
- ERROR: Generation failures, API errors

---

## Cost Estimation

### Google GenAI Pricing (Gemini 3 Pro)

Assuming average generation:
- Input: 30,000 tokens
- Output: 5,000 tokens
- Cost per generation: ~$0.15 (estimated, check current pricing)

**Monthly Estimates:**
- 100 documents: $15
- 1,000 documents: $150
- 10,000 documents: $1,500

### Infrastructure

- **Supabase:** Free tier (up to 500MB database, 1GB storage)
- **Railway:** $5-20/month (based on usage)
- **Vercel:** Free tier (generous limits for frontend)

**Total Monthly Cost (1,000 documents):**
- Infrastructure: $20
- AI Generation: $150
- **Total: ~$170/month**

---

## Future Enhancements

### Phase 2 Features

1. **Collaboration**
   - Share projects with other users
   - Real-time collaborative editing
   - Comments and annotations

2. **Advanced Context**
   - Automatic context extraction from URLs
   - Integration with Google Drive, Notion, etc.
   - Periodic context refresh

3. **Enhanced Generation**
   - Multiple output formats (PDF, DOCX, HTML)
   - Custom document templates
   - Style transfer (match writing style)

4. **Analytics**
   - Usage dashboard
   - Cost tracking
   - Document quality metrics

### Technical Debt

- Add comprehensive test coverage (>80%)
- Implement CI/CD pipeline
- Set up staging environment
- Add database backups
- Implement feature flags

---

## Development Workflow

### Local Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Git Workflow

- **Main branch:** Production-ready code
- **Develop branch:** Integration branch
- **Feature branches:** `feature/description`
- **PR required:** For all changes to main

### Sprint Cycle (2 weeks)

- **Monday:** Sprint planning
- **Thursday:** Deploy to production
- **Friday:** Retrospective

---

## Conclusion

This specification outlines a simplified yet powerful AI document generation platform leveraging modern technologies and best practices. The architecture prioritizes:

- **Simplicity:** Minimal tables, cookie-based user tracking with optional user selector
- **Performance:** Efficient token usage, streaming responses
- **User Experience:** Real-time generation, intuitive interface, easy user switching
- **Scalability:** Ready to handle growth with modern infrastructure
- **Maintainability:** Clear separation of concerns, well-documented
- **Developer Experience:** Auto-generated API docs, simple logging

The system is production-ready for MVP launch with clear paths for future enhancement.

---

## Appendix

### Key Dependencies

**Backend:**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
supabase==2.3.0
google-generativeai==0.3.0
langgraph==0.0.30
langchain==0.1.0
tiktoken==0.5.2
python-multipart==0.0.6
slowapi==0.1.9
```

**Frontend:**
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zustand": "4.4.7",
    "@headlessui/react": "1.7.17",
    "tailwindcss": "3.4.0",
    "@fortawesome/fontawesome-svg-core": "6.5.1",
    "react-markdown": "9.0.1",
    "swr": "2.2.4"
  }
}
```

### API Response Examples

**Successful Chat Creation:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "project_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "2025-12-24 - Technical Specification",
  "document_type": "Technical Specification",
  "created_at": "2025-12-24T10:30:00Z",
  "updated_at": "2025-12-24T10:30:00Z",
  "suggested_questions": [
    "What is the primary goal of this project?",
    "Who are the target users?",
    "What are the key technical requirements?",
    "Are there any integration requirements?",
    "What is the expected timeline?"
  ]
}
```

**Token Usage Response:**
```json
{
  "input_tokens": 32450,
  "output_tokens": 5230,
  "total_tokens": 37680,
  "latency_ms": 4200,
  "context_tokens_retrieved": 8500,
  "is_differential": false
}
```

---

**Document Version:** 1.0  
**Last Updated:** December 24, 2025  
**Status:** Ready for Implementation
