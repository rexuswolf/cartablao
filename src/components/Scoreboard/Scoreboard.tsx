import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { getGameResults } from "../../services/GameResults";
import { getReadableTextColor } from "../../shared/libs/color";
import ui from "../../shared/styles/ui.module.css";
import styles from "./Scoreboard.module.css";

interface ScoreboardProps {
	rounds: Round[];
	teams: Team[];
	badge: string;
	isFinal: boolean;
	actionLabel: string;
	onAction: () => void;
}

export function Scoreboard({
	rounds,
	teams,
	badge,
	isFinal,
	actionLabel,
	onAction,
}: ScoreboardProps) {
	const { teamResults, playerResults, leaderScore } = getGameResults(
		rounds,
		teams,
	);
	const leaders = teamResults.filter(
		(result) => leaderScore > 0 && result.totalCorrect === leaderScore,
	);
	// Bars are relative to the best score so the leader always fills most of the track
	const barScale = Math.max(leaderScore, 1);
	const topPlayers = playerResults.filter((result) => result.correct > 0);

	let headline: string;
	if (leaders.length === 0) headline = "No points yet";
	else if (leaders.length > 1) headline = "It's a tie!";
	else if (isFinal) headline = `${leaders[0].team.name} wins!`;
	else headline = `${leaders[0].team.name} is ahead`;

	return (
		<div className={`${ui.screen} ${styles.scoreboard}`}>
			<div className={styles.header}>
				<span className={styles.badge}>{badge}</span>
				<h1 className={ui.title}>{headline}</h1>
			</div>

			<ol className={styles.teamList}>
				{teamResults.map((result) => (
					<li key={result.team.id} className={styles.teamRow}>
						<div className={styles.teamLabel}>
							<span className={styles.teamName}>{result.team.name}</span>
							<span className={styles.skipped}>
								{result.totalSkipped} skipped
							</span>
						</div>
						<div className={styles.track}>
							<div
								className={styles.bar}
								style={{
									width: `${18 + (result.totalCorrect / barScale) * 82}%`,
									background: result.team.color,
									color: getReadableTextColor(result.team.color),
								}}
							>
								<span className={styles.score}>{result.totalCorrect}</span>
							</div>
						</div>
					</li>
				))}
			</ol>

			{topPlayers.length > 0 && (
				<section className={ui.section} aria-labelledby="players-heading">
					<h2 id="players-heading" className={ui.sectionTitle}>
						Top guessers
					</h2>
					<ul className={styles.playerChips}>
						{topPlayers.map((result) => (
							<li key={result.player.id} className={styles.playerChip}>
								<span
									className={styles.playerScore}
									style={{
										background: result.team.color,
										color: getReadableTextColor(result.team.color),
									}}
								>
									{result.correct}
								</span>
								{result.player.name}
							</li>
						))}
					</ul>
				</section>
			)}

			<div className={ui.bottomBar} style={{ "--bar-bg": "var(--paper)" } as React.CSSProperties}>
				<button type="button" className={ui.primary} onClick={onAction}>
					{actionLabel}
				</button>
			</div>
		</div>
	);
}
