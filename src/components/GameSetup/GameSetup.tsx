import { useEffect, useState } from "react";
import { DEFAULT_TEAMS, loadSavedTeams, saveTeams } from "../../data/teams";
import type { GameConfig, Team } from "../../Game";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { getReadableTextColor } from "../../shared/libs/color";
import { useGameConfig } from "../../shared/hooks/useGameConfig";
import { useTeamManager } from "../../shared/hooks/useTeamManager";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";
import { Stepper } from "../Stepper/Stepper";
import { PlayerSheet } from "./components/PlayerSheet";
import { TeamSheet } from "./components/TeamSheet";
import styles from "./GameSetup.module.css";

interface GameSetupProps {
	deckState: GameDeckManagerState;
	initialConfig?: GameConfig;
	onStartGame: (config: GameConfig, teams: Team[]) => void;
	onShowDeckSelector: () => void;
	onCreateCustomDeck: () => void;
	onShowSavedDecks: () => void;
}

const TILTS = ["-2deg", "1.5deg", "1deg", "-1.5deg"];

export function GameSetup({
	deckState,
	initialConfig,
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
	// Start from the players last used in this browser
	const [savedTeams] = useState(() => loadSavedTeams() ?? DEFAULT_TEAMS);
	const {
		teams,
		setTeamCount,
		updateTeam,
		addPlayer,
		removePlayer,
		movePlayer,
		balanceTeams,
		totalPlayers,
	} = useTeamManager(savedTeams);
	const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
	const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
	const [newPlayerName, setNewPlayerName] = useState("");

	useEffect(() => {
		saveTeams(teams);
	}, [teams]);

	const editingTeam = teams.find((team) => team.id === editingTeamId);
	const allPlayers = teams.flatMap((team) =>
		team.players.map((player) => ({ player, team })),
	);
	const editingPlayer = allPlayers.find(
		({ player }) => player.id === editingPlayerId,
	);
	const teamsWithPlayers = teams.filter((team) => team.players.length > 0);
	const totalCards = deckState.mixedCards.length;
	const cardsInPlay = Math.min(config.maxCards, totalCards);
	const deckName =
		deckState.selectedDecks.length === 1
			? deckState.selectedDecks[0].name
			: `${deckState.selectedDecks.length} decks mixed`;
	const canStart = isValid && teamsWithPlayers.length > 0 && totalCards > 0;

	// New players join the smallest team; shuffle or move them afterwards
	const handleAddPlayer = (event: React.FormEvent) => {
		event.preventDefault();
		const name = newPlayerName.trim();
		if (!name || teams.length === 0) return;
		const smallestTeam = teams.reduce((a, b) =>
			b.players.length < a.players.length ? b : a,
		);
		addPlayer(smallestTeam.id, name);
		setNewPlayerName("");
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

			<section className={ui.section} aria-labelledby="players-heading">
				<div className={styles.sectionHeader}>
					<h2 id="players-heading" className={ui.sectionTitle}>
						Players
					</h2>
					<span className={styles.deckMeta}>{totalPlayers} added</span>
				</div>
				<form className={styles.addPlayerForm} onSubmit={handleAddPlayer}>
					<input
						className={ui.input}
						placeholder="Add a player"
						aria-label="Player name"
						value={newPlayerName}
						onChange={(event) => setNewPlayerName(event.target.value)}
						enterKeyHint="enter"
						autoCapitalize="words"
					/>
					<button
						type="submit"
						className={ui.accent}
						disabled={!newPlayerName.trim()}
					>
						Add
					</button>
				</form>
				{allPlayers.length > 0 ? (
					<ul className={styles.playerChips}>
						{allPlayers.map(({ player, team }) => (
							<li key={player.id}>
								<button
									type="button"
									className={styles.playerChip}
									aria-label={`${player.name}, ${team.name}. Change team or remove`}
									onClick={() => setEditingPlayerId(player.id)}
								>
									<span
										className={styles.teamDot}
										style={{ background: team.color }}
										aria-hidden="true"
									/>
									{player.name}
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className={styles.deckMeta}>Add everyone who's playing.</p>
				)}
			</section>

			<section className={ui.section} aria-labelledby="teams-heading">
				<div className={styles.sectionHeader}>
					<h2 id="teams-heading" className={ui.sectionTitle}>
						Teams
					</h2>
					<button
						type="button"
						className={ui.pill}
						onClick={balanceTeams}
						disabled={totalPlayers < 2}
					>
						<Icon name="shuffle" size={18} />
						Shuffle into teams
					</button>
				</div>
				<Stepper
					label="Number of teams"
					value={teams.length}
					min={1}
					max={10}
					onChange={setTeamCount}
				/>
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
							aria-label={`Rename ${team.name}`}
						>
							<span className={styles.teamName}>{team.name}</span>
							<span className={styles.teamPlayers}>
								{team.players.length > 0
									? team.players.map((player) => player.name).join(", ")
									: "No players yet"}
							</span>
						</button>
					))}
				</div>
				<p className={styles.deckMeta}>
					Tap a player to move them to another team, or a team to rename it.
				</p>
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
					<p className={styles.hint}>Add at least one player</p>
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
					onRename={(name) => updateTeam(editingTeam.id, { name })}
					onClose={() => setEditingTeamId(null)}
				/>
			)}
			{editingPlayer && (
				<PlayerSheet
					key={editingPlayer.player.id}
					player={editingPlayer.player}
					teams={teams}
					onMove={(teamId) => movePlayer(editingPlayer.player.id, teamId)}
					onRemove={() =>
						removePlayer(editingPlayer.team.id, editingPlayer.player.id)
					}
					onClose={() => setEditingPlayerId(null)}
				/>
			)}
		</div>
	);
}
