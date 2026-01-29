# KMIS — Knowledge Management Information System

A frontend application for managing documents, evidence, and knowledge across programme countries and themes. Features role-based access, AI-powered Q&A, and a Community of Practice portal.

## Running Locally

```bash
cd kmis-prototype
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## User Accounts

Sign in using one of the pre-configured accounts on the login screen. Three roles are available:

- **Internal Admin** — Full access: upload, validate, publish, AI Q&A, evidence pages, admin settings
- **Internal Staff** — Search documents, ask AI questions, view evidence pages
- **External CoP Member** — Browse published resources, upload documents, access the Community of Practice portal

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- React Router v7
- localStorage for persistence (no backend required)

## Features

- **Document Management** — Upload, tag with metadata, validate, and publish documents
- **AI Q&A** — ChatGPT-style conversational interface with scope filtering, chat history, and save-as-note
- **Evidence Pages** — Country and theme-based evidence timelines with risk snapshots
- **Community of Practice** — External portal with learning library, thematic pages, and events
- **Admin Settings** — User management, taxonomy configuration, AI model configuration via OpenRouter
