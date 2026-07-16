# SkillSwap – Real-Time Peer-to-Peer Skill Exchange Platform

## Project Description

SkillSwap is a scalable **MERN Stack** application that enables users to exchange skills through a peer-to-peer learning platform. Users can create profiles, showcase their expertise, discover compatible learning partners using intelligent skill matching, schedule learning sessions, communicate via real-time chat, and provide feedback after each session. The platform is built with a production-ready architecture, featuring secure authentication, automated CI/CD pipelines, and an optimized user experience.

## 🚀 Features

- **Secure Authentication**
  - JWT-based authentication with protected routes.
  - User registration, login, and profile management.

-  **Smart Skill Matching**
  - Matches users based on offered and desired skills.
  - Personalized recommendations for learning partners.

-  **Session Scheduling**
  - Schedule, manage, and track skill exchange sessions.
  - View upcoming and completed sessions.

-  **Real-Time Chat**
  - Instant messaging powered by Socket.IO.
  - Seamless communication between matched users.

-  **Feedback & Ratings**
  - Rate and review completed learning sessions.
  - Builds trust and improves future matches.

- **User Dashboard**
  - Manage profile, matches, chats, schedules, and feedback from a centralized dashboard.

-  **Optimized Performance**
  - Efficient REST APIs and optimized MongoDB queries.
  - Responsive React UI for a smooth user experience.

- **CI/CD Automation**
  - Automated testing, code quality checks, and deployments using GitHub Actions.

-  **Scalable Architecture**
  - Modular MERN architecture designed for maintainability and future scalability.

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT |
| Real-Time Communication | Socket.IO |
| DevOps | GitHub Actions (CI/CD) |
| Version Control | Git, GitHub |

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```
