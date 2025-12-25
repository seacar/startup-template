-- Seed document_types table with common document types
INSERT INTO public.document_types (name, description, template_prompt) VALUES
    ('Technical Specification', 'Detailed technical documentation for software projects', 'Create a comprehensive technical specification that includes system architecture, technology stack, API design, database schema, security considerations, deployment strategy, and scalability requirements.'),
    ('Business Plan', 'Strategic business planning document', 'Generate a business plan covering executive summary, market analysis, company description, organization structure, product/service line, marketing strategy, financial projections, and funding requirements.'),
    ('Product Requirements', 'Product requirements document (PRD)', 'Write a PRD that defines product goals, target users, user stories, functional requirements, non-functional requirements, success metrics, and implementation timeline.'),
    ('API Documentation', 'REST API documentation', 'Document the API endpoints including base URL, authentication methods, request/response formats, error codes, rate limits, and code examples for each endpoint.'),
    ('User Guide', 'End-user documentation', 'Create user-friendly documentation that explains how to use the product, including step-by-step instructions, screenshots, troubleshooting tips, and frequently asked questions.'),
    ('Architecture Design', 'System architecture documentation', 'Design and document the system architecture including components, data flow, technology choices, infrastructure requirements, scalability considerations, and security measures.'),
    ('Database Schema', 'Database design documentation', 'Create database schema documentation with entity-relationship diagrams, table structures, indexes, relationships, constraints, and data migration strategies.'),
    ('Project Proposal', 'Project proposal document', 'Write a compelling project proposal that includes project overview, objectives, scope, timeline, resource requirements, budget, risks, and expected outcomes.')
ON CONFLICT (name) DO NOTHING;
