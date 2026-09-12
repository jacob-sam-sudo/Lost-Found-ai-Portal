# FindBack - AI-Based Lost & Found Portal

> A full-stack campus Lost & Found platform that uses AI-powered semantic matching to connect lost-item reports with relevant found-item reports.

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/AI-Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/AI%20API-FastAPI-009688?logo=fastapi&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## Overview

FindBack is a full-stack web application designed to digitize the lost-and-found process on a college campus.

Users can create reports for lost or found belongings, upload item images, browse community reports, search and filter listings, manage their own reports, and view detailed item information.

The key feature is an AI-powered semantic matching system. Instead of relying only on exact keyword matches, the system converts item descriptions into vector embeddings using the `all-MiniLM-L6-v2` Sentence Transformer model and compares lost reports against found reports using cosine similarity.

This allows semantically similar descriptions to be identified even when the wording is different.

---

## Key Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- User-specific item management
- Role support for users and administrators

### Lost & Found Management

- Create lost and found reports
- Add title, description, category, location and date
- Upload item images
- View detailed item information
- Edit owned reports
- Delete owned reports
- View personal reports through My Items

### Search & Filtering

- Search by title, description, category and location
- Filter by Lost / Found status
- Filter by category
- Filter by date range
- Combine multiple filters
- Dynamic result count

### AI Semantic Matching

- Sentence Transformer based semantic matching
- `all-MiniLM-L6-v2` embedding model
- Cosine similarity calculation
- Opposite-status candidate matching
- Similarity-based ranking
- Strong matches surfaced to users
- AI match results displayed on item details pages

### Image Management

- Item image uploads
- User avatar uploads
- Cloudinary integration
- Image previews
- Responsive image display

---

## AI Semantic Matching

The AI matching system is implemented as a separate Python FastAPI microservice.

```text
                    +----------------------+
                    |    React Frontend    |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |   Node.js + Express  |
                    |       REST API       |
                    +------+-----------+---+
                           |           |
                           |           v
                           |   +------------------+
                           |   |  Python FastAPI  |
                           |   |    AI Service    |
                           |   +--------+---------+
                           |            |
                           |            v
                           |   +------------------+
                           |   | all-MiniLM-L6-v2 |
                           |   | Sentence         |
                           |   | Transformer      |
                           |   +--------+---------+
                           |            |
                           |            v
                           |   +------------------+
                           |   | Cosine Similarity|
                           |   | + Ranking        |
                           |   +------------------+
                           |
                           v
                    +----------------------+
                    |       MongoDB        |
                    +----------------------+


