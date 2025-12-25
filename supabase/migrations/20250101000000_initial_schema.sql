-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for AI/ML use cases
CREATE EXTENSION IF NOT EXISTS vector;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cookie_id TEXT UNIQUE NOT NULL,
    name TEXT, -- Optional display name for user selection dropdown
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast cookie lookups
CREATE INDEX IF NOT EXISTS idx_users_cookie_id ON public.users(cookie_id);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- DOCUMENT TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    template_prompt TEXT, -- Base prompt for this document type
    example_output TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- CHATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- Format: "YYYY-MM-DD - Document Type"
    document_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chats_project_id ON public.chats(project_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_chats
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For storing token counts, model info, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL, -- Markdown content
    diff_from_previous TEXT, -- JSON diff for version tracking
    token_input INTEGER NOT NULL,
    token_output INTEGER NOT NULL,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(chat_id, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_chat_id ON public.documents(chat_id);
CREATE INDEX IF NOT EXISTS idx_documents_version ON public.documents(chat_id, version DESC);

-- ============================================================================
-- CONTEXT ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.context_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('global', 'user', 'project', 'chat')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    file_url TEXT, -- If uploaded as file, reference to Supabase Storage
    file_type TEXT, -- e.g., 'pdf', 'txt', 'md', 'docx'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Constraints to ensure proper scoping
    CHECK (
        (scope = 'global' AND user_id IS NULL AND project_id IS NULL AND chat_id IS NULL) OR
        (scope = 'user' AND user_id IS NOT NULL AND project_id IS NULL AND chat_id IS NULL) OR
        (scope = 'project' AND user_id IS NOT NULL AND project_id IS NOT NULL AND chat_id IS NULL) OR
        (scope = 'chat' AND user_id IS NOT NULL AND project_id IS NOT NULL AND chat_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_context_items_user_id ON public.context_items(user_id);
CREATE INDEX IF NOT EXISTS idx_context_items_project_id ON public.context_items(project_id);
CREATE INDEX IF NOT EXISTS idx_context_items_chat_id ON public.context_items(chat_id);
CREATE INDEX IF NOT EXISTS idx_context_items_scope ON public.context_items(scope);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_context_items
    BEFORE UPDATE ON public.context_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- CONTEXT EMBEDDINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.context_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_item_id UUID NOT NULL REFERENCES public.context_items(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL, -- The chunked text
    embedding vector(768), -- Gemini Embedding 001 produces 768-dim vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(context_item_id, chunk_index)
);

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS idx_context_embeddings_vector ON public.context_embeddings 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Regular index
CREATE INDEX IF NOT EXISTS idx_context_embeddings_context_item_id ON public.context_embeddings(context_item_id);

-- ============================================================================
-- FOLLOW UP QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follow_up_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    suggested_responses JSONB, -- Array of suggested response options
    user_response TEXT,
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_chat_id ON public.follow_up_questions(chat_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_message_id ON public.follow_up_questions(message_id);

-- ============================================================================
-- GENERATION METRICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.generation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    total_tokens INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    context_tokens_retrieved INTEGER, -- Tokens from vector search
    is_differential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_generation_metrics_chat_id ON public.generation_metrics(chat_id);
CREATE INDEX IF NOT EXISTS idx_generation_metrics_created_at ON public.generation_metrics(created_at);

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================
-- Create storage bucket for context files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'context-files',
    'context-files',
    false,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'text/plain', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for context-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload context files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'context-files');

-- Allow users to read their own files
CREATE POLICY "Users can read context files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'context-files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete context files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'context-files');
