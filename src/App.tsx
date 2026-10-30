import { useCallback, useEffect, useState } from "react";
import type { GameCard } from "./components/Card/GameCard";
import { CustomDeckCreator } from "./components/CustomDeckCreator/CustomDeckCreator";
import { DeckSelector } from "./components/DeckSelector/DeckSelector";
import { EndScreen } from "./components/EndScreen/EndScreen";
import { GameConfigScreen } from "./components/GameConfig/GameConfig";
import { GameScreen } from "./components/GameScreen/GameScreen";
import { MainLayout } from "./components/MainLayout/MainLayout";
import { SavedDecksManager } from "./components/SavedDecksManager/SavedDecksManager";
import { StartScreen } from "./components/StartScreen/StartScreen";
import { TeamSetup } from "./components/TeamSetup/TeamSetup";
import { migrateSavedDecks } from "./data/savedDecks";
import type { GameConfig, GameState, Team } from "./Game";
import type { Round } from "./Round";
import type { GameDeckManagerState } from "./services/GameDeckManager";
import { GameDeckManager } from "./services/GameDeckManager";

function App() {
	// Initialize deck manager
	const [deckManager] = useState(() => new GameDeckManager());
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
		setGameState("config");
	}, []);

	const handleConfigComplete = useCallback((config: GameConfig) => {
		setGameConfig(config);
		setGameState("team-setup");
	}, []);

	const handleTeamSetup = useCallback(
		(teams: Team[]) => {
			if (!gameConfig) return;
			setSelectedTeams(teams);
			// Limit the deck based on config
			setGameDeck(deckState.mixedCards.slice(0, gameConfig.maxCards));
			setGameState("playing");
		},
		[gameConfig, deckState.mixedCards],
	);

	const handleGameEnd = useCallback((rounds: Round[]) => {
		setGameRounds(rounds);
		setGameState("finished");
	}, []);

	const handlePlayAgain = useCallback(() => {
		setGameState("idle");
		setGameConfig(null);
		setSelectedTeams([]);
		setGameRounds([]);
		deckManager.resetToDefault();
		setDeckState(deckManager.getState());
		setShowDeckCreator(false);
		setShowSavedDecks(false);
		setShowDeckSelector(false);
		setGameDeck([]);
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

	const handleDeckStateChange = useCallback(
		(newDeckState: GameDeckManagerState) => {
			setDeckState(newDeckState);
		},
		[],
	);

	if (gameState === "idle") {
		return (
			<MainLayout>
				<StartScreen onStartGame={startGame} />
			</MainLayout>
		);
	}

	if (gameState === "config") {
		return (
			<>
				<MainLayout>
					<GameConfigScreen
						currentDeck={deckState.mixedCards}
						onStartGame={handleConfigComplete}
						onCreateCustomDeck={() => setShowDeckCreator(true)}
						onShowSavedDecks={() => setShowSavedDecks(true)}
						onShowDeckSelector={() => setShowDeckSelector(true)}
					/>
				</MainLayout>
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
			</>
		);
	}

	if (gameState === "team-setup") {
		return (
			<MainLayout>
				<TeamSetup onStartGame={handleTeamSetup} />
			</MainLayout>
		);
	}

	if (gameState === "playing" && gameConfig) {
		return (
			<MainLayout>
				<GameScreen
					deck={gameDeck}
					teams={selectedTeams}
					config={gameConfig}
					onGameEnd={handleGameEnd}
				/>
			</MainLayout>
		);
	}

	if (gameState === "finished") {
		return (
			<MainLayout>
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
