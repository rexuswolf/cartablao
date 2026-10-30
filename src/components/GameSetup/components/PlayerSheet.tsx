import type { Player, Team } from "../../../Game";
import ui from "../../../shared/styles/ui.module.css";
import { useI18n } from "../../../shared/i18n/useI18n";
import { Icon } from "../../Icon/Icon";
import { Sheet } from "../../Sheet/Sheet";
import styles from "../GameSetup.module.css";

interface PlayerSheetProps {
	player: Player;
	teams: Team[];
	onMove: (teamId: string) => void;
	onRemove: () => void;
	onClose: () => void;
}

export function PlayerSheet({
	player,
	teams,
	onMove,
	onRemove,
	onClose,
}: PlayerSheetProps) {
	const { t } = useI18n();
	return (
		<Sheet title={player.name} onClose={onClose}>
			<div className={ui.section}>
				<h3 className={ui.sectionTitle} id="player-team-heading">
					{t.playerSheet.team}
				</h3>
				<ul className={styles.teamChoices} aria-labelledby="player-team-heading">
					{teams.map((team) => {
						const isCurrent = team.id === player.teamId;
						return (
							<li key={team.id}>
								<button
									type="button"
									className={`${styles.teamChoice} ${isCurrent ? styles.teamChoiceCurrent : ""}`}
									aria-pressed={isCurrent}
									onClick={() => {
										if (!isCurrent) onMove(team.id);
										onClose();
									}}
								>
									<span
										className={styles.teamDot}
										style={{ background: team.color }}
										aria-hidden="true"
									/>
									<span className={styles.teamChoiceName}>{team.name}</span>
									<span className={styles.teamChoiceCount}>
										{t.playerSheet.players(team.players.length)}
									</span>
									{isCurrent && <Icon name="check" size={20} />}
								</button>
							</li>
						);
					})}
				</ul>
			</div>
			<button
				type="button"
				className={ui.danger}
				onClick={() => {
					onRemove();
					onClose();
				}}
			>
				<Icon name="trash" size={18} />
				{t.playerSheet.remove(player.name)}
			</button>
		</Sheet>
	);
}
