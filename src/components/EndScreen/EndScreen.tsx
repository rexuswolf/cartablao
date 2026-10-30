import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { Scoreboard } from "../Scoreboard/Scoreboard";

interface EndScreenProps {
	rounds: Round[];
	teams: Team[];
	onPlayAgain: () => void;
}

export function EndScreen({ rounds, teams, onPlayAgain }: EndScreenProps) {
	// A game ended early leaves later rounds unplayed
	const playedRounds = rounds.filter((round) => round.getTurns().length > 0)
		.length;

	return (
		<Scoreboard
			rounds={rounds}
			teams={teams}
			badge={`Game over after ${playedRounds} ${playedRounds === 1 ? "round" : "rounds"}`}
			isFinal
			actionLabel="Play again"
			onAction={onPlayAgain}
		/>
	);
}
