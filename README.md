# HubClaw - AI Agent Orchestration Platform

![HubClaw Logo](frontend/public/logo-hubclaw.svg)

## 🚀 Apa Itu HubClaw?
HubClaw adalah platform orkestrasi agen AI canggih yang memungkinkan kamu untuk membuat, mengelola, dan menggunakan beberapa agen AI secara terintegrasi. Dengan antarmuka yang ramah pengguna dan animasi yang memukau, HubClaw memudahkan developer, startup, dan tim untuk:

- 🔗 **Orkestrasikan beberapa agen AI dalam satu workflow
- 📊 Analisis kinerja agen secara real-time
- 🎨 Penggunaan antarmuka dengan tema gelap dan terang
- 📚 Perpustakaan prompt terorganisir
- 🛡️ Keamanan dan kontrol akses
- 🚀 Boot screen dan landing page yang cinematic
- 💬 Command center untuk setiap agen dengan riwayat chat yang persisten

## 📦 Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand + Local Storage
- **Styling**: Tailwind CSS + Custom CSS Properties
- **Animasi**: Framer Motion
- **Visualisasi Data**: Recharts
- **Icons**: Lucide React
- **AI Model**: OpenRouter + Gemini AI (dengan fallback mock)
- **Backend (Opsional)**: Supabase (dengan mock fallback)

## 🎮 Fitur Utama

### 1. 🎨 Boot Screen Cinematic
- Tampilan boot OS-style dengan animasi yang memukau
- Progress bar dengan gradient ungu-biru
- Logo HubClaw yang berkilau
- Animasi spring

### 2. 🏠 Landing Page Minimalis
- Background glow yang dinamis
- Fitur showcase
- Tombol CTA yang menarik
- Link ke repo GitHub

### 3. 📊 Dashboard Utama
- Tampilan daftar agen dengan grid responsif
- Search bar untuk mencari agen
- Button "Back to Landing Page"
- Navigasi ke:
  - Global Analytics
  - Prompt Library
  - Orchestration
- Agent cards dengan rating bintang

### 4. 💬 Command Center
- Chat dengan setiap agen secara individual
- Riwayat chat tersimpan di localStorage
- Mock AI fallback jika backend tidak aktif
- Tombol GitHub link

### 5. 📈 Analytics View
- Visualisasi kinerja agen
- Grafik interaktif dengan Recharts
- Statistik token usage, jumlah chat, dan banyak lagi

### 6. 📚 Prompt Library
- Perpustakaan prompt yang bisa dikembangkan
- Simpan dan atur prompt Anda sendiri

### 7. 🔀 Orchestration Page
- Buat dan kelola pipeline agen berantai
- Jalankan workflow multi-agent
- Hapus dan edit pipeline

### 8. ⚙️ Create Agent Modal
- Formulir lengkap untuk membuat agen baru
- Konfigurasi model, temperatur, max tokens, tools

### 9. 🎭 Tema Gelap & Terang
- Switcher tema yang fully functional
- CSS Custom Properties untuk konsistensi

### 10. 🍞 Breadcrumb Navigation
- Navigasi yang jelas di setiap halaman
- Back button untuk kembali ke halaman sebelumnya

## 🚀 Cara Instalasi & Penggunaan

### Prasyarat
- Node.js 18+ (atau lebih tinggi)
- npm atau yarn atau pnpm
- Git

### Langkah 1: Clone Repository
```bash
git clone https://github.com/allinoneacount1-dot/hubclaw.git
cd hubclaw
```

### Langkah 2: Instal Dependensi Frontend
```bash
cd frontend
npm install
```

### Langkah 3: Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda di `http://localhost:5174/`

### Langkah 4: Build untuk Produksi
```bash
npm run build
```

### Langkah 5: Preview Build
```bash
npm run preview
```

## 📂 Struktur Proyek
```
hubclaw/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo-hubclaw.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentCard.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   ├── BootScreen.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── CommandCenter.tsx
│   │   │   ├── CreateAgentModal.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── OrchestrationPage.tsx
│   │   │   ├── PromptLibrary.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Toast.tsx
│   │   ├── store.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 📝 Contoh Alur Penggunaan
1. **Buka aplikasi di browser
2. **Boot Screen berjalan
3. **Klik "Enter Dashboard" di Landing Page
4. **Anda akan diarahkan ke Dashboard
5. **Klik agent untuk masuk ke Command Center
6. **Chat dengan agent AI (mock jika backend tidak aktif
7. **Kembali ke Dashboard dengan tombol Back
8. **Jelajahi Analytics, Prompt Library, atau Orchestration
9. **Kembali ke Landing Page dengan tombol Home di Dashboard

## 🎨 Kustomisasi
Anda dapat mengkustomisasi:
- Tema warna di `frontend/src/index.css`
- Logo di `frontend/public/logo-hubclaw.svg`
- Mock data di `frontend/src/components/Dashboard.tsx`
- Terdapat banyak lagi!

## 📚 Dokumentasi Chat
Untuk dokumentasi chat lengkap (lebih dari 10.000 karakter dan ratusan contoh chat, lihat `CHAT_DOCUMENTATION.md`.

## 🚀 Deploy ke Vercel
Proyek ini siap untuk di-deploy ke Vercel! Caranya:
1. Push repository ke GitHub
2. Buka https://vercel.com dan login
3. Import project baru
4. Pilih repository `frontend` sebagai root direktori
5. Deploy dengan settingan default
6. Selesai! 🎉

## 📝 Lisensi
MIT License - silakan lihat LICENSE untuk informasi lebih lanjut.

## 🤝 Kontribusi
Kami sangat menerima kontribusi apapun! Buka issue atau pull request!

## 📞 Kontak
GitHub: https://github.com/allinoneacount1-dot/hubclaw

---
Dibuat dengan ❤️ dan AI oleh tim HubClaw
