import type { Team } from "../../Game";
import type { Round } from "../../Round";
import { useI18n } from "../../shared/i18n/useI18n";
import { Scoreboard } from "../Scoreboard/Scoreboard";

interface RoundCompleteProps {
	rounds: Round[];
	teams: Team[];
	currentRoundNumber: number;
	totalRounds: number;
	onNextRound: () => void;
	onEndGame: () => void;
}

export function RoundComplete({
	rounds,
	teams,
	currentRoundNumber,
	totalRounds,
	onNextRound,
	onEndGame,
}: RoundCompleteProps) {
	const { t } = useI18n();
	return (
		<Scoreboard
			rounds={rounds}
			teams={teams}
			badge={t.scoreboard.roundDone(currentRoundNumber, totalRounds)}
			isFinal={false}
			actionLabel={t.scoreboard.startRound(currentRoundNumber + 1)}
			onAction={onNextRound}
			secondaryLabel={t.common.endGame}
			onSecondary={onEndGame}
		/>
	);
}
