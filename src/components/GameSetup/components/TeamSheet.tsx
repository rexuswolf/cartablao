import { useState } from "react";
import type { Team } from "../../../Game";
import ui from "../../../shared/styles/ui.module.css";
import { Icon } from "../../Icon/Icon";
import { Sheet } from "../../Sheet/Sheet";
import styles from "../GameSetup.module.css";

interface TeamSheetProps {
	team: Team;
	canRemove: boolean;
	onRename: (name: string) => void;
	onAddPlayer: (name: string) => void;
	onRemovePlayer: (playerId: string) => void;
	onRemoveTeam: () => void;
	onClose: () => void;
}

export function TeamSheet({
	team,
	canRemove,
	onRename,
	onAddPlayer,
	onRemovePlayer,
	onRemoveTeam,
	onClose,
}: TeamSheetProps) {
	const [teamName, setTeamName] = useState(team.name);
	const [playerName, setPlayerName] = useState("");

	const handleAddPlayer = (event: React.FormEvent) => {
		event.preventDefault();
		if (!playerName.trim()) return;
		onAddPlayer(playerName.trim());
		setPlayerName("");
	};

	return (
		<Sheet
			title="Edit team"
			onClose={onClose}
			footer={
				<button type="button" className={ui.primary} onClick={onClose}>
					Done
				</button>
			}
		>
			<label className={ui.field}>
				<span className={ui.label}>Team name</span>
				<input
					className={ui.input}
					value={teamName}
					onChange={(event) => setTeamName(event.target.value)}
					onBlur={() => {
						if (teamName.trim()) onRename(teamName.trim());
						else setTeamName(team.name);
					}}
				/>
			</label>

			<div className={ui.section}>
				<h3 className={ui.sectionTitle}>
					Players ({team.players.length})
				</h3>
				{team.players.length === 0 ? (
					<p className={ui.subtitle}>Add at least one player to this team.</p>
				) : (
					<ul className={styles.playerList}>
						{team.players.map((player) => (
							<li key={player.id} className={styles.playerRow}>
								<span>{player.name}</span>
								<button
									type="button"
									className={ui.iconButton}
									aria-label={`Remove ${player.name}`}
									onClick={() => onRemovePlayer(player.id)}
								>
									<Icon name="close" size={18} />
								</button>
							</li>
						))}
					</ul>
				)}
				<form className={styles.addPlayerForm} onSubmit={handleAddPlayer}>
					<input
						className={ui.input}
						placeholder="Player name"
						aria-label="New player name"
						value={playerName}
						onChange={(event) => setPlayerName(event.target.value)}
						enterKeyHint="done"
					/>
					<button
						type="submit"
						className={ui.accent}
						disabled={!playerName.trim()}
					>
						Add
					</button>
				</form>
			</div>

			{canRemove && (
				<button
					type="button"
					className={ui.danger}
					onClick={() => {
						onRemoveTeam();
						onClose();
					}}
				>
					<Icon name="trash" size={18} />
					Remove team
				</button>
			)}
		</Sheet>
	);
}
