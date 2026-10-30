# 🎭 Cartablao

A party game for teams in Spanish and English, built with React, TypeScript, and Vite: the same cards come back each round, first described, then with one word, then acted out. Features AI-powered custom deck generation using Google's Gemini API.

The name joins *carta* (card) and *tablao*, the stage where flamenco is performed: each turn, someone draws a card and steps up to perform for their team.

## ✨ Features

- **🎮 Interactive Charades Game**: Swipe cards to mark as correct or skipped
- **🤖 AI-Powered Custom Decks**: Generate custom decks using OpenAI GPT
- **👥 Team Management**: Create and manage teams with custom players
- **⚖️ Team Balancing**: Automatically balance players across teams
- **⚙️ Game Configuration**: Customize round duration, card count, and more
- **📊 Game Statistics**: Track performance and view detailed results
- **🎨 Modern UI**: Beautiful, responsive design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (for custom deck generation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd charades-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Google Gemini API key:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the root directory
   - Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🤖 AI Custom Deck Generation

The game features AI-powered custom deck generation using Google's Gemini model:

### How to Use:
1. Click "Start Game" on the main screen
2. In the Game Configuration screen, click "🤖 Create Custom Deck"
3. Enter a topic or prompt (e.g., "animals", "famous movies", "space exploration")
4. Click "🚀 Generate Deck" to create cards using AI
5. Review the generated cards and click "✅ Use This Deck"

### Example Topics:
- **Animals**: Elephant, Lion, Penguin, etc.
- **Movies**: Star Wars, Titanic, Jurassic Park, etc.
- **Food**: Pizza, Sushi, Hamburger, etc.
- **Sports**: Basketball, Soccer, Tennis, etc.
- **Technology**: Computer, Smartphone, Robot, etc.
- **Custom**: Any topic you can imagine!

### API Configuration:
The AI deck generation uses Google's Gemini Pro model. Make sure to:
- Set your `VITE_GEMINI_API_KEY` environment variable
- Have sufficient API credits in your Google AI account
- The API call generates the specified number of cards per request
- Gemini offers a generous free tier (60 requests/minute)

## 🎮 How to Play

1. **Setup**: Configure game settings and create teams
2. **Team Setup**: Add players to teams or use the balance feature
3. **Gameplay**: Players take turns acting out words/phrases
4. **Scoring**: Track correct and skipped cards for each player
5. **Results**: View detailed statistics and team performance

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── CustomDeckCreator.tsx  # AI deck generation
│   ├── GameConfig.tsx         # Game configuration
│   ├── TeamSetup.tsx          # Team management
│   └── ...
├── services/           # API services
│   └── ai.ts          # Gemini API integration
├── data/              # Static data
└── types.ts           # TypeScript types
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables
- `VITE_GEMINI_API_KEY` - Your Google Gemini API key (required for AI features)

### Game Settings
- **Round Duration**: 15-180 seconds per round
- **Card Count**: 5-50 cards per game
- **Preparation Phase**: Enable/disable preparation time
- **Auto-start**: Automatically start next player

## 📝 License

This project is licensed under the MIT License.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
