import { useCallback, useEffect, useState } from "react";
import type { SwipeEventData } from "react-swipeable";
import type { GameConfig, Team } from "../../Game";
import { Game } from "../../Game";
import type { Round } from "../../Round";
import { getGameResults } from "../../services/GameResults";
import { useBackHandler } from "../../shared/hooks/useBackHandler";
import { useI18n } from "../../shared/i18n/useI18n";
import { getReadableTextColor } from "../../shared/libs/color";
import ui from "../../shared/styles/ui.module.css";
import { CardComponent, SWIPE_TRIGGER_THRESHOLD } from "../Card/CardComponent";
import type { GameCard } from "../Card/GameCard";
import { ConfirmSheet } from "../ConfirmSheet/ConfirmSheet";
import { GameHeader } from "../GameHeader/GameHeader";
import { MainLayout } from "../MainLayout/MainLayout";
import { NoCards } from "../NoCards/NoCards";
import { RoundComplete } from "../RoundComplete/RoundComplete";
import { TurnReview } from "../TurnReview/TurnReview";
import styles from "./GameScreen.module.css";

interface GameScreenProps {
	deck: GameCard[];
	teams: Team[];
	config: GameConfig;
	onGameEnd: (rounds: Round[]) => void;
}

type TurnState = "preparing" | "playing" | "review";
type SwipeDirection = "left" | "right" | null;

export function GameScreen({
	deck,
	teams,
	config,
	onGameEnd,
}: GameScreenProps) {
	const { t } = useI18n();
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
	const [showEndConfirm, setShowEndConfirm] = useState(false);
	const [currentCard, setCurrentCard] = useState<GameCard | null>(
		game.getCurrentCard(),
	);
	// Bumped after corrections, which change the game without changing any state here
	const [, setRevision] = useState(0);

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

	// Close the current turn and show its review, where mistakes can be fixed
	const finishTurn = useCallback(
		(remainingTime: number) => {
			game.updateTimeLeft(remainingTime);
			game.endCurrentTurn();
			setIsTimerRunning(false);
			setSwipeDirection(null);
			setIsSwiping(false);
			setTurnState("review");
		},
		[game],
	);

	// After the review, move on to the next turn, the round results, or the end screen
	const handleContinueAfterReview = () => {
		if (game.isGameFinished()) {
			onGameEnd(game.getRounds());
			return;
		}
		if (game.isRoundFinished()) {
			setShowRoundComplete(true);
			return;
		}
		game.startNewTurn();
		startNextTurnUI();
	};

	const handleToggleCard = (cardId: number, isCorrect: boolean) => {
		game.setLastTurnCardResult(cardId, isCorrect);
		setRevision((revision) => revision + 1);
	};

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

	// Ending early asks first; the clock pauses while the question is open
	const requestEndGame = () => {
		setIsTimerRunning(false);
		setShowEndConfirm(true);
	};

	const cancelEndGame = () => {
		setShowEndConfirm(false);
		if (turnState === "playing" && !showRoundComplete) setIsTimerRunning(true);
	};

	const confirmEndGame = () => {
		// Keep the cards guessed so far in a turn that's still running
		if (turnState === "playing" && !showRoundComplete) {
			game.updateTimeLeft(timeLeft);
			game.endCurrentTurn();
		}
		onGameEnd(game.getRounds());
	};

	// Back during a game asks to end it instead of leaving the app
	useBackHandler(true, () => {
		if (!showEndConfirm) requestEndGame();
		return false;
	});

	const handleSwiping = useCallback(
		(eventData: SwipeEventData) => {
			if (turnState === "playing") {
				setIsSwiping(true);
				if (eventData.deltaX < -SWIPE_TRIGGER_THRESHOLD) {
					setSwipeDirection("left");
				} else if (eventData.deltaX > SWIPE_TRIGGER_THRESHOLD) {
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
	const roundNumber = game.getCurrentRoundNumber();
	const cardsLeft = game.getCurrentRoundRemainingCards();
	const currentTeam = teams.find((team) => team.id === currentPlayer?.teamId);
	const teamColor = currentTeam?.color ?? "#ffd23f";
	const textColor = getReadableTextColor(teamColor);

	const endConfirm = showEndConfirm && (
		<ConfirmSheet
			title={t.game.endConfirmTitle}
			message={t.game.endConfirmMessage}
			confirmLabel={t.common.endGame}
			cancelLabel={t.game.keepPlaying}
			onConfirm={confirmEndGame}
			onCancel={cancelEndGame}
		/>
	);

	// Show round complete screen if round is finished
	if (showRoundComplete) {
		return (
			<MainLayout background="var(--paper)">
				<RoundComplete
					rounds={game.getRounds()}
					teams={teams}
					currentRoundNumber={roundNumber}
					totalRounds={totalRounds}
					onNextRound={handleNextRound}
					onEndGame={requestEndGame}
				/>
				{endConfirm}
			</MainLayout>
		);
	}

	const lastTurn = game.getLastTurn();
	if (turnState === "review" && lastTurn) {
		const lastPlayer = teams
			.flatMap((team) => team.players)
			.find((player) => player.id === lastTurn.playerId);
		let continueLabel = t.game.nextPlayer(
			currentPlayer?.name ?? t.game.nextPlayerFallback,
		);
		if (game.isGameFinished()) continueLabel = t.game.seeFinalScores;
		else if (game.isRoundFinished())
			continueLabel = t.game.seeRoundResults(roundNumber);

		return (
			<MainLayout background="var(--paper)">
				<TurnReview
					turn={lastTurn}
					playerName={lastPlayer?.name ?? ""}
					team={teams.find((team) => team.id === lastTurn.teamId)}
					teamResults={getGameResults(game.getRounds(), teams).teamResults}
					cardsLeft={cardsLeft}
					roundNumber={roundNumber}
					totalRounds={totalRounds}
					continueLabel={continueLabel}
					onToggleCard={handleToggleCard}
					onContinue={handleContinueAfterReview}
					onEndGame={requestEndGame}
				/>
				{endConfirm}
			</MainLayout>
		);
	}

	return (
		<MainLayout background={teamColor}>
			<div
				className={`${ui.screen} ${styles.gameScreen}`}
				style={{ color: textColor }}
			>
				{turnState === "preparing" ? (
					<div className={styles.preparation}>
						<div className={styles.preparationText}>
							<p className={styles.preparationLead}>{t.game.passPhoneTo}</p>
							<h1 className={styles.preparationName}>{currentPlayer?.name}</h1>
							<p className={styles.preparationMeta}>
								{t.game.preparationMeta(
									currentTeam?.name ?? "",
									roundNumber,
									totalRounds,
									cardsLeft,
								)}
							</p>
						</div>
						<p className={styles.preparationTip}>
							{t.game.preparationTip(currentPlayer?.name ?? "")}
						</p>
						<div className={styles.bottomActions}>
							<button
								type="button"
								className={ui.primary}
								onClick={handleStartTurn}
							>
								{t.game.startTurn}
							</button>
							<button
								type="button"
								className={`${ui.textButton} ${styles.endTurn}`}
								onClick={requestEndGame}
							>
								{t.common.endGame}
							</button>
						</div>
					</div>
				) : (
					<>
						<GameHeader
							playerName={currentPlayer?.name ?? ""}
							teamName={currentTeam?.name ?? ""}
							roundNumber={roundNumber}
							totalRounds={totalRounds}
							timeLeft={timeLeft}
							maxTime={config.secondsPerRound}
						/>

						{currentCard ? (
							<CardComponent
								card={currentCard}
								onSkip={handleSkip}
								onCorrect={handleCorrect}
								isSwiping={isSwiping}
								swipeDirection={swipeDirection}
								onSwiping={handleSwiping}
								onSwiped={handleSwiped}
								cardsLeft={cardsLeft}
							/>
						) : (
							<NoCards />
						)}

						<button
							type="button"
							className={`${ui.textButton} ${styles.endTurn}`}
							onClick={handleEndTurn}
						>
							{t.game.endTurnEarly}
						</button>
					</>
				)}
			</div>
			{endConfirm}
		</MainLayout>
	);
}
