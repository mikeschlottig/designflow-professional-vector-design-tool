# Cloudflare Workers Full-Stack React Template

[![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

A production-ready full-stack application template built on Cloudflare Workers with Durable Objects for stateful data persistence. Features a modern React frontend with Tailwind CSS, shadcn/ui components, and a Hono-powered API backend. Perfect for building scalable, real-time apps like chat systems, collaborative tools, or dashboards.

## ✨ Features

- **Edge-Native Backend**: Hono router with CORS, logging, and error handling
- **Durable Objects**: Multi-tenant storage for entities (Users, Chats, Messages) with indexing and pagination
- **Type-Safe Full-Stack**: Shared TypeScript types between frontend and worker
- **Modern React Stack**: React 18, React Router, Tanstack Query, Zustand, Framer Motion
- **Beautiful UI**: Tailwind CSS, shadcn/ui (New York style), dark mode, animations
- **Developer Experience**: Hot reload, Bun support, Vite bundling, ESLint/TypeScript
- **Production Ready**: Error boundaries, client error reporting, SPA routing
- **Scalable Architecture**: Entity-based Durable Objects for fine-grained scaling

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Backend** | Cloudflare Workers, Hono, Durable Objects |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI** | shadcn/ui, Lucide Icons, Framer Motion |
| **State** | Tanstack Query, Zustand, React Hook Form |
| **Utils** | clsx, tailwind-merge, date-fns, uuid |
| **Dev Tools** | Bun, ESLint, Wrangler |

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.1+ (fastest package manager)
- [Cloudflare Account](https://dash.cloudflare.com/) with Workers enabled
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (auto-installed via `bun install`)

### Installation

```bash
bun install
```

### Development

Start the development server with hot reload:

```bash
bun dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3000/api/health (test endpoint)

Type generation for Workers bindings:

```bash
bun cf-typegen
```

### Build & Preview

```bash
bun build      # Builds frontend assets
bun preview    # Local preview of production build
```

## 📖 Usage

The template includes a demo chat app with Users and ChatBoards stored in Durable Objects:

- **List Users**: `GET /api/users`
- **Create User**: `POST /api/users` `{ "name": "John" }`
- **List Chats**: `GET /api/chats`
- **Send Message**: `POST /api/chats/:chatId/messages` `{ "userId": "u1", "text": "Hello" }`

Frontend uses Tanstack Query for data fetching. Edit `src/pages/HomePage.tsx` to build your app. API routes live in `worker/user-routes.ts` (DO NOT edit `worker/index.ts`).

**Custom Entities**: Extend `IndexedEntity` in `worker/entities.ts` and add routes.

**UI Components**: Full shadcn/ui library available in `src/components/ui/*`. Sidebar layout in `src/components/layout/AppLayout.tsx`.

## ☁️ Deployment

Deploy to Cloudflare Workers/Pages with one command:

```bash
bun deploy
```

This builds frontend assets, bundles the Worker, and deploys via Wrangler.

**Configure Deployment**:
- Update `wrangler.jsonc` for custom domains, env vars, or bindings
- Set `wrangler secrets put` for sensitive data
- Assets served as SPA with Worker handling `/api/*`

[![[cloudflarebutton]]](https://deploy.workers.cloudflare.com)

## 🗂️ Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components & shadcn/ui
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities & API client
│   └── pages/              # Route pages
├── shared/                 # Shared TypeScript types
├── worker/                 # Cloudflare Worker backend
│   ├── core-utils.ts       # Entity base classes (DO NOT MODIFY)
│   ├── entities.ts         # Your entities (extend here)
│   └── user-routes.ts      # Custom API routes
├── tailwind.config.js      # Tailwind + shadcn config
└── wrangler.jsonc          # Cloudflare config
```

## 🔧 Customization

1. **Replace HomePage**: Edit `src/pages/HomePage.tsx` or add routes in `src/main.tsx`
2. **Add Entities**: Extend `IndexedEntity` in `worker/entities.ts`
3. **API Routes**: Add to `worker/user-routes.ts`
4. **UI Theme**: Modify `tailwind.config.js` and `src/index.css`
5. **Sidebar**: Customize `src/components/app-sidebar.tsx`

## 🤝 Contributing

1. Fork the repo
2. `bun install`
3. Create feature branch: `git checkout -b feature/AmazingFeature`
4. Commit changes: `git commit -m 'Add some AmazingFeature'`
5. Push: `git push origin feature/AmazingFeature`
6. Open PR

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

Built with ❤️ for Cloudflare Workers.