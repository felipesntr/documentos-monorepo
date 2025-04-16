# 📄 Documentos API

A simple, modular API for managing and searching documents based on blocks of text, featuring semantic search powered by vector embeddings and Elasticsearch.

---

## Completed Features

#### Elasticsearch Indexing

Each document block is indexed individually with metadata and content.

#### Text Vectorization

Block texts are converted into numerical vectors (embeddings) for semantic search.

#### Get Document by ID

Endpoint to retrieve a full document, including title, blocks, metadata, and embeddings.

#### Semantic Search (KNN)

Vector-based search endpoint that finds semantically relevant blocks based on a text query.

#### Simple Auth Middleware

Basic authorization using `Authorization: Bearer <token>` headers.

#### Vertical Slice Architecture with Decorators

Each feature encapsulates its validation, business logic, and route definition.

#### Persistence with SQL Server

Documents and blocks are saved to a relational database using TypeORM.

#### Elasticsearch `dense_vector` Mapping

Vectors are stored and queried using `knn_search` and `cosine similarity`.

---

## Tech Stack

- TypeScript + Express
- TypeORM + SQL Server
- Elasticsearch
- @xenova/transformers
- Simple token-based auth middleware
- Decorator-based route registration
- Docker for containerization

---

## Future Ideas

- 🔐 Full **JWT Authentication** with login/registration
- 🔄 **SQL ↔ Elasticsearch sync** via event sourcing or messaging
- 🏢 **Multi-tenant** support (organizations/workspaces)
- 🧠 **AI-based document summarization**
- 📊 **Analytics dashboards** for search activity
- 🌍 **Internationalization (i18n) support**
- 🕵️ **Request logging and auditing**
- ⚙️ **Admin dashboard with Next.js**
