import { useEffect, useState } from "react";
import { GAME_LANGUAGES, type GameLanguage } from "../../data/language";
import {
	getDefaultTeams,
	loadSavedTeams,
	localizeTeamNames,
	saveTeams,
} from "../../data/teams";
import type { GameConfig, Team } from "../../Game";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { getReadableTextColor } from "../../shared/libs/color";
import { useGameConfig } from "../../shared/hooks/useGameConfig";
import { useTeamManager } from "../../shared/hooks/useTeamManager";
import { LANGUAGE_NAMES } from "../../shared/i18n/translations";
import { useI18n } from "../../shared/i18n/useI18n";
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
	onLanguageChange: (language: GameLanguage) => void;
	onShowDeckSelector: () => void;
	onCreateCustomDeck: () => void;
	onShowSavedDecks: () => void;
}

const TILTS = ["-2deg", "1.5deg", "1deg", "-1.5deg"];

export function GameSetup({
	deckState,
	initialConfig,
	onStartGame,
	onLanguageChange,
	onShowDeckSelector,
	onCreateCustomDeck,
	onShowSavedDecks,
}: GameSetupProps) {
	const { language, t } = useI18n();
	const {
		config,
		selectedPreset,
		selectPreset,
		updateConfig,
		getPresetNames,
		isValid,
	} = useGameConfig(initialConfig);
	// Start from the players last used in this browser
	const [savedTeams] = useState(() =>
		localizeTeamNames(loadSavedTeams() ?? getDefaultTeams(language), language),
	);
	const {
		teams,
		setTeams,
		setTeamCount,
		updateTeam,
		addPlayer,
		removePlayer,
		movePlayer,
		balanceTeams,
		totalPlayers,
	} = useTeamManager(savedTeams, language);
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
			: t.setup.decksMixed(deckState.selectedDecks.length);
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

	const handleLanguageChange = (newLanguage: GameLanguage) => {
		if (newLanguage === language) return;
		onLanguageChange(newLanguage);
		setTeams(localizeTeamNames(teams, newLanguage));
	};

	const handleStart = () => {
		if (canStart) onStartGame(config, teamsWithPlayers);
	};

	return (
		<div className={ui.screen}>
			<h1 className={ui.title}>{t.setup.title}</h1>

			<section className={ui.section} aria-labelledby="language-heading">
				<h2 id="language-heading" className={ui.sectionTitle}>
					{t.setup.language}
				</h2>
				<div
					className={styles.languageSwitch}
					role="group"
					aria-labelledby="language-heading"
				>
					{GAME_LANGUAGES.map((option) => (
						<button
							key={option}
							type="button"
							lang={option}
							className={styles.languageOption}
							aria-pressed={language === option}
							onClick={() => handleLanguageChange(option)}
						>
							{LANGUAGE_NAMES[option]}
						</button>
					))}
				</div>
			</section>

			<section className={ui.section} aria-labelledby="deck-heading">
				<h2 id="deck-heading" className={ui.sectionTitle}>
					{t.setup.deck}
				</h2>
				<div className={`${ui.sticker} ${styles.deckSticker}`}>
					<div className={styles.deckThumb} aria-hidden="true">
						<span />
						<span />
					</div>
					<div className={styles.deckInfo}>
						<span className={styles.deckName}>{deckName}</span>
						<span className={styles.deckMeta}>
							{t.setup.cardsInPlay(cardsInPlay, totalCards)}
						</span>
					</div>
					<button
						type="button"
						className={ui.accent}
						onClick={onShowDeckSelector}
					>
						{t.setup.change}
					</button>
				</div>
				<div className={styles.deckActions}>
					<button type="button" className={ui.pill} onClick={onCreateCustomDeck}>
						<Icon name="sparkle" size={18} />
						{t.setup.makeDeck}
					</button>
					<button type="button" className={ui.pill} onClick={onShowSavedDecks}>
						{t.setup.myDecks}
					</button>
				</div>
			</section>

			<section className={ui.section} aria-labelledby="players-heading">
				<div className={styles.sectionHeader}>
					<h2 id="players-heading" className={ui.sectionTitle}>
						{t.setup.players}
					</h2>
					<span className={styles.deckMeta}>
						{t.setup.playersAdded(totalPlayers)}
					</span>
				</div>
				<form className={styles.addPlayerForm} onSubmit={handleAddPlayer}>
					<input
						className={ui.input}
						placeholder={t.setup.addPlayerPlaceholder}
						aria-label={t.setup.playerName}
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
						{t.setup.add}
					</button>
				</form>
				{allPlayers.length > 0 ? (
					<ul className={styles.playerChips}>
						{allPlayers.map(({ player, team }) => (
							<li key={player.id}>
								<button
									type="button"
									className={styles.playerChip}
									aria-label={t.setup.playerChipLabel(player.name, team.name)}
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
					<p className={styles.deckMeta}>{t.setup.noPlayers}</p>
				)}
			</section>

			<section className={ui.section} aria-labelledby="teams-heading">
				<div className={styles.sectionHeader}>
					<h2 id="teams-heading" className={ui.sectionTitle}>
						{t.setup.teams}
					</h2>
					<button
						type="button"
						className={ui.pill}
						onClick={balanceTeams}
						disabled={totalPlayers < 2}
					>
						<Icon name="shuffle" size={18} />
						{t.setup.shuffleTeams}
					</button>
				</div>
				<Stepper
					label={t.setup.numberOfTeams}
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
							aria-label={t.setup.renameTeamLabel(team.name)}
						>
							<span className={styles.teamName}>{team.name}</span>
							<span className={styles.teamPlayers}>
								{team.players.length > 0
									? team.players.map((player) => player.name).join(", ")
									: t.setup.noTeamPlayers}
							</span>
						</button>
					))}
				</div>
				<p className={styles.deckMeta}>
					{t.setup.teamsHint}
				</p>
			</section>

			<section className={ui.section} aria-labelledby="rules-heading">
				<h2 id="rules-heading" className={ui.sectionTitle}>
					{t.setup.rules}
				</h2>
				<div className={ui.chips} role="group" aria-label={t.setup.presets}>
					{getPresetNames().map((name) => (
						<button
							key={name}
							type="button"
							className={selectedPreset === name ? ui.chipSelected : ui.chip}
							aria-pressed={selectedPreset === name}
							onClick={() => selectPreset(name)}
						>
							{t.setup.presetNames[name] ?? name}
						</button>
					))}
				</div>
				<div className={styles.settingsGrid}>
					<Stepper
						label={t.setup.secondsPerTurn}
						value={config.secondsPerRound}
						min={15}
						max={180}
						step={15}
						onChange={(value) => updateConfig("secondsPerRound", value)}
					/>
					<Stepper
						label={t.setup.rounds}
						value={config.numberOfRounds}
						min={1}
						max={10}
						onChange={(value) => updateConfig("numberOfRounds", value)}
					/>
					<Stepper
						label={t.setup.cards}
						value={config.maxCards}
						min={5}
						max={50}
						step={5}
						onChange={(value) => updateConfig("maxCards", value)}
					/>
				</div>
				<label className={`${ui.sticker} ${styles.toggleRow}`}>
					<span className={styles.toggleText}>
						<span className={styles.toggleTitle}>
							{t.setup.pauseBetweenPlayers}
						</span>
						<span className={styles.deckMeta}>{t.setup.pauseHint}</span>
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
					<p className={styles.hint}>{t.setup.needPlayer}</p>
				)}
				<button
					type="button"
					className={ui.primary}
					onClick={handleStart}
					disabled={!canStart}
				>
					{t.setup.play}
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
