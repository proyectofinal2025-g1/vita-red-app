# 🏥 VitaRed – Plataforma de Gestión Médica

**Backend: NestJS + TypeORM + PostgreSQL**  
**Frontend: Next.js (App Router) + TypeScript**

VitaRed es una plataforma de gestión médica orientada a la administración de **doctores, turnos, especialidades, pacientes y pagos**, con distintos roles de usuario y un **chatbot integrado** para asistir a los usuarios dentro de la aplicación.  
El sistema está diseñado con una arquitectura modular, priorizando mantenibilidad, escalabilidad y buenas prácticas de desarrollo.

Este proyecto fue desarrollado como parte del bootcamp **Henry Full Stack Developer**.

---

## 🚀 Características principales

### 🧠 Backend
- Gestión de **usuarios y roles** (user, doctor, secretary, super-admin)
- Administración de **doctores**, **especialidades** y **agendas**
- Sistema completo de **turnos médicos**
- **Historial clínico** de pacientes
- **Pagos** con integración a Mercado Pago (webhooks)
- **Chatbot backend**
- **Notificaciones** y cron jobs
- Seed de datos iniciales
- Arquitectura modular (Controllers, Services, Repositories, DTOs)

### 🖥️ Frontend
- Next.js (App Router) + TypeScript
- Consumo de **APIs REST**
- Dashboards por rol
- Gestión de turnos
- Formularios conectados al backend
- **Chatbot integrado**
- Protección de rutas y manejo de sesión

---

🧱 Arquitectura del Backend
```
src/
├── appointments/        # Gestión de turnos
├── auth/                # Autenticación, JWT, guards y Google auth
├── chat/                # Chatbot y lógica conversacional
├── cloudinary/          # Integración para carga de archivos
├── config/              # Configuración TypeORM y servicios
├── decorators/          # Decoradores personalizados (roles)
├── doctor/              # Gestión de doctores y agendas
├── doctor-speciality/   # Relación doctor - especialidad
├── medical-record/      # Historial clínico
├── notification/        # Notificaciones y cron jobs
├── payments/            # Pagos y webhooks (Mercado Pago)
├── secretary/           # Funcionalidades de secretaría
├── seed/                # Seed de datos
├── speciality/          # Especialidades médicas
├── super-admin/         # Backoffice y métricas
├── user/                # Usuarios y roles
├── app.module.ts
└── main.ts
```
---

## 🧱 Arquitectura del Frontend

```
src/
├── app/                 # Rutas (App Router)
│   ├── auth/
│   ├── dashboard/
│   ├── doctor/
│   ├── patient/
│   ├── super-admin/
│   ├── payment/
│   └── unauthorized/
├── components/
│   ├── chat/            # Chatbot UI
│   └── UI/              # Componentes reutilizables
├── contexts/            # AuthContext
├── hooks/               # Hooks personalizados
├── interfaces/          # Tipos e interfaces
├── services/            # Servicios para consumo de APIs
├── utils/               # Helpers y utilidades
├── validators/          # Validaciones de formularios
└── globals.css
```

## 📦 Tecnologías utilizadas

### Backend

- NestJS
- TypeORM
- PostgreSQL
- JWT
- Mercado Pago (webhooks)
- Cloudinary
- Cron Jobs

# Frontend

- Next.js (App Router)
- React
- TypeScript
- Context API
- Custom Hooks
- Herramientas
- Git / GitHub
- ESLint
- Prettier
- Variables de entorno 

### ⚙️ Instalación y ejecución
🔹 Backend
- git clone <repo-backend>
- cd backend
- npm install


## Configurar variables de entorno (.env):

- DB_HOST=localhost
- DB_PORT=5432
- DB_USERNAME=postgres
- DB_PASSWORD=yourpassword
- DB_NAME=DB_NAME

- JWT_SECRET=jwtsecret

- CLOUDINARY_CLOUD_NAME=nombre de cloudinary
- CLOUDINARY_API_KEY=api key cloudinary
- CLOUDINARY_API_SECRET=api secret cloudinary

- FIRST_NAME_SUPERADMIN=yourName;
- LAST_NAME_SUPERADMIN=yourLastName;
- DNI_SUPERADMIN=YourDocument;
- EMAIL_SUPERADMIN=yourEmail;
- PASSWORD_SUPERADMIN=yourpassword;

# ENVS PARA MERCADO PAGO
- MP_WEBHOOK_SECRET=nombre del proyecto en MC
- MP_ACCESS_TOKEN=token de mercado pago
- BACKEND_URL=url de deploy (render)
- FRONTEND_URL=url de deploy (vercel)

# SENDGRID CONFIGURATION
- SENDGRID_API_KEY=yourSendgridApiKey
- SENDGRID_FROM_EMAIL=yourVerifiedSendgridEmail


#   GOOGLE AUTH
- GOOGLE_CLIENT_ID=your_google_client_id
- GOOGLE_CLIENT_SECRET=your_google_client_secret
- GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback


#    CHAT
- OPENAI_API_KEY=your_openai_api_key 


## Ejecutar:

- npm run start:dev

🔹 Frontend
- git clone <repo-frontend>
- cd frontend
- npm install
- npm run dev


## Configurar .env.local con la URL del backend.

- NEXT_PUBLIC_API_URL=http://localhost:3000
