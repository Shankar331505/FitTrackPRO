# AI Fitness Tracking Application

A comprehensive fitness tracking web application with AI-powered meal planning, exercise recommendations, and nutrition tracking.

## Features

- 📊 **Nutrition Tracking** - Log meals with detailed macro and micronutrient tracking
- 🍽️ **AI Meal Plan Generator** - Generates personalized Indian meal plans using USDA API
- 🏋️ **Exercise Tracking** - Log workouts with visual exercise icons and muscle group indicators
- 🎯 **Goal Setting** - Set and track fitness goals with progress visualization
- 📈 **Analytics Dashboard** - Weekly and monthly insights with charts
- 🌙 **Dark Mode** - Full dark mode support
- 🔄 **AI Recommendations** - Smart workout suggestions based on your history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **APIs**: USDA FoodData Central, Spoonacular (optional), Gemini AI (optional)

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A text editor (VS Code recommended)

## Installation & Setup

### 1. Clone or Copy the Project

```bash
# If using git
git clone <your-repo-url>
cd College_Project

# Or simply copy the entire College_Project folder to your machine
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Recharts (for analytics)

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Or create it manually with the following content:

```env
# Required - Get free API key from https://fdc.nal.usda.gov/api-key-signup.html
NEXT_PUBLIC_USDA_API_KEY=your_usda_api_key_here

# Optional - For advanced recipe features
NEXT_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

**Getting API Keys:**

1. **USDA API Key** (Required):
   - Visit: https://fdc.nal.usda.gov/api-key-signup.html
   - Sign up for a free API key
   - Copy and paste into `.env.local`

2. **Spoonacular API** (Optional):
   - Visit: https://spoonacular.com/food-api
   - Sign up for free tier (150 requests/day)
   - Copy API key to `.env.local`

3. **Gemini AI** (Optional):
   - Visit: https://makersuite.google.com/app/apikey
   - Create a free API key
   - Copy to `.env.local`

### 4. Run the Development Server

```bash
npm run dev
```

The application will start on **http://localhost:3000**

### 5. Build for Production (Optional)

```bash
# Create optimized production build
npm run build

# Run production server
npm start
```

## Project Structure

```
College_Project/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Home/Dashboard
│   │   ├── nutrition/         # Nutrition tracking page
│   │   ├── exercise/          # Exercise tracking page
│   │   ├── goals/             # Goals & meal planner page
│   │   └── analytics/         # Analytics dashboard
│   ├── components/
│   │   ├── layout/            # Navigation, layout components
│   │   └── ui/                # Reusable UI components
│   ├── context/
│   │   └── AppContext.tsx     # Global state management
│   ├── data/
│   │   ├── nutritionDatabase.ts   # Food database
│   │   └── exerciseDatabase.ts    # Exercise database
│   ├── services/
│   │   └── recipeService.ts   # Recipe generation service
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this)
├── package.json              # Dependencies
└── tailwind.config.ts        # Tailwind configuration
```

## Usage Guide

### First Time Setup

1. **Open the app** at http://localhost:3000
2. **Navigate to Goals page** to set up your profile
3. **Enter your details**:
   - Age, gender, height, weight
   - Activity level
   - Fitness goal (weight loss, muscle gain, maintenance)
4. **Click "Auto-Calculate Macros"** to get recommended nutrition targets
5. **Generate your first meal plan** with the AI generator

### Daily Workflow

1. **Nutrition Page**: Log your meals throughout the day
2. **Exercise Page**: Log your workouts
3. **Goals Page**: Generate meal plans and track progress
4. **Analytics Page**: Review weekly/monthly insights

## Features Breakdown

### 🍽️ Meal Plan Generator
- Uses USDA API for accurate nutrition data
- Generates balanced Indian meal plans
- Matches your macro goals within 10-15% accuracy
- Includes breakfast, lunch, dinner, and snacks
- View detailed recipes for each meal

### 🏋️ Exercise Tracking
- 200+ exercises in database
- Visual icons for each exercise type
- Color-coded muscle group badges
- AI-powered workout recommendations
- Track sets, reps, and weight

### 📊 Analytics
- Daily nutrition trends
- Weekly workout consistency
- Macro distribution charts
- Progress tracking
- Micronutrient analysis

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### API Key Issues
- Ensure `.env.local` exists in root directory
- Check API keys are valid
- Restart dev server after adding keys

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (responsive design)

## Performance Tips

- Use production build (`npm run build`) for better performance
- Enable caching for API responses
- Use dark mode to reduce eye strain

## Contributing

This is a college project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is for educational purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console for error messages (F12 in browser)
3. Ensure all dependencies are installed correctly

## Acknowledgments

- USDA FoodData Central for nutrition data
- Lucide React for beautiful icons
- Next.js team for the amazing framework

---

**Happy Tracking! 💪🏋️‍♂️🥗**
