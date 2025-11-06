# SOFTWARE_DEVELOPMENT_CLIENT - Architecture Analysis

## 📋 Overview

**Framework**: Next.js 16.0.0 with React 19.2.0  
**Language**: TypeScript 5  
**Styling**: Tailwind CSS 4  
**Package Manager**: pnpm (monorepo workspace)  
**Internationalization**: next-intl 4.4.0  
**State Management**: Zustand  
**HTTP Client**: Axios

---

## 🏗️ Project Structure

### Monorepo Architecture

```
SOFTWARE_DEVELOPMEN_CLIENT/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Dynamic locale routing (en, es)
│   │   ├── (authorized)/        # Protected routes (requires session)
│   │   │   ├── layout.tsx       # Auth middleware - checks session cookie
│   │   │   └── app/             # Main application area
│   │   │       ├── admin/       # Admin dashboard
│   │   │       ├── client/      # Client dashboard
│   │   │       └── super-admin/ # Super admin dashboard
│   │   ├── (unauthorized)/      # Public routes
│   │   │   ├── login/           # Login page
│   │   │   └── register/        # Registration page
│   │   ├── layout.tsx           # Root layout with NextIntlClientProvider
│   │   └── page.tsx             # Home page
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx               # App root layout
│   └── page.tsx
├── packages/                    # Shared monorepo packages
│   ├── api/                     # API integration layer
│   │   └── auth/
│   │       └── auth.service.ts  # Authentication service (stub)
│   ├── design-system/           # UI components library
│   │   ├── components/
│   │   │   └── CustomLink.tsx   # Locale-aware Link component
│   │   └── index.ts
│   ├── internationalization/    # i18n configuration
│   │   └── routing.ts           # next-intl routing config (en, es)
│   ├── setup/                   # Configuration and utilities
│   │   └── axios.config.ts      # HTTP client setup with interceptors
│   └── store/                   # State management
│       └── index.ts             # Zustand auth store
├── middleware.ts                # Next.js middleware for i18n
├── next.config.ts               # Next.js configuration
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔐 Authentication & Authorization

### Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                          │
└─────────────────────────────────────────────────────────────────┘

1. User Login (Next.js Client)
   └─> POST /auth/login
       └─> API Gateway (Port 4000)
           └─> Auth MS (Port 3001)
               └─> Validates credentials (bcrypt)
               └─> Generates JWT token
               └─> Returns { accessToken, refreshToken, user }

2. Store Session
   └─> Set cookie: "session" = JWT token
   └─> Update Zustand store: { token, user }

3. Protected Route Access
   └─> Middleware checks session cookie
   └─> If missing: redirect to /[locale]/login
   └─> If present: allow access

4. API Requests
   └─> Axios interceptor adds: Authorization: Bearer <token>
   └─> API Gateway validates token via Auth MS
   └─> Returns user data or 401 Unauthorized
```

### Authentication Components

#### 1. **Client-Side Protection** (`(authorized)/layout.tsx`)

```tsx
// Checks for session cookie on the server
const session = cookieStore.get("session")?.value;
if (!session) {
  redirect(`/${locale}/login`);
}
```

**Features**:

- Server-side session validation
- Automatic redirect to login
- No flash of unauthorized content

#### 2. **API Gateway Protection** (`API_GATEWAY/guards/auth.guard.ts`)

```typescript
// Global guard applied to all routes
// Validates JWT with Auth MS
// Attaches user data to request.user
```

**Features**:

- Global route protection (except @Public() decorated endpoints)
- JWT validation via NATS messaging
- User payload injection into request context

#### 3. **State Management** (`packages/store/index.ts`)

```typescript
export type AuthState = {
  token: string | null;
  user: { id: string; email: string } | null;
  setToken: (token: string | null) => void;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
};
```

**Features**:

- Zustand store for client-side auth state
- Token and user management
- Logout functionality

---

## 🌐 Internationalization

### Configuration

**Supported Locales**: `["en", "es"]`  
**Default Locale**: `"es"`  
**Implementation**: next-intl 4.4.0

### Route Structure

```
/                          → Redirects to /es (default locale)
/es                        → Spanish home page
/en                        → English home page
/es/login                  → Spanish login page
/en/login                  → English login page
/es/app/admin              → Spanish admin dashboard
/en/app/admin              → English admin dashboard
```

### Middleware Setup (`middleware.ts`)

```typescript
// Handles locale detection and routing
const intl = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});
```

**Features**:

- Automatic locale detection from URL
- Locale prefix for all routes
- Dynamic imports for translation files
- SSG support with `generateStaticParams()`

---

## 🔗 API Integration

### HTTP Client Setup (`packages/setup/axios.config.ts`)

```typescript
// Base configuration
baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
withCredentials: isCredentialsEnv;

// Request interceptor
if (authToken) {
  req.headers["Authorization"] = `Bearer ${authToken}`;
}
```

**Features**:

- Environment-based configuration (dev, staging, production)
- Automatic token injection
- Credentials handling (CORS-aware)
- Configurable base URL

### Backend Endpoints (API Gateway)

**Base URL**: `http://localhost:4000` (API Gateway)

#### Authentication Endpoints

| Method | Endpoint                     | Description          | Protection |
| ------ | ---------------------------- | -------------------- | ---------- |
| POST   | `/auth/register/user`        | Register new user    | Public     |
| POST   | `/auth/register/client`      | Register new client  | Public     |
| POST   | `/auth/login`                | User login           | Public     |
| POST   | `/auth/refresh-token`        | Refresh access token | Public     |
| POST   | `/auth/logout`               | User logout          | Protected  |
| GET    | `/auth/validate?token=<jwt>` | Validate JWT token   | Public     |

#### User Endpoints (Example)

| Method | Endpoint     | Description    | Protection |
| ------ | ------------ | -------------- | ---------- |
| GET    | `/users`     | List all users | Protected  |
| GET    | `/users/:id` | Get user by ID | Protected  |
| POST   | `/users`     | Create user    | Protected  |
| PATCH  | `/users/:id` | Update user    | Protected  |
| DELETE | `/users/:id` | Delete user    | Protected  |

---

## 🏛️ Role-Based Access Control (RBAC)

### User Roles

1. **Super Admin** (`/app/super-admin`)
   - Full system access
   - Manage all clients and users
   - System configuration

2. **Admin** (`/app/admin`)
   - Manage client users
   - View reports
   - Configure client settings

3. **Client** (`/app/client`)
   - View personal dashboard
   - Access assigned resources
   - Limited permissions

### Route Protection

```
(authorized)/              # Requires session cookie
├── app/
│   ├── super-admin/      # Role: Super Admin only
│   ├── admin/            # Role: Admin only
│   └── client/           # Role: Client only
```

**Note**: Role-based protection is implemented at layout level (currently minimal).

---

## 🎨 Design System

### Components (`packages/design-system`)

#### `CustomLink` Component

```tsx
// Automatically prefixes href with current locale
<CustomLink href="/dashboard">Dashboard</CustomLink>
// Renders: /es/dashboard or /en/dashboard
```

**Features**:

- Locale-aware navigation
- Preserves current locale
- Automatic path construction

### Styling

**Framework**: Tailwind CSS 4  
**Utility-First**: Inline utility classes  
**Dark Mode**: Supported via Tailwind classes

---

## 🔄 Microservices Integration

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Architecture                    │
└─────────────────────────────────────────────────────────────────┘

                        ┌───────────────┐
                        │  Next.js App  │
                        │   (Port 3000) │
                        └───────┬───────┘
                                │ HTTP
                                ▼
                        ┌───────────────┐
                        │  API Gateway  │
                        │   (Port 4000) │
                        └───────┬───────┘
                                │ NATS
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │   Auth MS     │       │   User MS     │
            │  (Port 3001)  │       │  (Port 3002)  │
            └───────────────┘       └───────────────┘
                    │                       │
                    │ NATS                  │ NATS
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │  Events MS    │       │   Other MS    │
            │  (Port 3003)  │       │               │
            └───────────────┘       └───────────────┘
```

### Message Broker: NATS

**Host**: `72.61.129.234`  
**Port**: `4222`  
**Auth**: Username/Password

**Pattern Topics**:

- `auth.register.user`
- `auth.register.client`
- `auth.login`
- `auth.refresh-token`
- `auth.logout`
- `auth.validate`

---

## 📦 Package Dependencies

### Core Dependencies

```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "next-intl": "^4.4.0",
  "axios": "^1.7.9",
  "zustand": "^5.0.3",
  "tailwindcss": "^4.0.0"
}
```

### Development Dependencies

```json
{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "^16.0.0"
}
```

---

## 🚀 Deployment & Environment

### Environment Variables

**Required**:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000  # API Gateway URL
NEXT_PUBLIC_ENV=development                      # development | staging | production
```

**Optional**:

```bash
NODE_ENV=production
```

### Build Process

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start
```

---

## 🔍 Key Features

### ✅ Implemented

- ✅ Next.js 16 App Router with file-based routing
- ✅ TypeScript for type safety
- ✅ Internationalization (Spanish/English)
- ✅ Session-based authentication (cookie)
- ✅ Role-based route groups (authorized/unauthorized)
- ✅ Zustand state management for auth
- ✅ Axios HTTP client with interceptors
- ✅ Tailwind CSS 4 for styling
- ✅ Monorepo structure with pnpm workspace
- ✅ Server-side session validation
- ✅ Locale-aware navigation
- ✅ Dark mode support

### 🚧 Partially Implemented

- 🚧 Authentication service (stub only)
- 🚧 Login/Register forms (UI only, no logic)
- 🚧 Role-based access control (routes exist, no enforcement)
- 🚧 API integration (HTTP client ready, no service calls)
- 🚧 Design system (CustomLink only)

### ❌ Not Implemented

- ❌ Form validation
- ❌ Error boundaries
- ❌ Loading states
- ❌ Toast notifications
- ❌ User profile management
- ❌ Password reset flow
- ❌ Email verification
- ❌ Session refresh logic
- ❌ Protected API route handlers
- ❌ Server actions
- ❌ Database integration (client-side)
- ❌ Real-time updates (WebSockets/SSE)

---

## 🔧 Integration with Python Agent

### Heartbeat Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              Python Agent → Frontend Integration                 │
└─────────────────────────────────────────────────────────────────┘

1. Python Agent (PyHeartbeatAndes.exe)
   └─> Collects activity metrics (mouse, keyboard, active window)
   └─> Buffers data locally (heartbeat_buffer.json)
   └─> Sends to API Gateway
       └─> POST /sessions (or similar endpoint)
           └─> Payload: { userId, activityMetrics, timestamp }

2. API Gateway
   └─> Validates JWT token
   └─> Forwards to Events MS via NATS
       └─> Stores in PostgreSQL/Prisma

3. Next.js Frontend
   └─> GET /sessions?userId=<id>
   └─> GET /sessions/analytics?userId=<id>
   └─> Displays in Client/Admin dashboards
```

### Expected Integration Points

1. **Session Monitoring Dashboard**
   - Real-time activity tracking
   - Historical session data
   - Activity heatmaps

2. **Analytics Dashboard**
   - Productivity metrics
   - Active vs idle time
   - Application usage statistics

3. **Admin Controls**
   - Agent activation/deactivation
   - User monitoring settings
   - Alert configuration

---

## 📝 Recommendations

### High Priority

1. **Complete Authentication Flow**
   - Implement login/register forms
   - Add form validation (react-hook-form + zod)
   - Handle API responses and errors
   - Implement session refresh logic

2. **Role-Based Access Control**
   - Add middleware to check user roles
   - Protect routes based on role
   - Create role-specific layouts

3. **Error Handling**
   - Add error boundaries
   - Toast/notification system
   - API error interceptors

4. **Loading States**
   - Skeleton loaders
   - Suspense boundaries
   - Loading indicators

### Medium Priority

5. **Design System Expansion**
   - Button component
   - Input/Form components
   - Card component
   - Modal/Dialog component

6. **Session Dashboard**
   - Create session list view
   - Activity timeline
   - Real-time updates

7. **Testing**
   - Unit tests (Jest/Vitest)
   - Integration tests
   - E2E tests (Playwright)

### Low Priority

8. **Performance Optimization**
   - Image optimization
   - Code splitting
   - Lazy loading

9. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

10. **Documentation**
    - Component documentation (Storybook)
    - API documentation
    - Setup guide

---

## 🎯 Next Steps

1. **Implement Login Form**

   ```tsx
   // app/[locale]/(unauthorized)/login/page.tsx
   - Add form with email/password
   - Call AuthService.login()
   - Handle success: set session cookie, redirect to dashboard
   - Handle error: show error message
   ```

2. **Complete AuthService**

   ```typescript
   // packages/api/auth/auth.service.ts
   - Implement login(): POST /auth/login
   - Implement register(): POST /auth/register/user
   - Implement logout(): POST /auth/logout
   - Implement getSession(): GET /auth/validate
   ```

3. **Create Protected API Routes**

   ```typescript
   // app/api/sessions/route.ts
   - GET handler: fetch sessions from backend
   - POST handler: create new session
   - Add authorization header with token
   ```

4. **Build Session Dashboard**
   ```tsx
   // app/[locale]/(authorized)/app/client/page.tsx
   - Fetch session data
   - Display activity metrics
   - Show charts/graphs
   ```

---

## 📚 Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Analysis Date**: 2025-01-XX  
**Analyst**: GitHub Copilot  
**Version**: 1.0
