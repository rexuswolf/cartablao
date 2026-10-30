import { useState } from "react";
import { Language } from "../../data/language";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { GameDeckManager } from "../../services/GameDeckManager";
import { getReadableTextColor } from "../../shared/libs/color";
import { getDeckColor, splitDeckName } from "../../shared/libs/deckStyle";
import ui from "../../shared/styles/ui.module.css";
import { DeckExplorer } from "../DeckExplorer/DeckExplorer";
import { Icon } from "../Icon/Icon";
import { Sheet } from "../Sheet/Sheet";
import styles from "./DeckSelector.module.css";

interface DeckSelectorProps {
	currentDeckState: GameDeckManagerState;
	onDeckStateChange: (newState: GameDeckManagerState) => void;
	onClose: () => void;
}

type TabType = "official" | "custom";

export function DeckSelector({
	currentDeckState,
	onDeckStateChange,
	onClose,
}: DeckSelectorProps) {
	// Start from the selection held by App so both stay in sync
	const [deckManager] = useState(() => {
		const manager = new GameDeckManager();
		manager.selectOnlyDecks(
			currentDeckState.selectedDecks.map((deck) => deck.deckId),
		);
		return manager;
	});
	const [activeTab, setActiveTab] = useState<TabType>("official");
	const [languageFilter, setLanguageFilter] = useState<string>("all");
	const [showDeckExplorer, setShowDeckExplorer] = useState(false);

	const handleToggleDeck = (deckId: string) => {
		deckManager.toggleDeckSelection(deckId);
		onDeckStateChange(deckManager.getState());
	};

	const handleSelectAll = () => {
		deckManager.selectAllDecks();
		onDeckStateChange(deckManager.getState());
	};

	const handleDeselectAll = () => {
		deckManager.deselectAllDecks();
		onDeckStateChange(deckManager.getState());
	};

	const handleViewCards = () => {
		setShowDeckExplorer(true);
	};

	const handleDeckExplorerClose = () => {
		setShowDeckExplorer(false);
	};

	const officialDecks = deckManager.getOfficialDecks();
	const customDecks = deckManager.getCustomDecks();

	// Filter decks by language
	const filterByLanguage = (decks: typeof officialDecks) =>
		languageFilter === "all"
			? decks
			: decks.filter((deck) => deck.language.code === languageFilter);
	const filteredOfficialDecks = filterByLanguage(officialDecks);
	const filteredCustomDecks = filterByLanguage(customDecks);
	const visibleDecks =
		activeTab === "official" ? filteredOfficialDecks : filteredCustomDecks;

	const selectedDecks = currentDeckState.selectedDecks;
	const selectedTitles = selectedDecks.map(
		(deck) => splitDeckName(deck.name).title,
	);
	const selectedSummary =
		selectedTitles.length > 2
			? `${selectedTitles.slice(0, 2).join(", ")} and ${selectedTitles.length - 2} more`
			: selectedTitles.join(", ");

	if (showDeckExplorer) {
		return (
			<DeckExplorer
				cards={currentDeckState.mixedCards}
				currentDeckState={currentDeckState}
				onDeckStateChange={onDeckStateChange}
				onClose={handleDeckExplorerClose}
			/>
		);
	}

	return (
		<Sheet
			title="Choose decks"
			onClose={onClose}
			tall
			footer={
				<div className={styles.footer}>
					<div className={styles.inGame}>
						<span className={styles.miniStack} aria-hidden="true">
							{selectedDecks.slice(0, 3).map((deck, i) => (
								<span
									key={deck.deckId}
									className={styles.miniCard}
									style={{
										background: getDeckColor(deck.deckId),
										left: `${i * 16}px`,
										rotate: `${(i - 1) * 7}deg`,
									}}
								/>
							))}
						</span>
						<span className={styles.inGameText}>
							<span className={styles.inGameNames}>{selectedSummary}</span>
							<span className={styles.inGameCount}>
								{selectedDecks.length}{" "}
								{selectedDecks.length === 1 ? "deck" : "decks"} in the game
							</span>
						</span>
					</div>
					<button type="button" className={ui.primary} onClick={onClose}>
						Use {currentDeckState.mixedCards.length} cards
					</button>
				</div>
			}
		>
			<div className={styles.tabs} role="group" aria-label="Deck source">
				<button
					type="button"
					className={activeTab === "official" ? ui.chipSelected : ui.chip}
					aria-pressed={activeTab === "official"}
					onClick={() => setActiveTab("official")}
				>
					Built-in ({filteredOfficialDecks.length})
				</button>
				<button
					type="button"
					className={activeTab === "custom" ? ui.chipSelected : ui.chip}
					aria-pressed={activeTab === "custom"}
					onClick={() => setActiveTab("custom")}
				>
					My decks ({filteredCustomDecks.length})
				</button>
			</div>

			<div className={ui.chips} role="group" aria-label="Language">
				<button
					type="button"
					className={languageFilter === "all" ? ui.chipSelected : ui.chip}
					aria-pressed={languageFilter === "all"}
					onClick={() => setLanguageFilter("all")}
				>
					All languages
				</button>
				{Language.getAll().map((language) => (
					<button
						key={language.code}
						type="button"
						className={
							languageFilter === language.code ? ui.chipSelected : ui.chip
						}
						aria-pressed={languageFilter === language.code}
						onClick={() => setLanguageFilter(language.code)}
					>
						{language.display}
					</button>
				))}
			</div>

			{visibleDecks.length > 0 ? (
				<ul className={styles.deckGrid}>
					{visibleDecks.map((deck, index) => {
						const color = getDeckColor(deck.deckId);
						const { symbol, title } = splitDeckName(deck.name);
						return (
							<li key={deck.deckId} className={styles.deckCell}>
								<button
									type="button"
									className={`${styles.deckCard} ${deck.isSelected ? styles.selected : ""}`}
									style={{
										background: color,
										color: getReadableTextColor(color),
										rotate: deck.isSelected
											? index % 2 === 0
												? "-2deg"
												: "2deg"
											: undefined,
									}}
									aria-pressed={deck.isSelected}
									aria-label={`${title}, ${deck.cardCount} cards, ${deck.language.display}`}
									onClick={() => handleToggleDeck(deck.deckId)}
								>
									{symbol && (
										<span className={styles.deckSymbol} aria-hidden="true">
											{symbol}
										</span>
									)}
									<span className={styles.deckTitle} lang={deck.language.code === "es" ? "es" : "en"}>
										{title}
									</span>
									<span className={styles.samples} aria-hidden="true">
										{deckManager.getSampleCards(deck.deckId).map((word, i) => (
											<span key={`${i}-${word}`} className={styles.sample}>
												<span className={styles.sampleText}>{word}</span>
											</span>
										))}
									</span>
									<span className={styles.deckMeta}>
										<span>{deck.cardCount} cards</span>
										<span>{deck.language.display}</span>
									</span>
									{deck.isSelected && (
										<span className={styles.check} aria-hidden="true">
											<Icon name="check" size={18} strokeWidth={3} />
										</span>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			) : (
				<div className={ui.emptyState}>
					<p>No decks in this language yet.</p>
					{activeTab === "custom" && (
						<p>Make one with "Make a deck" on the setup screen.</p>
					)}
				</div>
			)}

			<div className={styles.actions}>
				<button type="button" className={ui.pill} onClick={handleSelectAll}>
					Select all
				</button>
				<button type="button" className={ui.pill} onClick={handleDeselectAll}>
					Clear
				</button>
				<button type="button" className={ui.pill} onClick={handleViewCards}>
					Preview cards
				</button>
			</div>
		</Sheet>
	);
}
