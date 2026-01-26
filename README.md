# Personal Logbook

A responsive, offline-first Progressive Web App (PWA) for daily journaling with AI-powered mentorship.

## Features

- **Journal Entries**: Create, edit, and manage journal entries with a rich text editor
- **AI Mentor**: Get thoughtful feedback and insights from an AI mentor powered by Claude
- **Offline-First**: Full functionality offline with automatic sync when online
- **Search**: Full-text search across all entries with filters by tags, mood, and date
- **Calendar View**: Browse entries by date in a monthly calendar view
- **Profile & Preferences**: Customize your AI mentor's communication style
- **Dark Mode**: Support for light, dark, and system themes
- **PWA**: Install as a native-like app on any device
- **Data Export**: Export all data as JSON or Markdown files

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Dexie.js** (IndexedDB) for local-first storage
- **TipTap** for rich text editing
- **MiniSearch** for client-side full-text search
- **Workbox** for service worker and offline caching
- **Anthropic Claude API** for AI mentorship

## Requirements

- Node.js 18.0.0 or higher
- npm or yarn

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Anthropic API key:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

The project is configured for easy deployment to Vercel:

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add your `VITE_ANTHROPIC_API_KEY` as an environment variable
4. Deploy

### Other Platforms

The `dist` directory contains static files that can be served from any static hosting platform. Make sure to:

1. Configure redirects to `index.html` for client-side routing
2. Set up HTTPS (required for PWA features)
3. Add your API key as an environment variable

## Project Structure

```
src/
├── components/
│   ├── entry/          # Entry editor, card, and list components
│   ├── mentor/         # AI mentor chat and prompts
│   ├── profile/        # Profile and preferences forms
│   └── ui/             # Shared UI components
├── hooks/              # Custom React hooks
├── lib/                # Core libraries (database, search, AI, sync)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── views/              # Page components
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Open search
- `Cmd/Ctrl + N` - New entry
- `Cmd/Ctrl + Enter` - Save entry
- `Esc` - Cancel editing

## Data Privacy

All journal data is stored locally in your browser using IndexedDB. Your entries never leave your device unless you explicitly export them. The only external communication is with the Anthropic API for AI mentor features (which requires an internet connection and sends entry content to generate responses).

## License

MIT
