import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { useI18n } from "../../shared/i18n/useI18n";
import { Scoreboard } from "../Scoreboard/Scoreboard";

interface EndScreenProps {
	rounds: Round[];
	teams: Team[];
	onPlayAgain: () => void;
}

export function EndScreen({ rounds, teams, onPlayAgain }: EndScreenProps) {
	const { t } = useI18n();
	// A game ended early leaves later rounds unplayed
	const playedRounds = rounds.filter((round) => round.getTurns().length > 0)
		.length;

	return (
		<Scoreboard
			rounds={rounds}
			teams={teams}
			badge={t.scoreboard.gameOver(playedRounds)}
			isFinal
			actionLabel={t.scoreboard.playAgain}
			onAction={onPlayAgain}
		/>
	);
}
