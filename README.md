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

## LMSR Logic in Our Prediction Markets

Our platform uses the **Logarithmic Market Scoring Rule (LMSR)** as the automated market maker for all prediction markets. LMSR is a popular mechanism for prediction markets because it provides continuous liquidity and automatically adjusts prices (probabilities) based on the stakes placed by users. This ensures that users can easily place stakes at any time, while also allowing the platform to detect shifts in sentiment—**serving as an early warning system for potential misinformation.**

### How LMSR Works

- **Shares System:**  
  In a traditional LMSR market, users buy and sell "shares" in possible outcomes. The price of each share is determined by the current distribution of shares and the market's liquidity parameter. As more shares are bought for an outcome, its implied probability (and price) increases.

- **Price Calculation:**  
  The LMSR formula ensures that the cost to move the market probability increases as the market becomes more certain. This prevents any single user from drastically moving the market with a small stake.

### User-Friendly Abstraction

To make the experience more intuitive, we **abstract away the concept of shares**. Instead, users interact with the market using **ProvePoints (PP)**, our platform's staking currency.

- **Direct Upside Visualization:**  
  When a user stakes ProvePoints on an outcome, the platform calculates and displays their **expected upside** (potential gain per PP staked) using the underlying LMSR math. This means users don't need to understand or manage shares—they simply see how much they stand to gain if their prediction is correct.

- **Behind the Scenes:**  
  - When a user stakes, the system uses LMSR to determine how many "virtual shares" their stake would buy.
  - The market's probabilities (odds) are updated based on the new share distribution.
  - The user's upside is calculated and shown directly, making the process transparent and user-friendly.

### Example

Suppose the market is 50/50 and you stake 100 PP on "Yes":
- The system calculates, via LMSR, how much this moves the probability.
- You immediately see your **upside per PP** and the new market odds.
- No need to worry about shares or complex formulas—just stake and see your potential reward.

---

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors and Acknowledgments

- **Joel Tan Zhuo Yao**
- **Yap Yulun**
