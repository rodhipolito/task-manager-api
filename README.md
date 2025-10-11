# 🎫 Taskly — Full-Stack Helpdesk Platform  

![.NET](https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render.com-46E3B7?logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **Helpdesk moderno para equipas ágeis.**  
> Gere tickets, acompanhe métricas e colabore em tempo real — tudo num único painel intuitivo.

---

## ✨ Overview  

**Taskly** é uma plataforma **Full-Stack de Helpdesk e Gestão de Tickets**, criada para equipas de suporte e desenvolvimento modernas.  
O projeto foi desenhado com **arquitetura limpa, autenticação segura e dashboards interativos**, prontos para produção e deploy automático.

---

## ⚙️ Tech Stack  

**Frontend:** React + TypeScript + TailwindCSS  
**Backend:** ASP.NET Core 8 Web API  
**Database:** PostgreSQL (via Supabase AWS Pooler)  
**ORM:** Entity Framework Core  
**Auth:** JWT + Refresh Tokens  
**Realtime:** SignalR *(opcional)*  
**Infra:** Render (API) + Vercel (Frontend)  
**CI/CD:** GitHub Actions  
**Docs:** Swagger / OpenAPI  

---

## 🚀 Live Demo  

🌐 **Frontend:** [https://tickets-manager-api.vercel.app](https://tickets-manager-api.vercel.app)  
⚙️ **API:** https://task-manager-api-c5y1.onrender.com/swagger/index.html

🧑‍💻 **Demo Login**  

Email: teste@teste.com
Password: 12345



---

## 🎯 Features

✅ JWT Authentication + Refresh Tokens  
✅ Role-based Access: **Admin · Agent · Client**  
✅ CRUD completo de tickets (prioridade, status, histórico)  
✅ Dashboard interativo com **Recharts**  
✅ Integração com Supabase (PostgreSQL Cloud)  
✅ Swagger UI com documentação completa  
✅ CI/CD automático com **GitHub Actions**  
✅ Deploy contínuo em **Render + Vercel**

---

## 🧠 Architecture

---
📦 Taskly Monorepo
├── /api → ASP.NET 8 Web API (C#)
│ ├── Controllers
│ ├── DTOs
│ ├── Models
│ ├── Data (EF Core)
│ └── Program.cs
│
├── /web → React + TypeScript + Tailwind
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── api/
│ └── routes/
│
└── /scripts → build, deploy & GitHub Actions configs

---


---

## 📊 Dashboard

O painel de controlo exibe métricas em tempo real com **Recharts**:

📈 Tickets por prioridade e status  
👥 Tickets por agente  
📅 Tendências diárias e semanais

---

## 🧩 API Documentation

📚 Swagger UI disponível em:  
👉 [https://task-manager-api-c5y1.onrender.com/swagger/index.html](https://task-manager-api-c5y1.onrender.com/swagger/index.html)

Inclui todos os endpoints com:
- Schemas e modelos  
- Requests e responses de exemplo  
- Teste direto via interface Swagger

---

## ⚡ CI/CD Workflow

✅ **GitHub Actions** — build, teste e deploy automático  
✅ **Render** — API ASP.NET Core hospedada  
✅ **Vercel** — Frontend React hospedado  
✅ Zero intervenção manual: cada push em `main` vai direto para produção 🚀

---

## 🗺️ Roadmap

- [x] JWT Authentication  
- [x] Role System (Admin / Agent / Client)  
- [x] Tickets CRUD  
- [x] Dashboard Analytics  
- [ ] Real-time chat via SignalR  
- [ ] Email notifications  
- [ ] SLA & Team performance reports

---

## 👨‍💻 Author

**Rodrigo Silva** — Backend Developer & Data Solutions  
📍 Lisbon, Portugal  

🔗 [LinkedIn](https://www.linkedin.com/in/rodrigo-hipolito-silva/)  
💻 [GitHub](https://github.com/rodhipolito)

> “Build fast. Deploy smart. Learn endlessly.” ⚡

---

## 💬 Contribute

Contribuições são bem-vindas!  
Abra um issue ou envie um pull request — vamos evoluir o **Taskly** juntos 💙

---

## 🛡️ License

MIT License — livre para usar, modificar e distribuir.

---

⭐ **Dê uma estrela no repositório** se gostou — ajuda o projeto a crescer!
