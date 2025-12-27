# Real-Time Collaborative Workspace Backend

Production-grade microservices architecture for real-time collaborative workspace with JWT authentication, Role-Based Access Control (RBAC), WebSocket communication, and asynchronous job processing.

## Architecture

**Microservices:**
- **HTTP Backend** (Port 3000): REST APIs for authentication, projects, jobs
- **WebSocket Backend** (Port 3001): Real-time collaboration events
- **Worker Backend**: Asynchronous job processing with Bull queue

**Infrastructure:**
- PostgreSQL: User, project, and job data storage
- Redis: Pub/Sub for events, queuing, and caching
- Docker: Containerized deployment for all services

**Tech Stack:**
- Node.js + TypeScript
- Express + Socket.io
- Prisma ORM
- Bull Queue
- JWT Authentication with bcrypt

## Features Implemented

### Authentication & Authorization ✅
- JWT-based authentication with token expiration
- Role-Based Access Control (RBAC): OWNER, COLLABORATOR, VIEWER
- Password hashing using bcrypt
- Session management via JWT tokens

### Project & Workspace APIs ✅
- CRUD operations for projects
- Collaborator management with role assignment
- RESTful API design with proper HTTP status codes
- Permission checks for project access

### Real-Time Collaboration ✅
- WebSocket connections authenticated via JWT
- Redis Pub/Sub for scalable event distribution
- Events: user join/leave, cursor updates, project changes
- Support for horizontal scaling

### Asynchronous Job Processing ✅
- Bull queue for reliable job management
- Background worker processing with status tracking (PENDING, PROCESSING, COMPLETED, FAILED)
- Retry logic with exponential backoff
- Job result retrieval

### Data Storage ✅
- PostgreSQL with Prisma ORM for type-safe queries
- Indexed fields for performance (e.g., userId, projectId, email)
- Redis for caching and session data

## Local Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- pnpm package manager

### Run with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd collaborative-workspace

# Start all services
docker-compose up

# Services available at:
# HTTP API: http://localhost:3000
# WebSocket: ws://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Run Locally (Development)

```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd packages/database
pnpm prisma generate
pnpm prisma migrate dev

# Start services in separate terminals
cd apps/http-backend && pnpm dev
cd apps/websocket-backend && pnpm dev
cd apps/worker-backend && pnpm dev
```

## API Documentation

### Base URL: `http://localhost:3000/api/v1`

### Authentication

All protected endpoints require a JWT token in the Authorization header: `Authorization: Bearer <token>`

#### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```

#### POST /auth/login
Authenticate and receive a JWT token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "token": "jwt_token_here",
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "name": "John Doe"
        }
    }
}
```

### Projects (Requires Authentication)

#### POST /projects
Create a new project.

**Request Body:**
```json
{
    "name": "My Project",
    "description": "Project description"
}
```

**Response (201):**
```json
{
    "id": "project-uuid",
    "name": "My Project",
    "description": "Project description",
    "ownerId": "user-uuid",
    "createdAt": "2025-12-27T..."
}
```

#### GET /projects
List user's projects.

**Response (200):**
```json
[
    {
        "id": "uuid",
        "name": "Project 1",
        "role": "OWNER",
        "collaborators": 3
    }
]
```

#### GET /projects/:id
Get project details.

**Response (200):**
```json
{
    "id": "uuid",
    "name": "Project 1",
    "description": "...",
    "owner": { "id": "...", "name": "..." },
    "collaborators": [
        {
            "user": { "id": "...", "email": "..." },
            "role": "COLLABORATOR"
        }
    ]
}
```

#### PUT /projects/:id
Update project (OWNER or COLLABORATOR).

**Request Body:**
```json
{
    "name": "Updated Name",
    "description": "Updated description"
}
```

**Response (200):** Project object

#### DELETE /projects/:id
Delete project (OWNER only).

**Response (204):** No content

### Collaborators

#### POST /projects/:projectId/collaborators
Add a collaborator (OWNER only).

**Request Body:**
```json
{
    "email": "collaborator@example.com",
    "role": "COLLABORATOR"
}
```

**Response (201):**
```json
{
    "projectId": "uuid",
    "userId": "uuid",
    "role": "COLLABORATOR"
}
```

#### PUT /projects/:projectId/collaborators/:userId
Update collaborator role (OWNER only).

**Request Body:**
```json
{
    "role": "VIEWER"
}
```

**Response (200):** Updated collaborator object

#### DELETE /projects/:projectId/collaborators/:userId
Remove collaborator (OWNER only).

**Response (204):** No content

### Jobs

#### POST /jobs/submit
Submit a job (OWNER or COLLABORATOR).

**Request Body:**
```json
{
    "projectId": "project-uuid",
    "type": "CODE_EXECUTION",
    "payload": {
        "code": "console.log('Hello')",
        "language": "javascript"
    }
}
```

**Response (201):**
```json
{
    "jobId": "job-uuid",
    "status": "PENDING",
    "createdAt": "2025-12-27T..."
}
```

#### GET /jobs/:jobId
Get job status and result.

**Response (200):**
```json
{
    "id": "job-uuid",
    "projectId": "project-uuid",
    "type": "CODE_EXECUTION",
    "status": "COMPLETED",
    "result": {
        "output": "Hello",
        "executionTime": 120
    },
    "createdAt": "...",
    "completedAt": "..."
}
```

### WebSocket API

**Connection:** `ws://localhost:3001?token=<jwt_token>`

#### Client → Server Events
- `join:project` - Join a project room
    ```javascript
    socket.emit('join:project', { projectId: 'uuid' });
    ```
- `cursor:move` - Update cursor position
    ```javascript
    socket.emit('cursor:move', {
        projectId: 'uuid',
        x: 100,
        y: 200,
        color: '#FF0000'
    });
    ```
- `project:update` - Broadcast project changes
    ```javascript
    socket.emit('project:update', {
        projectId: 'uuid',
        changes: { name: 'New Name' }
    });
    ```

#### Server → Client Events
- `user:joined` - User joined project
- `user:left` - User left project
- `cursor:update` - Cursor position update
- `project:changed` - Project data changed

### Error Responses
- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Invalid or missing token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

### Roles & Permissions
| Action | OWNER | COLLABORATOR | VIEWER |
|--------|-------|--------------|--------|
| View project | ✅ | ✅ | ✅ |
| Edit project | ✅ | ✅ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| Add collaborators | ✅ | ❌ | ❌ |
| Submit jobs | ✅ | ✅ | ❌ |
| Real-time events | ✅ | ✅ | ✅ |

## Deployment

### Railway (Recommended)
1. Sign up at https://railway.app and connect GitHub.
2. Deploy PostgreSQL and Redis services.
3. Deploy each backend (HTTP, WebSocket, Worker) separately.
4. Set environment variables: `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `PORT`.
5. Run `railway run prisma migrate deploy` for database migrations.

### Docker Compose (VPS/EC2)
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone and start
git clone <your-repo-url>
cd collaborative-workspace
docker-compose up -d



### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=production
```

### Health Checks
- HTTP: `curl http://localhost:3000/health`
- WebSocket: `curl http://localhost:3001/health`

### Scaling
- HTTP Backend: Stateless, scale with load balancer.
- WebSocket Backend: Use Redis Pub/Sub for multi-instance scaling.
- Worker Backend: Increase replicas for faster job processing.

## Design Decisions

### Microservices Architecture
- Separation of concerns for scalability and resilience.
- Independent scaling and failure isolation.

### Redis Pub/Sub
- Enables horizontal scaling of WebSocket servers.
- Decouples event producers and consumers.

### Bull Queue
- Reliable job processing with persistence and retries.

### Prisma ORM
- Type-safe database interactions and automatic migrations.

### Monorepo Structure
- Shared packages reduce duplication; consistent tooling.

## Security
- JWT authentication with secure tokens.
- Password hashing via bcrypt.
- Input validation and CORS configuration.
- SQL injection prevention with parameterized queries.
- Environment-based secrets management.


## Project Structure
```
collaborative-workspace/
├── apps/
│   ├── http-backend/       # REST API service
│   ├── websocket-backend/  # WebSocket service
│   └── worker-backend/     # Job processing service
├── packages/
│   ├── database/           # Prisma client and schemas
│   └── common/             # Shared types and utilities
├── docker/
├── docker-compose.yml
└── README.md
```

## Monitoring & Observability
- Structured logging across services.
- Error handling with try-catch.
- Job failure alerts via Bull events.
- Health check endpoints.

## Future Enhancements
- Rate limiting with Redis.
- API versioning and OpenAPI docs.
- Prometheus metrics.
- GraphQL layer.
- Kubernetes manifests.

## License
MIT

## Author
Vamsi - Full Stack Developer
