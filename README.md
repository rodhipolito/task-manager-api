# 🎫 Taskly — Full-Stack Helpdesk Platform

> **Helpdesk reinvented for modern teams.**  
> Manage tickets, track progress, and collaborate — all in one sleek dashboard.

---

## ✨ Overview

Taskly is a **full-stack Helpdesk & Ticket Management System** built for modern development teams and support centers.  
It’s designed with clean architecture, role-based authentication, and real-time dashboards — ready for production and easy to deploy.

---

## ⚙️ Tech Stack

**Frontend:** React + TypeScript + TailwindCSS  
**Backend:** ASP.NET Core 8 Web API  
**Database:** PostgreSQL (via Supabase)  
**ORM:** Entity Framework Core  
**Auth:** JWT + Refresh Tokens  
**Realtime:** SignalR *(optional)*  
**Infra:** Render (API) + Vercel (Frontend)  
**CI/CD:** GitHub Actions  
**Docs:** Swagger / OpenAPI  

---

## 🚀 Live Demo

🌐 **Frontend:** https://tickets-manager-api.vercel.app/  
⚙️ **API:** 
🧑‍💻 **Test User**
Login: teste@teste.com
Password: 12345


---

## 🎯 Features

✅ Secure login with JWT & refresh tokens  
✅ Role-based access: **Admin · Agent · Client**  
✅ CRUD for tickets with priority, status & history  
✅ Interactive dashboard with charts (Recharts)  
✅ Real-time notifications via SignalR  
✅ Fully documented API via Swagger  
✅ Production-ready CI/CD on every push  

---

## 🧠 Architecture


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
├── /scripts → CI/CD, build & deploy configs
└── README.md



---
## 📈 Dashboard

Taskly comes with a powerful analytics dashboard built with **Recharts**, giving you:
- Tickets by priority & status  
- Tickets per agent  
- Daily/weekly performance trends  

---

## 🧩 API Documentation

Swagger UI available at:  
👉 `/swagger/index.html`  

https://task-manager-api-c5y1.onrender.com/swagger/index.html

Includes all endpoints with schemas, models, and example requests/responses.

---

## ⚡ CI/CD Workflow

✅ **GitHub Actions** automatically builds, tests, and deploys both apps  
✅ **Render** hosts the .NET API  
✅ **Vercel** hosts the React frontend  
✅ Zero manual steps — every push to `main` goes live 🚀  

---

## 🗺️ Roadmap

- [x] JWT Authentication  
- [x] Role System (Admin / Agent / Client)  
- [x] Tickets CRUD  
- [x] Dashboard Analytics  
- [ ] Real-time chat via SignalR  
- [ ] Email notifications  
- [ ] Team metrics and SLA reports  

---

## 🧑‍💻 Author

**Rodrigo Silva** — Backend Developer & Data Solutions  
📍 Lisbon, Portugal  

💼 [LinkedIn](https://www.linkedin.com/in/rodrigo-hipolito-silva/)  
🌐 [GitHub](https://github.com/rodhipolito)

> “Build fast. Deploy smart. Learn endlessly.” ⚡

---

## 💬 Contribute

Pull requests and ideas are welcome!  
If you find a bug or want to suggest a feature, open an issue — let’s make Taskly even better together 💙

---

## 🛡️ License

MIT License — free to use, modify and share.

---

⭐ **Star this repo** if you like it — it helps others discover Taskly!  
