import { useState } from "react";
import { Language } from "../../data/language";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { GameDeckManager } from "../../services/GameDeckManager";
import { DeckExplorer } from "../DeckExplorer/DeckExplorer";
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

	const handleSelectDefaultOnly = () => {
		deckManager.selectDefaultDeckOnly();
		onDeckStateChange(deckManager.getState());
	};

	const handleRefresh = () => {
		deckManager.refreshAvailableDecks();
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
	const filteredOfficialDecks =
		languageFilter === "all"
			? officialDecks
			: officialDecks.filter((deck) => deck.language.code === languageFilter);

	const filteredCustomDecks =
		languageFilter === "all"
			? customDecks
			: customDecks.filter((deck) => deck.language.code === languageFilter);

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
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<h2>🎴 Select Decks</h2>
					<button
						type="button"
						className={styles.closeButton}
						onClick={onClose}
					>
						×
					</button>
				</div>

				<div className={styles.content}>
					<div className={styles.summary}>
						<p>
							<strong>{currentDeckState.selectedDecks.length}</strong> deck(s)
							selected
						</p>
						<p>
							<strong>{currentDeckState.mixedCards.length}</strong> total cards
							available
						</p>
					</div>

					<div className={styles.actions}>
						<button
							type="button"
							className={styles.actionButton}
							onClick={handleSelectAll}
						>
							Select All
						</button>
						<button
							type="button"
							className={styles.actionButton}
							onClick={handleDeselectAll}
						>
							Deselect All
						</button>
						<button
							type="button"
							className={styles.actionButton}
							onClick={handleSelectDefaultOnly}
						>
							Default Only
						</button>
						<button
							type="button"
							className={styles.actionButton}
							onClick={handleRefresh}
						>
							Refresh
						</button>
						{currentDeckState.selectedDecks.length > 0 && (
							<button
								type="button"
								className={styles.viewCardsButton}
								onClick={handleViewCards}
							>
								👁️ View Cards
							</button>
						)}
					</div>

					<div className={styles.languageFilter}>
						<label htmlFor="languageFilter">Filter by Language:</label>

						<select
							id="languageFilter"
							value={languageFilter}
							onChange={(e) => setLanguageFilter(e.target.value)}
							className={styles.languageSelect}
						>
							<option value="all">All Languages</option>
							{Language.getAll().map((language) => (
								<option key={language.code} value={language.code}>
									{language.display}
								</option>
							))}
						</select>
					</div>

					<div className={styles.tabs}>
						<button
							type="button"
							className={`${styles.tab} ${
								activeTab === "official" ? styles.activeTab : ""
							}`}
							onClick={() => setActiveTab("official")}
						>
							📚 Official Decks ({filteredOfficialDecks.length})
						</button>
						<button
							type="button"
							className={`${styles.tab} ${
								activeTab === "custom" ? styles.activeTab : ""
							}`}
							onClick={() => setActiveTab("custom")}
						>
							💾 Custom Decks ({filteredCustomDecks.length})
						</button>
					</div>

					<div className={styles.deckList}>
						{activeTab === "official" ? (
							filteredOfficialDecks.length > 0 ? (
								filteredOfficialDecks.map((deck) => (
									<button
										key={deck.deckId}
										type="button"
										className={`${styles.deckItem} ${
											deck.isSelected ? styles.selected : ""
										}`}
										onClick={() => handleToggleDeck(deck.deckId)}
									>
										<div className={styles.deckInfo}>
											<h3>{deck.name}</h3>
											<p className={styles.deckLanguage}>
												{deck.language.display}
											</p>
											<p>{deck.cardCount} cards</p>
										</div>
										<div className={styles.checkbox}>
											{deck.isSelected && <span>✓</span>}
										</div>
									</button>
								))
							) : (
								<div className={styles.emptyState}>
									<p>No official decks available for the selected language</p>
								</div>
							)
						) : filteredCustomDecks.length > 0 ? (
							filteredCustomDecks.map((deck) => (
								<button
									key={deck.deckId}
									type="button"
									className={`${styles.deckItem} ${
										deck.isSelected ? styles.selected : ""
									}`}
									onClick={() => handleToggleDeck(deck.deckId)}
								>
									<div className={styles.deckInfo}>
										<h3>{deck.name}</h3>
										<p className={styles.deckLanguage}>
											{deck.language.display}
										</p>
										<p>{deck.cardCount} cards</p>
									</div>
									<div className={styles.checkbox}>
										{deck.isSelected && <span>✓</span>}
									</div>
								</button>
							))
						) : (
							<div className={styles.emptyState}>
								<p>No custom decks available for the selected language</p>
								<p className={styles.emptyStateHint}>
									Create custom decks in the Custom Deck Creator
								</p>
							</div>
						)}
					</div>

					{currentDeckState.selectedDecks.length > 0 && (
						<div className={styles.selectedSummary}>
							<h3>Selected Decks:</h3>
							<ul>
								{currentDeckState.selectedDecks.map((deck) => (
									<li key={deck.deckId}>
										{deck.name} ({deck.cardCount} cards)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<div className={styles.footer}>
					<button type="button" className={styles.doneButton} onClick={onClose}>
						Done
					</button>
				</div>
			</div>
		</div>
	);
}
