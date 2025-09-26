
# PMSUCS

## 📌 Overview

This is a React project built with **Vite** and follows a modular architecture for maintainability and scalability. It includes authentication handling, protected routes, and API service integration.

## 🚀 Features

- ✅ **Vite** for fast development and optimized builds
- ✅ **React Router** for client-side navigation
- ✅ **Authentication** with protected and public routes
- ✅ **Context API** for global state management
- ✅ **Custom Hooks** for reusable logic
- ✅ **Axios Services** for API calls
- ✅ **Reusable Components** to maintain UI consistency

## 📂 Project Structure

```plaintext
SEP490-pms-fe/
├── src/
│   ├── assets/          # Static assets (images, icons, styles, etc.)
│   ├── components/      # Reusable UI components (buttons, modals, etc.)
│   ├── constants/       # Declare text of button, header, label, common text, etc.
│   ├── context/         # React Context for global state management
│   ├── hooks/           # Folder contains custom React hooks that encapsulate reusable logic
│   ├── layouts/         # Layout wrappers (e.g., SidebarLayout, HeaderLayout)
│   ├── modals/          # Modal components
│   ├── pages/           # Page components (Dashboard, Profile, etc.)
│   ├── routes/          # React Router setup
│   ├── services/        # API calls and business logic (e.g., Axios services)
│   ├── themes/          # Define default styles for Ant design component
│   ├── types/           # TypeScript type definitions and interfaces
│   ├── utils/           # Helper functions (date formatter, storage helpers)
│   ├── workers/         # Web Workers for handling heavy computations
│   ├── App.tsx          # Main App component
│   ├── main.tsx         # React entry point
├── public/              # Static files (index.html, favicon, etc.)
├── index.html           # The main HTML file where React mounts the app
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
```

## 🛠️ Setup & Installation

1️⃣ Prerequisites

Ensure you have Node.js installed. You can check by running:

```bash
node -v
```

2️⃣ Install Dependencies

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd SEP490-pms-fe
npm install
```

3️⃣ Start Development Server

Run the development server:

```bash
npm run dev
```

The app should be available at http://localhost:5173/

4️⃣ Build for Production

To create an optimized production build:

```bash
npm run build
```

🔄 Routing

This project uses React Router for navigation.

## 🔑 Authentication Logic

If authenticated, redirect / (home).

If not authenticated, redirect to /login.

## 🌟 Technologies Used

⚡ Vite (fast build tool)

⚛ React (frontend library)

🛣 React Router (client-side routing)

🔄 Axios (API requests)

🎭 Context API (global state management)

🎨 CSS Modules/Antd design

## 📜 License

This project is licensed under the PMS License.
