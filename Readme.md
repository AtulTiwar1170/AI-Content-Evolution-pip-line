AI Content Evolution Pipeline
A full-stack automated system that ingests blog posts from a target URL, performs competitor research via Google Search, and "evolves" the content using the Gemini 1.5 Flash LLM.

📑 Table of Contents
Architecture & Data Flow

Tech Stack

Features

Local Setup Instructions

Docker Setup (Recommended)

API Endpoints

Live Demo

🏗 Architecture & Data Flow
The system operates across three distinct services to ensure separation of concerns and scalability.

The Workflow:
Ingestion Phase: React triggers Node.js to scrape the target blog. Node.js cleans the HTML and sends the "Original" content to the Laravel API for storage in PostgreSQL.

Research Phase: When "Evolve" is clicked, Node.js searches Google for the top 2 competitors based on the article title.

LLM Phase: Node.js sends the original content + competitor context to Gemini 1.5 Flash with instructions to optimize the content while removing all Markdown formatting.

Update Phase: The "Evolved" content is sent back to Laravel, overwriting the original record and marking the author as "Gemini AI" to prevent duplicate processing.

💻 Tech Stack
Frontend: React (Vite), Tailwind CSS, Lucide Icons.

Orchestrator: Node.js (Express), Cheerio (Scraping), Google APIs.

API & DB: Laravel 11, PostgreSQL.

AI: Gemini 1.5 Flash, Google Custom Search API.

DevOps: Docker, Docker Compose.

✨ Features
Quota Protection: Intelligent checks prevent re-evolving articles that are already optimized.

Clean Output: Integrated Markdown stripper ensures AI content matches the site's original plain-text aesthetic.

Dockerized: Single-command setup for the entire environment.

Responsive UI: Real-time status updates and selective loading states for individual articles.

🛠 Local Setup Instructions
Prerequisites
PHP 8.2+ & Composer

Node.js 18+

PostgreSQL

1. Clone the Repository
Bash

git clone https://github.com/yourusername/ai-content-pipeline.git
cd ai-content-pipeline
2. Configure Global Environment
Create a .env file in the root directory:

Code snippet

# Database
DB_HOST=127.0.0.1
DB_DATABASE=laravellAssignment
DB_USERNAME=postgres
DB_PASSWORD=your_password

# AI Keys
GEMINI_API_KEY=your_key
GOOGLE_API_KEY=your_key
GOOGLE_CX=your_cx_id

# URLs
VITE_LARAVEL_API_URL=http://localhost:8000/api
VITE_NODE_API_URL=http://localhost:3000/api/v1
3. Initialize Laravel
Bash

cd laravel_api
composer install
php artisan migrate
php artisan serve
4. Initialize Node.js
Bash

cd ../node_backend
npm install
npm start
5. Initialize Frontend
Bash

cd ../frontend
npm install
npm run dev
🐳 Docker Setup (Recommended)
The easiest way to run the project without installing dependencies locally.

Build and Run:

Bash

docker-compose up --build -d
Run Migrations:

Bash

docker exec -it ai_laravel php artisan migrate
Access:

Frontend: http://localhost:5173

API: http://localhost:8000

🔗 Live Demo
Frontend Project: [Your-Vercel-or-Netlify-Link-Here]

Note: You can compare the "Original Content" (Author: BeyondChats) with the "✨ Evolved" version (Author: Gemini AI) directly in the UI feed.

📄 License
Distributed under the MIT License. See LICENSE for more information.


🧠 Technical Challenges & Problem Solving
During the development of this pipeline, several real-world engineering constraints were addressed:

1. Rate Limit & Quota Management
The Problem: The free tiers of Google Custom Search (100 queries/day) and Gemini 1.5 Flash (15 RPM) were exhausted quickly during batch processing loops. The Solution: - Switched from Batch Processing to Single-Article Evolution.

Implemented a "Gatekeeper" logic: The system checks the database for the Gemini AI author tag before making any API calls, preventing redundant costs and unnecessary hits to the quota.

Added a "Mock Fallback" in the search service to allow UI testing even when Google Search quotas are empty.

2. Cross-Environment Communication (Docker Networking)
The Problem: React (running in the browser) and Node.js (running in a container) have different definitions of localhost. The Solution: - Orchestrated a Docker Bridge Network where Node.js communicates with Laravel using internal service discovery (http://laravel_api:8000), while the React frontend remains mapped to the host's exposed ports.

3. LLM Output Consistency
The Problem: LLMs often include Markdown formatting (#, **) which clashed with the clean, plain-text requirement of the original blog platform. The Solution: - Developed a dual-layer cleaning strategy: 1. A strictly engineered System Prompt instructing the AI to use ALL CAPS for headers and plain paragraphs. 2. A backend Regex-based Markdown Stripper that sanitizes the string before it is persisted to the PostgreSQL database.