# 📘 Campus Exit Management System (CEMS) — Babcock University

A digital platform that streamlines the **student exeat (exit) request and approval workflow** at Babcock University.
This system eliminates paper-based processes by providing a **fast, secure, and trackable** way for students, hall administrators, HODs, and security personnel to manage campus exits.

---

## 🚀 Features

### 👨‍🎓 Student Features

* Submit exeat/exit requests digitally
* Select hall of residence
* Upload parental consent letter & student ID card
* View status updates in real time
* Generate QR code for verification during exit
* Track request history
* Mark return to campus to complete the exit cycle

### 🏢 Hall Admin Features

* View incoming student exit requests
* Approve or deny exit requests
* Add comments or required adjustments

### 👨‍🏫 HOD Features

* Validate hall-approved requests
* Additional confirmation step for sensitive requests

### 🛡️ Security Features

* Scan QR codes
* Verify student’s departure in real time
* Confirm student’s return to close request lifecycle

### ⚙️ Additional System Features

* Authentication and role-based access
* Real-time updates powered by Supabase
* Fast and responsive UI built with React + TypeScript + TailwindCSS
* Deployment via **Vite** and **Vercel**

---

## 🛠️ Tech Stack

| Layer              | Technology                             |
| ------------------ | -------------------------------------- |
| Frontend           | React, TypeScript, Tailwind CSS        |
| Backend / Database | Supabase (Auth, Database, Storage)     |
| Build Tool         | Vite                                   |
| Deployment         | Vercel                                 |
| Others             | QR Code generation, Role-based routing |

---

## 📂 Project Structure (Summary)

```
/public
/src
  /components
  /hooks
  /pages
  /integrations
  /libs
  App.css
  App.tsx
  index.css
  main.tsx
/supabase
/public
/components.json
/package.json
/index.html
/vite.config.ts
tsconfig.json
tailwind.config.js
tailwind.app.js
.env
.gitignore
```

---

## 🧰 Getting Started (Local Development)

### 1. **Clone the repository**

```bash
git clone https://github.com/BU-SENG/foss-project-olive.git
cd foss-project-olive
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Create environment variables**

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_ROLE=your-service-role-key
VITE_APP_BASE_URL=http://localhost:5173
```

> ⚠️ **Never commit your production service role key.**

### 4. **Start the development server**

```bash
npm run dev
```

Your app will be running at:

```
http://localhost:5173
```

---

## 🔧 Building for Production

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

Deployment is configured for **Vercel**, but this build output also works on Netlify, Cloudflare Pages, or any static host.

---

## 🌍 Deployment (Vercel)

1. Push your project to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Import project → Select the repo
4. Add the same environment variables under **Project Settings → Environment Variables**
5. Deploy and publish 🎉

Project is available at [https://foss-project-olive.vercel.app](https://foss-project-olive.vercel.app/)

---

## 🤝 Contributors

* **EMEGHALU KOBIMDI VANESSA, 22/0266**
* **FAYEMI IDUNNUOLUWA DAVID, 22/0247**
* **KESHINRO OLUWANIFEMI IMMAUELLA, 22/0074**
* **KWAGHNGISE QUEEN SULUMSHIMA, 22/0194**
* **LAI-OKE TOLUWANI FAVOUR, 22/0304**
* **LAWAL SHARON OLUWATOBILOBA, 22/0234**
* **MALLUM ANN USUBIT, 22/0153**
* **MOKOLO JESSE CHIFUMNANYA, 22/0161**
* **NDIDI DESTINY EKENEMCHUKWU, 22/0086**
* **HENRY ISLEY TEMIDAYO, 21/1627**


---

## 📬 Support

For inquiries or improvements, open an issue or submit a pull request.

---


