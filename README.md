# Papertrail

Real-time collaborative book editor built with React, TypeScript, Vite, Milkdown, and Yjs.

## Requirements

* Node.js 20+
* npm
* MongoDB running locally or a MongoDB Atlas connection

## Setup

From this directory:

```bash
npm install
```

The required `.env` file is already included in the project, so no additional environment configuration is required.

## Run

Start the backend first, then run the frontend:

```bash
npm run dev
```

The app runs at http://localhost:5173.

## Other commands

```bash
npm run build
npm run lint
npm run preview
```

The backend must be running for authentication, books, pages, and real-time collaboration to work. See the backend README for the required backend environment variables.
