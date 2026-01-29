# FGMC2 KMIS Frontend Prototype

A clickable frontend prototype demonstrating the Knowledge Management Information System for FGMC2 stakeholder validation.

## Running Locally

```bash
cd kmis-prototype
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Changing Role

Use the **role selector dropdown** in the top-right corner of the header. Three roles are available:

- **Internal Viewer** — Search documents, ask AI questions, view evidence pages
- **Internal Admin** — All viewer features plus upload, validate, publish, and admin settings
- **External CoP Member** — Browse published resources on the Community of Practice portal

You can also select a role from the landing page cards.

## Resetting Demo Data

Click the **"Reset Demo Data"** link in the footer to restore all seed data to its original state. This clears localStorage and reloads the page.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- React Router v7
- localStorage for persistence (no backend required)
