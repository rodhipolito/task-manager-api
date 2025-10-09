# Taskly v2 — Helpdesk (ASP.NET 8 + React + Supabase)

Sistema de Helpdesk full-stack com autenticação JWT, CRUD de tickets, comentários, dashboard (Recharts), Swagger e deploy em Render (API) + Vercel (frontend).

## Stack
- **Backend:** ASP.NET Core 8 Web API (C#)
- **DB:** PostgreSQL (Supabase)
- **ORM:** EF Core + Npgsql
- **Auth:** JWT + Roles (Admin, Agent, Client) + Refresh Token
- **Docs:** Swagger (`/swagger`)
- **Frontend:** React + TypeScript + Vite + Tailwind + Zustand + Recharts
- **Infra:** Render (API) + Vercel (Web)
- **CI/CD:** GitHub Actions

## Estrutura

/Taskly
├── /TasklyApi # ASP.NET 8 Web API
├── /TasklyApp # React + Vite + TS
├── .github/workflows/deploy.yml
├── render.yaml
├── .env.example
└── README.md



## Variáveis
Backend (`.env` ou envs no Render):

Frontend (`TasklyApp/.env`):



## Rodar local
### API
```bash
cd TasklyApi
dotnet ef database update
dotnet run
# http://localhost:5000/swagger




## Rodar local
### API
```bash
cd TasklyApi
dotnet ef database update
dotnet run
# http://localhost:5000/swagger


cd TasklyApp
npm i
npm run dev
# http://localhost:5173



Endpoints principais

POST /api/auth/register

POST /api/auth/login

POST /api/auth/refresh

GET /api/auth/me

GET /api/tickets

POST /api/tickets

GET /api/tickets/{id}

PUT /api/tickets/{id}

DELETE /api/tickets/{id} (Admin/Agent)

POST /api/tickets/{id}/comments

GET /api/dashboard/kpis

Deploy

Render: serviço Web com Dockerfile em TasklyApi/. Configure envs JWT_KEY, DB_CONNECTION_STRING, CORS_ORIGIN.

Vercel: projeto TasklyApp com VITE_API_URL apontando para a API no Render.

Usuário de teste (exemplo)

Crie via /api/auth/register:

{ "email": "teste@teste.com", "password": "12345", "role": "Admin" }


---

# 9) Comando final de “colar e rodar”

```powershell
# Na raiz /Taskly — instalar deps, criar DB local, rodar API e web
cd TasklyApi
$env:JWT_KEY="supersecretkey"
$env:DB_CONNECTION_STRING="Host=localhost;Database=taskly;Username=postgres;Password=postgres"
$env:CORS_ORIGIN="http://localhost:5173"
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
# Swagger: http://localhost:5000/swagger


Em outro terminal:

cd Taskly/TasklyApp
npm i
$env:VITE_API_URL="http://localhost:5000/api"
npm run dev