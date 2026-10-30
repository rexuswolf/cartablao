import { useState } from "react";
import { Language } from "../../data/language";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { GameDeckManager } from "../../services/GameDeckManager";
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
				<button type="button" className={ui.primary} onClick={onClose}>
					Use {currentDeckState.mixedCards.length} cards
				</button>
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
				<ul className={styles.deckList}>
					{visibleDecks.map((deck) => (
						<li key={deck.deckId}>
							<button
								type="button"
								className={`${styles.deckItem} ${deck.isSelected ? styles.selected : ""}`}
								aria-pressed={deck.isSelected}
								onClick={() => handleToggleDeck(deck.deckId)}
							>
								<span className={styles.deckInfo}>
									<span className={styles.deckName}>{deck.name}</span>
									<span className={styles.deckMeta}>
										{deck.language.display}, {deck.cardCount} cards
									</span>
								</span>
								<span className={styles.check} aria-hidden="true">
									{deck.isSelected && <Icon name="check" size={20} />}
								</span>
							</button>
						</li>
					))}
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
