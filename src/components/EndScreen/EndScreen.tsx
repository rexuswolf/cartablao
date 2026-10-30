import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { Scoreboard } from "../Scoreboard/Scoreboard";

interface EndScreenProps {
	rounds: Round[];
	teams: Team[];
	onPlayAgain: () => void;
}

export function EndScreen({ rounds, teams, onPlayAgain }: EndScreenProps) {
	return (
		<Scoreboard
			rounds={rounds}
			teams={teams}
			badge={`Game over after ${rounds.length} ${rounds.length === 1 ? "round" : "rounds"}`}
			isFinal
			actionLabel="Play again"
			onAction={onPlayAgain}
		/>
	);
}
