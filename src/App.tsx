import { useCallback, useEffect, useState } from "react";
import type { GameCard } from "./components/Card/GameCard";
import { CustomDeckCreator } from "./components/CustomDeckCreator/CustomDeckCreator";
import { DeckSelector } from "./components/DeckSelector/DeckSelector";
import { EndScreen } from "./components/EndScreen/EndScreen";
import { GameScreen } from "./components/GameScreen/GameScreen";
import { GameSetup } from "./components/GameSetup/GameSetup";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { SavedDecksManager } from "./components/SavedDecksManager/SavedDecksManager";
import { StartScreen } from "./components/StartScreen/StartScreen";
import type { GameLanguage } from "./data/language";
import { migrateSavedDecks } from "./data/savedDecks";
import type { GameConfig, GameState, Team } from "./Game";
import type { Round } from "./Round";
import type { GameDeckManagerState } from "./services/GameDeckManager";
import { GameDeckManager } from "./services/GameDeckManager";
import { useBackHandler } from "./shared/hooks/useBackHandler";
import { useI18n } from "./shared/i18n/useI18n";

function App() {
	const { language, setLanguage } = useI18n();
	// Initialize deck manager
	const [deckManager] = useState(() => new GameDeckManager(language));
	const [deckState, setDeckState] = useState<GameDeckManagerState>(() =>
		deckManager.getState(),
	);

	// Run migration on app start
	useEffect(() => {
		migrateSavedDecks();
	}, []);

	const [gameState, setGameState] = useState<GameState>("idle");
	const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
	const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
	const [gameRounds, setGameRounds] = useState<Round[]>([]);
	const [showDeckCreator, setShowDeckCreator] = useState(false);
	const [showSavedDecks, setShowSavedDecks] = useState(false);
	const [showDeckSelector, setShowDeckSelector] = useState(false);
	const [gameDeck, setGameDeck] = useState<GameCard[]>([]);

	const startGame = useCallback(() => {
		setGameState("setup");
	}, []);

	const handleSetupComplete = useCallback(
		(config: GameConfig, teams: Team[]) => {
			setGameConfig(config);
			setSelectedTeams(teams);
			// Limit the deck based on config
			setGameDeck(deckState.mixedCards.slice(0, config.maxCards));
			setGameState("playing");
		},
		[deckState.mixedCards],
	);

	const handleGameEnd = useCallback((rounds: Round[]) => {
		setGameRounds(rounds);
		setGameState("finished");
	}, []);

	// Back to setup with the same rules and decks (teams come from saved storage); reshuffle for new cards
	const handlePlayAgain = useCallback(() => {
		setGameRounds([]);
		setGameDeck([]);
		deckManager.refreshAvailableDecks();
		setDeckState(deckManager.getState());
		setGameState("setup");
	}, [deckManager]);

	// Play only the deck that was just created or loaded
	const selectSingleDeck = useCallback(
		(deckId: string) => {
			deckManager.refreshAvailableDecks();
			deckManager.selectOnlyDecks([deckId]);
			setDeckState(deckManager.getState());
		},
		[deckManager],
	);

	const handleDeckCreated = useCallback(
		(deckId: string) => {
			selectSingleDeck(deckId);
			setShowDeckCreator(false);
		},
		[selectSingleDeck],
	);

	const handleDeckCreatorCancel = useCallback(() => {
		// The creator may have saved decks, so make them available for selection
		deckManager.refreshAvailableDecks();
		setDeckState(deckManager.getState());
		setShowDeckCreator(false);
	}, [deckManager]);

	const handleSavedDeckSelected = useCallback(
		(deckId: string) => {
			selectSingleDeck(deckId);
			setShowSavedDecks(false);
		},
		[selectSingleDeck],
	);

	const handleSavedDecksClose = useCallback(() => {
		// Decks may have been imported, renamed or deleted while the manager was open
		deckManager.refreshAvailableDecks();
		setDeckState(deckManager.getState());
		setShowSavedDecks(false);
	}, [deckManager]);

	const handleDeckSelectorClose = useCallback(() => {
		setShowDeckSelector(false);
	}, []);

	// Deck names and cards follow the game's language
	const handleLanguageChange = useCallback(
		(newLanguage: GameLanguage) => {
			setLanguage(newLanguage);
			deckManager.setLanguage(newLanguage);
			setDeckState(deckManager.getState());
		},
		[deckManager, setLanguage],
	);

	const handleDeckStateChange = useCallback(
		(newDeckState: GameDeckManagerState) => {
			setDeckState(newDeckState);
		},
		[],
	);

	// The phone's back gesture steps back through the app instead of leaving it
	useBackHandler(gameState === "setup", () => setGameState("idle"));
	useBackHandler(gameState === "finished", handlePlayAgain);

	if (gameState === "idle") {
		return (
			<MainLayout>
				<StartScreen onStartGame={startGame} />
			</MainLayout>
		);
	}

	if (gameState === "setup") {
		return (
			<MainLayout>
				<GameSetup
					deckState={deckState}
					initialConfig={gameConfig ?? undefined}
					onStartGame={handleSetupComplete}
					onLanguageChange={handleLanguageChange}
					onCreateCustomDeck={() => setShowDeckCreator(true)}
					onShowSavedDecks={() => setShowSavedDecks(true)}
					onShowDeckSelector={() => setShowDeckSelector(true)}
				/>
				{showDeckCreator && (
					<CustomDeckCreator
						onDeckCreated={handleDeckCreated}
						onCancel={handleDeckCreatorCancel}
					/>
				)}
				{showSavedDecks && (
					<SavedDecksManager
						onDeckSelected={handleSavedDeckSelected}
						onClose={handleSavedDecksClose}
					/>
				)}
				{showDeckSelector && (
					<DeckSelector
						currentDeckState={deckState}
						onDeckStateChange={handleDeckStateChange}
						onClose={handleDeckSelectorClose}
					/>
				)}
			</MainLayout>
		);
	}

	if (gameState === "playing" && gameConfig) {
		return (
			<GameScreen
				deck={gameDeck}
				teams={selectedTeams}
				config={gameConfig}
				onGameEnd={handleGameEnd}
			/>
		);
	}

	if (gameState === "finished") {
		return (
			<MainLayout background="var(--paper)">
				<EndScreen
					rounds={gameRounds}
					teams={selectedTeams}
					onPlayAgain={handlePlayAgain}
				/>
			</MainLayout>
		);
	}

	return null;
}

export default App;
