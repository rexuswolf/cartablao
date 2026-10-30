import type { Team, Turn } from "../../Game";
import type { TeamResult } from "../../services/GameResults";
import { getReadableTextColor } from "../../shared/libs/color";
import { useI18n } from "../../shared/i18n/useI18n";
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
	const { t } = useI18n();
	// Listed in the order they were played, so fixing a card doesn't move it
	const playOrder = (cardId: number) => turn.playedCardIds.indexOf(cardId);
	const cards = [
		...turn.correctCards.map((card) => ({ card, isCorrect: true })),
		...turn.skippedCards.map((card) => ({ card, isCorrect: false })),
	].sort((a, b) => playOrder(a.card.id) - playOrder(b.card.id));
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
					{t.review.playerGot(playerName, correctCount)}
				</h1>
				{cards.length > 0 && (
					<p className={ui.subtitle}>{t.review.fixHint}</p>
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
								aria-label={t.review.cardLabel(card.word, isCorrect)}
								onClick={() => onToggleCard(card.id, !isCorrect)}
							>
								<span className={styles.word}>{card.word}</span>
								<span className={styles.status} aria-hidden="true">
									<Icon name={isCorrect ? "check" : "close"} size={16} />
									{isCorrect ? t.review.gotIt : t.review.skipped}
								</span>
							</button>
						</li>
					))}
				</ul>
			) : (
				<div className={ui.emptyState}>
					<p>{t.review.noCards}</p>
				</div>
			)}

			<section className={ui.section} aria-labelledby="scores-heading">
				<div className={styles.scoresHeader}>
					<h2 id="scores-heading" className={ui.sectionTitle}>
						{t.review.scores}
					</h2>
					<span className={styles.cardsLeft}>
						{t.review.cardsLeftInRound(cardsLeft, roundNumber, totalRounds)}
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
					{t.common.endGame}
				</button>
			</div>
		</div>
	);
}
