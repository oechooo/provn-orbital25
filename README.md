# Provn.io

Provn.io is a prediction markets platform for news verification that harnesses the collective efforts of online users to dramatically scale verification efforts through prediction markets. We mobilise users by giving them a stake in truthfulness, and use rewards and incentives to ensure the accuracy of predictions made by these simulated markets.

## Features

- **Login Feature**: Working signup feature that stores user data for logins
- **User Authentication**: Secure JWT-based authentication with password reset

## Planned Features

- **ProvePoints System and Economy**: Earn and spend points based on prediction accuracy
- **Prediction Markets**: Stake points on news article truthfulness with real-time market dynamics in different time frames (1 day, 1 month, 5 months)
- **Community Forum**: Discussion spaces for each article where users can share insights about the story

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with SQLite database
- **JWT** for authentication
- **bcrypt** for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm package manager

### Usage

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret-key"
   PORT=3000
   ```
   
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

2. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors and Acknowledgments

- **Joel Tan Zhuo Yao**
- **Yap Yulun**
