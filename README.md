# Citation Presence

A mindful quote application with AI-powered guided meditations. Share inspiring quotes and receive personalized meditation guidance to deepen your contemplation practice.

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)

## Features

### Core Features
- **Quote Management** - Create, read, update, and delete your personal quotes
- **Public Quote Feed** - Browse random quotes from verified users
- **Author Profiles** - View all public quotes from a specific author

### AI-Powered Meditation
- **Guided Meditations** - Generate 5-10 line contemplative meditations based on any quote
- **Bilingual Support** - Automatic language detection (French/English)
- **Smart Caching** - Meditations are saved to avoid regeneration

### Authentication & Security
- **Secure Authentication** - JWT with short-lived access tokens (15min) + refresh tokens (7d)
- **Email Verification** - Quotes become public only after email verification
- **HTTP-Only Cookies** - Tokens stored securely, immune to XSS attacks
- **Rate Limiting** - Protection against abuse (1 meditation/day for guests, 3/day for users)

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 22+** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Authentication tokens |
| **Argon2** | Password hashing |
| **Resend** | Transactional emails |
| **OpenRouter** | AI meditation generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **React Router 7** | Client-side routing |
| **Framer Motion** | Animations |
| **TailwindCSS 4** | Styling |
| **Vite** | Build tool |

## Architecture

```
presence-sentence/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API service calls
│   │   └── config/         # Configuration
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth, sanitization, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── validators/     # Input validation
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 22+
- MongoDB (local or Atlas)
- OpenRouter API key (free tier available)
- Resend API key (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/presence-sentence.git
   cd presence-sentence
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install
   ```

3. **Configure environment variables**

   Create `server/.env`:
   ```env
   PORT=4000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/presence-sentence

   # JWT Secrets (generate with: openssl rand -hex 32)
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here

   # Cookie
   COOKIE_DOMAIN=localhost

   # Frontend URL
   APP_URL=http://localhost:5173

   # Email (Resend)
   RESEND_API_KEY=re_xxxxx
   EMAIL_FROM=noreply@yourdomain.com

   # AI (OpenRouter)
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   ```

   Create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/verify-email/:token` | Verify email |

### Quotes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes/random` | Get random public quote |
| GET | `/api/quotes/my-quotes` | Get user's quotes (auth) |
| GET | `/api/quotes/author/:pseudo` | Get author's public quotes |
| POST | `/api/quotes` | Create quote (auth) |
| PUT | `/api/quotes/:id` | Update quote (owner) |
| DELETE | `/api/quotes/:id` | Delete quote (owner) |

### Meditations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meditations/:quoteId` | Get existing meditation |
| POST | `/api/meditations/:quoteId/generate` | Generate meditation |
| GET | `/api/meditations/user/limits` | Get remaining generations |

## Security Features

- **Password Hashing** - Argon2id (winner of Password Hashing Competition)
- **JWT Strategy** - Short-lived access tokens with refresh token rotation
- **HTTP-Only Cookies** - Prevents XSS token theft
- **CORS** - Strict origin policy
- **Helmet.js** - Security headers (CSP, HSTS, etc.)
- **Rate Limiting** - Global API rate limiting
- **NoSQL Injection Protection** - Custom sanitization middleware (Express 5 compatible)
- **Input Validation** - express-validator on all inputs
- **Email Verification** - Hashed verification tokens

## Environment Variables

### Server
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 4000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_ACCESS_SECRET` | Access token secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `COOKIE_DOMAIN` | Cookie domain | No |
| `APP_URL` | Frontend URL | Yes |
| `RESEND_API_KEY` | Resend API key | Yes |
| `EMAIL_FROM` | Sender email address | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |

### Client
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
