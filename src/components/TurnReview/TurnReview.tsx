import type { Team, Turn } from "../../Game";
import type { TeamResult } from "../../services/GameResults";
import { getReadableTextColor } from "../../shared/libs/color";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";
import styles from "./TurnReview.module.css";

interface TurnReviewProps {
	turn: Turn;
	playerName: string;
	team?: Team;
	teamResults: TeamResult[];
	cardsLeft: number;
	roundNumber: number;
	totalRounds: number;
	continueLabel: string;
	onToggleCard: (cardId: number, isCorrect: boolean) => void;
	onContinue: () => void;
	onEndGame: () => void;
}

export function TurnReview({
	turn,
	playerName,
	team,
	teamResults,
	cardsLeft,
	roundNumber,
	totalRounds,
	continueLabel,
	onToggleCard,
	onContinue,
	onEndGame,
}: TurnReviewProps) {
	const cards = [
		...turn.correctCards.map((card) => ({ card, isCorrect: true })),
		...turn.skippedCards.map((card) => ({ card, isCorrect: false })),
	];
	const correctCount = turn.correctCards.length;

	return (
		<div className={`${ui.screen} ${styles.turnReview}`}>
			<div className={styles.header}>
				{team && (
					<span
						className={styles.teamBadge}
						style={{
							background: team.color,
							color: getReadableTextColor(team.color),
						}}
					>
						{team.name}
					</span>
				)}
				<h1 className={ui.title}>
					{playerName} got {correctCount}
				</h1>
				{cards.length > 0 && (
					<p className={ui.subtitle}>Tap a card to fix a mistake.</p>
				)}
			</div>

			{cards.length > 0 ? (
				<ul className={styles.cardList}>
					{cards.map(({ card, isCorrect }) => (
						<li key={card.id}>
							<button
								type="button"
								className={`${styles.cardRow} ${isCorrect ? styles.correct : ""}`}
								aria-pressed={isCorrect}
								aria-label={`${card.word}: ${isCorrect ? "got it" : "skipped"}. Tap to mark as ${isCorrect ? "skipped" : "got it"}.`}
								onClick={() => onToggleCard(card.id, !isCorrect)}
							>
								<span className={styles.word}>{card.word}</span>
								<span className={styles.status} aria-hidden="true">
									<Icon name={isCorrect ? "check" : "close"} size={16} />
									{isCorrect ? "Got it" : "Skipped"}
								</span>
							</button>
						</li>
					))}
				</ul>
			) : (
				<div className={ui.emptyState}>
					<p>No cards were played this turn.</p>
				</div>
			)}

			<section className={ui.section} aria-labelledby="scores-heading">
				<div className={styles.scoresHeader}>
					<h2 id="scores-heading" className={ui.sectionTitle}>
						Scores
					</h2>
					<span className={styles.cardsLeft}>
						{cardsLeft} {cardsLeft === 1 ? "card" : "cards"} left in round{" "}
						{roundNumber} of {totalRounds}
					</span>
				</div>
				<ul className={styles.scores}>
					{teamResults.map((result) => (
						<li key={result.team.id} className={styles.scoreRow}>
							<span
								className={styles.dot}
								style={{ background: result.team.color }}
								aria-hidden="true"
							/>
							<span className={styles.scoreName}>{result.team.name}</span>
							<span className={styles.scoreValue}>{result.totalCorrect}</span>
						</li>
					))}
				</ul>
			</section>

			<div
				className={ui.bottomBar}
				style={{ "--bar-bg": "var(--paper)" } as React.CSSProperties}
			>
				<button type="button" className={ui.primary} onClick={onContinue}>
					{continueLabel}
				</button>
				<button
					type="button"
					className={`${ui.textButton} ${styles.endGame}`}
					onClick={onEndGame}
				>
					End game
				</button>
			</div>
		</div>
	);
}
