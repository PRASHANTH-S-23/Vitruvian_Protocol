# Vitruvian Protocol 💪

A modern, iOS-inspired fitness tracker web app with premium glassmorphism UI, AI coaching, and customizable workouts.

**🚀 Live Demo:** [https://vitruvian-protocol.vercel.app/](https://vitruvian-protocol.vercel.app/)

![Vitruvian Protocol](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.3-646cff?style=flat-square&logo=vite)

## ✨ Features

### Core Functionality
- **Dashboard** - Daily overview with progress ring, stats, and quick actions
- **Weekly View** - 7-day training schedule with horizontal scroll cards
- **Workout Tracking** - Log sets, reps, and RPE for each exercise
- **Skill Mode** - Timer for handstand, L-sit, and Zone 2 cardio practice
- **Analytics** - Progress charts, statistics, and achievements
- **Settings** - Theme toggle, accent colors, data export

### AI Coach 🤖
- Powered by **Google Gemini**
- Get personalized fitness advice, form tips, and motivation
- Conversation history saved locally
- Bring your own API key (free tier available)

### Customization 🎨
- **Light/Dark Mode** - Premium theme switching
- **Custom Exercises** - Add, edit, delete exercises per workout type
- **Custom Schedule** - Modify your weekly training plan
- **Accent Colors** - Choose from 6 iOS-inspired colors

### Data & Storage
- **Offline-First** - Works without internet using LocalStorage
- **Cloud Sync** - Optional Supabase integration for cross-device sync
- **Data Export** - Download your workout history as JSON

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 7.3
- **Styling:** Tailwind CSS 4.2 with custom glassmorphism effects
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router DOM 7
- **Backend (optional):** Supabase (Auth + Database)
- **AI:** Google Gemini API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vitruvian-protocol.git
cd vitruvian-protocol/fitness-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables (Optional)

For cloud sync with Supabase, create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For AI Coach, users enter their Gemini API key directly in Settings.

## 📱 Usage

### Getting Started
1. Open the app and explore the Dashboard
2. Navigate to **Week** to see your training schedule
3. Start a workout from **Workout** tab
4. Track skill practice in **Skill** mode
5. View progress in **Analytics**

### Setting Up AI Coach
1. Go to **Settings** → **AI Coach**
2. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Enter your key and start chatting with your AI fitness coach

### Customizing Workouts
1. Go to **Settings** → **Workout** → **Customize Exercises**
2. Select a workout type (Strength, Mobility, Conditioning)
3. Add, edit, or delete exercises
4. Switch to **Schedule** tab to modify your weekly plan

## 🏗️ Project Structure

```
fitness-tracker/
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx      # Supabase authentication
│   │   └── ExerciseEditor.tsx  # Exercise/schedule customization
│   ├── pages/
│   │   ├── Dashboard.tsx       # Home screen
│   │   ├── WeeklyView.tsx      # Weekly schedule
│   │   ├── Workout.tsx         # Active workout tracking
│   │   ├── SkillMode.tsx       # Skill timer
│   │   ├── Chat.tsx            # AI Coach
│   │   ├── Analytics.tsx       # Stats & charts
│   │   └── Settings.tsx        # App settings
│   ├── App.tsx                 # Root component & routing
│   ├── store.ts                # LocalStorage persistence
│   ├── supabase.ts             # Cloud sync (optional)
│   ├── types.ts                # TypeScript definitions
│   └── index.css               # Global styles & themes
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 Design System

### Theme Variables
The app uses CSS custom properties for theming:

```css
--bg-primary       /* Main background */
--bg-secondary     /* Card backgrounds */
--text-primary     /* Main text color */
--text-secondary   /* Secondary text */
--text-tertiary    /* Muted text */
--glass-bg         /* Glassmorphism background */
--border-color     /* Subtle borders */
```

### Glassmorphism Classes
- `.glass` - Standard glass effect
- `.glass-premium` - Enhanced glass with gradient
- `.gradient-mesh` - Colorful background gradients

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to [Vercel](https://vercel.com) for automatic deployments.

## 🔧 Configuration

### Supabase Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on setting up cloud sync.

### Default Weekly Schedule

| Day | Type | Focus |
|-----|------|-------|
| Monday | Strength | Upper Body Push/Pull |
| Tuesday | Mobility | Flexibility & Recovery |
| Wednesday | Strength | Lower Body & Core |
| Thursday | Rest | Active Recovery |
| Friday | Conditioning | HIIT & Cardio |
| Saturday | Skill | Skill Work & Zone 2 |
| Sunday | Off | Complete Rest |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ for fitness enthusiasts
