import { useCallback, useEffect, useState } from "react";
import type { SwipeEventData } from "react-swipeable";
import type { GameConfig, Team } from "../../Game";
import { Game } from "../../Game";
import type { Round } from "../../Round";
import { CardComponent } from "../Card/CardComponent";
import type { GameCard } from "../Card/GameCard";
import { GameHeader } from "../GameHeader/GameHeader";
import { NoCards } from "../NoCards/NoCards";
import { PlayerTurn } from "../PlayerTurn/PlayerTurn";
import { RoundComplete } from "../RoundComplete/RoundComplete";
import styles from "./GameScreen.module.css";

interface GameScreenProps {
	deck: GameCard[];
	teams: Team[];
	config: GameConfig;
	onGameEnd: (rounds: Round[]) => void;
}

type TurnState = "preparing" | "playing";
type SwipeDirection = "left" | "right" | null;

export function GameScreen({
	deck,
	teams,
	config,
	onGameEnd,
}: GameScreenProps) {
	const [game] = useState(() => new Game(config, teams, deck));
	const [timeLeft, setTimeLeft] = useState(config.secondsPerRound);
	const [isTimerRunning, setIsTimerRunning] = useState(
		!config.enablePreparationPhase,
	);
	const [turnState, setTurnState] = useState<TurnState>(
		config.enablePreparationPhase ? "preparing" : "playing",
	);
	const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
	const [isSwiping, setIsSwiping] = useState(false);
	const [showRoundComplete, setShowRoundComplete] = useState(false);
	const [currentCard, setCurrentCard] = useState<GameCard | null>(
		game.getCurrentCard(),
	);

	const currentPlayer = game.getCurrentPlayer();

	// Reset the turn UI for whoever plays next
	const startNextTurnUI = useCallback(() => {
		setTimeLeft(config.secondsPerRound);
		setTurnState(config.enablePreparationPhase ? "preparing" : "playing");
		setIsTimerRunning(!config.enablePreparationPhase);
		setSwipeDirection(null);
		setIsSwiping(false);
		setCurrentCard(game.getCurrentCard());
	}, [game, config]);

	// Close the current turn and move to the next turn, round, or end screen
	const finishTurn = useCallback(
		(remainingTime: number) => {
			game.updateTimeLeft(remainingTime);
			game.endCurrentTurn();

			if (game.isGameFinished()) {
				setIsTimerRunning(false);
				onGameEnd(game.getRounds());
				return;
			}

			if (game.isRoundFinished()) {
				setIsTimerRunning(false);
				setShowRoundComplete(true);
				return;
			}

			startNextTurnUI();
		},
		[game, onGameEnd, startNextTurnUI],
	);

	const handleStartTurn = useCallback(() => {
		setTurnState("playing");
		setIsTimerRunning(true);
	}, []);

	const handleEndTurn = () => {
		finishTurn(timeLeft);
	};

	const handleCardResolved = () => {
		setSwipeDirection(null);
		setIsSwiping(false);

		// The turn ends once the player has gone through every remaining card
		if (game.getCurrentRoundRemainingCards() === 0) {
			finishTurn(timeLeft);
		} else {
			setCurrentCard(game.getCurrentCard());
		}
	};

	const handleSkip = () => {
		if (currentCard && turnState === "playing") {
			game.skipCard();
			handleCardResolved();
		}
	};

	const handleCorrect = () => {
		if (currentCard && turnState === "playing") {
			game.markCardCorrect();
			handleCardResolved();
		}
	};

	const handleNextRound = useCallback(() => {
		game.startNextRound();
		setShowRoundComplete(false);
		startNextTurnUI();
	}, [game, startNextTurnUI]);

	const handleSwiping = useCallback(
		(eventData: SwipeEventData) => {
			if (turnState === "playing") {
				setIsSwiping(true);
				if (eventData.deltaX < -150) {
					setSwipeDirection("left");
				} else if (eventData.deltaX > 150) {
					setSwipeDirection("right");
				} else {
					setSwipeDirection(null);
				}
			}
		},
		[turnState],
	);

	const handleSwiped = useCallback(() => {
		setIsSwiping(false);
		setSwipeDirection(null);
	}, []);

	// Timer logic
	useEffect(() => {
		if (!isTimerRunning || turnState !== "playing") return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => Math.max(prev - 1, 0));
		}, 1000);

		return () => clearInterval(interval);
	}, [isTimerRunning, turnState]);

	// End the turn when time runs out (kept out of the state updater, which must stay pure)
	useEffect(() => {
		if (timeLeft === 0 && isTimerRunning && turnState === "playing") {
			finishTurn(0);
		}
	}, [timeLeft, isTimerRunning, turnState, finishTurn]);

	// Handle a game that has nothing to play (e.g. an empty deck)
	useEffect(() => {
		if (game.isGameFinished()) {
			onGameEnd(game.getRounds());
		}
	}, [game, onGameEnd]);

	// Keep the turn's remaining time up to date
	useEffect(() => {
		game.updateTimeLeft(timeLeft);
	}, [timeLeft, game]);

	const totalRounds = game.getTotalRounds();

	// Show round complete screen if round is finished
	if (showRoundComplete) {
		return (
			<RoundComplete
				rounds={game.getRounds()}
				teams={teams}
				currentRoundNumber={game.getCurrentRoundNumber()}
				totalRounds={totalRounds}
				onNextRound={handleNextRound}
			/>
		);
	}

	return (
		<>
			<GameHeader
				timeLeft={timeLeft}
				cardsLeftToGuess={game.getCurrentRoundRemainingCards()}
				totalCards={game.getTotalCards()}
				maxTime={config.secondsPerRound}
			/>

			{currentPlayer && (
				<PlayerTurn
					currentPlayer={currentPlayer}
					teams={teams}
					roundNumber={game.getCurrentRoundNumber()}
					totalRounds={totalRounds}
					turnState={turnState}
					onStartTurn={handleStartTurn}
				/>
			)}

			{turnState === "preparing" ? (
				<div className={styles.preparationScreen}>
					<div className={styles.preparationCard}>
						<h2>Get Ready!</h2>
						<p>
							It's your turn, <strong>{currentPlayer?.name}</strong>!
						</p>
						<div className={styles.preparationInstructions}>
							<p>• Take a moment to prepare</p>
							<p>• Think about your acting strategy</p>
							<p>• Click "Start Turn" when ready</p>
						</div>
						<button
							type="button"
							className={styles.startTurnButton}
							onClick={handleStartTurn}
						>
							Start Turn
						</button>
					</div>
				</div>
			) : (
				<>
					{currentCard ? (
						<CardComponent
							card={currentCard}
							onSkip={handleSkip}
							onCorrect={handleCorrect}
							isSwiping={isSwiping}
							swipeDirection={swipeDirection}
							onSwiping={handleSwiping}
							onSwiped={handleSwiped}
						/>
					) : (
						<NoCards />
					)}

					{turnState === "playing" && (
						<div className={styles.endTurnContainer}>
							<button
								type="button"
								className={styles.endTurnButton}
								onClick={handleEndTurn}
							>
								End Turn Early
							</button>
						</div>
					)}
				</>
			)}
		</>
	);
}
