import { useState } from "react";
import { SAMPLE_TEAMS } from "../../data/teams";
import type { GameConfig, Team } from "../../Game";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { getReadableTextColor } from "../../shared/libs/color";
import { useGameConfig } from "../../shared/hooks/useGameConfig";
import { useTeamManager } from "../../shared/hooks/useTeamManager";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";
import { Stepper } from "../Stepper/Stepper";
import { TeamSheet } from "./components/TeamSheet";
import styles from "./GameSetup.module.css";

interface GameSetupProps {
	deckState: GameDeckManagerState;
	initialConfig?: GameConfig;
	initialTeams?: Team[];
	onStartGame: (config: GameConfig, teams: Team[]) => void;
	onShowDeckSelector: () => void;
	onCreateCustomDeck: () => void;
	onShowSavedDecks: () => void;
}

const TILTS = ["-2deg", "1.5deg", "1deg", "-1.5deg"];

export function GameSetup({
	deckState,
	initialConfig,
	initialTeams,
	onStartGame,
	onShowDeckSelector,
	onCreateCustomDeck,
	onShowSavedDecks,
}: GameSetupProps) {
	const {
		config,
		selectedPreset,
		selectPreset,
		updateConfig,
		getPresetNames,
		isValid,
	} = useGameConfig(initialConfig);
	const {
		teams,
		addTeam,
		removeTeam,
		updateTeam,
		addPlayer,
		removePlayer,
		balanceTeams,
		totalPlayers,
	} = useTeamManager(initialTeams ?? SAMPLE_TEAMS);
	const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

	const editingTeam = teams.find((team) => team.id === editingTeamId);
	const teamsWithPlayers = teams.filter((team) => team.players.length > 0);
	const totalCards = deckState.mixedCards.length;
	const cardsInPlay = Math.min(config.maxCards, totalCards);
	const deckName =
		deckState.selectedDecks.length === 1
			? deckState.selectedDecks[0].name
			: `${deckState.selectedDecks.length} decks mixed`;
	const canStart = isValid && teamsWithPlayers.length > 0 && totalCards > 0;

	const handleAddTeam = () => {
		const team = addTeam(`Team ${teams.length + 1}`);
		if (team) setEditingTeamId(team.id);
	};

	const handleStart = () => {
		if (canStart) onStartGame(config, teamsWithPlayers);
	};

	return (
		<div className={ui.screen}>
			<h1 className={ui.title}>Who's playing?</h1>

			<section className={ui.section} aria-labelledby="deck-heading">
				<h2 id="deck-heading" className={ui.sectionTitle}>
					Deck
				</h2>
				<div className={`${ui.sticker} ${styles.deckSticker}`}>
					<div className={styles.deckThumb} aria-hidden="true">
						<span />
						<span />
					</div>
					<div className={styles.deckInfo}>
						<span className={styles.deckName}>{deckName}</span>
						<span className={styles.deckMeta}>
							{cardsInPlay} of {totalCards} cards
						</span>
					</div>
					<button
						type="button"
						className={ui.accent}
						onClick={onShowDeckSelector}
					>
						Change
					</button>
				</div>
				<div className={styles.deckActions}>
					<button type="button" className={ui.pill} onClick={onCreateCustomDeck}>
						<Icon name="sparkle" size={18} />
						Make a deck
					</button>
					<button type="button" className={ui.pill} onClick={onShowSavedDecks}>
						My decks
					</button>
				</div>
			</section>

			<section className={ui.section} aria-labelledby="teams-heading">
				<div className={styles.sectionHeader}>
					<h2 id="teams-heading" className={ui.sectionTitle}>
						Teams
					</h2>
					{teams.length > 1 && totalPlayers > 1 && (
						<button type="button" className={ui.pill} onClick={balanceTeams}>
							<Icon name="shuffle" size={18} />
							Shuffle players
						</button>
					)}
				</div>
				<div className={styles.teamGrid}>
					{teams.map((team, index) => (
						<button
							key={team.id}
							type="button"
							className={styles.teamSticker}
							style={{
								background: team.color,
								color: getReadableTextColor(team.color),
								rotate: TILTS[index % TILTS.length],
							}}
							onClick={() => setEditingTeamId(team.id)}
							aria-label={`Edit ${team.name}, ${team.players.length} players`}
						>
							<span className={styles.teamName}>{team.name}</span>
							<span className={styles.teamPlayers}>
								{team.players.length > 0
									? team.players.map((player) => player.name).join(", ")
									: "Tap to add players"}
							</span>
						</button>
					))}
					<button
						type="button"
						className={styles.addTeam}
						onClick={handleAddTeam}
					>
						<Icon name="plus" size={26} />
						Add team
					</button>
				</div>
			</section>

			<section className={ui.section} aria-labelledby="rules-heading">
				<h2 id="rules-heading" className={ui.sectionTitle}>
					Rules
				</h2>
				<div className={ui.chips} role="group" aria-label="Presets">
					{getPresetNames().map((name) => (
						<button
							key={name}
							type="button"
							className={selectedPreset === name ? ui.chipSelected : ui.chip}
							aria-pressed={selectedPreset === name}
							onClick={() => selectPreset(name)}
						>
							{name.charAt(0).toUpperCase() + name.slice(1)}
						</button>
					))}
				</div>
				<div className={styles.settingsGrid}>
					<Stepper
						label="Seconds per turn"
						value={config.secondsPerRound}
						min={15}
						max={180}
						step={15}
						onChange={(value) => updateConfig("secondsPerRound", value)}
					/>
					<Stepper
						label="Rounds"
						value={config.numberOfRounds}
						min={1}
						max={10}
						onChange={(value) => updateConfig("numberOfRounds", value)}
					/>
					<Stepper
						label="Cards"
						value={config.maxCards}
						min={5}
						max={50}
						step={5}
						onChange={(value) => updateConfig("maxCards", value)}
					/>
				</div>
				<label className={`${ui.sticker} ${styles.toggleRow}`}>
					<span className={styles.toggleText}>
						<span className={styles.toggleTitle}>Pause between players</span>
						<span className={styles.deckMeta}>
							Pass the phone, then tap to start the turn
						</span>
					</span>
					<input
						type="checkbox"
						role="switch"
						className={styles.switch}
						checked={config.enablePreparationPhase}
						onChange={(event) =>
							updateConfig("enablePreparationPhase", event.target.checked)
						}
					/>
				</label>
			</section>

			<div className={ui.bottomBar}>
				{!canStart && (
					<p className={styles.hint}>Add a player to at least one team</p>
				)}
				<button
					type="button"
					className={ui.primary}
					onClick={handleStart}
					disabled={!canStart}
				>
					Let's play
				</button>
			</div>

			{editingTeam && (
				<TeamSheet
					key={editingTeam.id}
					team={editingTeam}
					canRemove={teams.length > 1}
					onRename={(name) => updateTeam(editingTeam.id, { name })}
					onAddPlayer={(name) => addPlayer(editingTeam.id, name)}
					onRemovePlayer={(playerId) => removePlayer(editingTeam.id, playerId)}
					onRemoveTeam={() => removeTeam(editingTeam.id)}
					onClose={() => setEditingTeamId(null)}
				/>
			)}
		</div>
	);
}
