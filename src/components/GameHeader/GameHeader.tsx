import styles from "./GameHeader.module.css";

interface GameHeaderProps {
	playerName: string;
	teamName: string;
	roundNumber: number;
	totalRounds: number;
	timeLeft: number;
	maxTime: number;
}

export function GameHeader({
	playerName,
	teamName,
	roundNumber,
	totalRounds,
	timeLeft,
	maxTime,
}: GameHeaderProps) {
	const remaining = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;
	const isUrgent = timeLeft <= 10;

	return (
		<header className={styles.gameHeader}>
			<div className={styles.turnInfo}>
				<span className={styles.playerName}>{playerName}'s turn</span>
				<span className={styles.turnMeta}>
					{teamName}, round {roundNumber} of {totalRounds}
				</span>
			</div>
			<div
				role="timer"
				aria-label={`${timeLeft} seconds left`}
				className={`${styles.timer} ${isUrgent ? styles.urgent : ""}`}
			>
				<span
					className={styles.timerRing}
					style={{
						background: `conic-gradient(var(--timer-fill) 0 ${remaining}%, #3a3654 ${remaining}% 100%)`,
					}}
					aria-hidden="true"
				>
					<span className={styles.timerHole} />
				</span>
				<span className={styles.timerValue}>{timeLeft}</span>
			</div>
		</header>
	);
}
