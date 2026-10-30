import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { Scoreboard } from "../Scoreboard/Scoreboard";

interface RoundCompleteProps {
	rounds: Round[];
	teams: Team[];
	currentRoundNumber: number;
	totalRounds: number;
	onNextRound: () => void;
}

export function RoundComplete({
	rounds,
	teams,
	currentRoundNumber,
	totalRounds,
	onNextRound,
}: RoundCompleteProps) {
	return (
		<Scoreboard
			rounds={rounds}
			teams={teams}
			badge={`Round ${currentRoundNumber} of ${totalRounds} done`}
			isFinal={false}
			actionLabel={`Start round ${currentRoundNumber + 1}`}
			onAction={onNextRound}
		/>
	);
}
