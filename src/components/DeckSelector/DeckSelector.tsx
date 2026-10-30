import { useState } from "react";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import { GameDeckManager } from "../../services/GameDeckManager";
import { useI18n } from "../../shared/i18n/useI18n";
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
	const { language, t } = useI18n();
	// Start from the selection held by App so both stay in sync
	const [deckManager] = useState(() => {
		const manager = new GameDeckManager(language);
		manager.selectOnlyDecks(
			currentDeckState.selectedDecks.map((deck) => deck.deckId),
		);
		return manager;
	});
	const [activeTab, setActiveTab] = useState<TabType>("official");
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

	const visibleDecks = activeTab === "official" ? officialDecks : customDecks;

	const selectedDecks = currentDeckState.selectedDecks;
	const selectedTitles = selectedDecks.map(
		(deck) => splitDeckName(deck.name).title,
	);
	const selectedSummary =
		selectedTitles.length > 2
			? `${selectedTitles.slice(0, 2).join(", ")}${t.common.andMore(selectedTitles.length - 2)}`
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
			title={t.deckSelector.title}
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
								{t.deckSelector.inGame(selectedDecks.length)}
							</span>
						</span>
					</div>
					<button type="button" className={ui.primary} onClick={onClose}>
						{t.deckSelector.useCards(currentDeckState.mixedCards.length)}
					</button>
				</div>
			}
		>
			<div className={styles.tabs} role="group" aria-label={t.deckSelector.source}>
				<button
					type="button"
					className={activeTab === "official" ? ui.chipSelected : ui.chip}
					aria-pressed={activeTab === "official"}
					onClick={() => setActiveTab("official")}
				>
					{t.deckSelector.builtIn(officialDecks.length)}
				</button>
				<button
					type="button"
					className={activeTab === "custom" ? ui.chipSelected : ui.chip}
					aria-pressed={activeTab === "custom"}
					onClick={() => setActiveTab("custom")}
				>
					{t.deckSelector.myDecks(customDecks.length)}
				</button>
			</div>

			{visibleDecks.length > 0 ? (
				<ul className={styles.deckGrid}>
					{visibleDecks.map((deck, index) => {
						const color = getDeckColor(deck.deckId);
						const { symbol, title } = splitDeckName(deck.name);
						// Saved decks keep the language they were written in
						const deckLanguage = deck.language
							? t.deckLanguages[deck.language.code]
							: null;
						const textLanguage =
							deck.language && deck.language.code !== "universal"
								? deck.language.code
								: language;
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
									aria-label={[title, t.common.cards(deck.cardCount), deckLanguage]
										.filter(Boolean)
										.join(", ")}
									onClick={() => handleToggleDeck(deck.deckId)}
								>
									{symbol && (
										<span className={styles.deckSymbol} aria-hidden="true">
											{symbol}
										</span>
									)}
									<span className={styles.deckTitle} lang={textLanguage}>
										{title}
									</span>
									<span
										className={styles.samples}
										aria-hidden="true"
										lang={textLanguage}
									>
										{deckManager.getSampleCards(deck.deckId).map((word, i) => (
											<span key={`${i}-${word}`} className={styles.sample}>
												<span className={styles.sampleText}>{word}</span>
											</span>
										))}
									</span>
									<span className={styles.deckMeta}>
										<span>{t.common.cards(deck.cardCount)}</span>
										{deckLanguage && <span>{deckLanguage}</span>}
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
					<p>{t.deckSelector.noSavedDecks}</p>
					<p>{t.deckSelector.makeOneHint}</p>
				</div>
			)}

			<div className={styles.actions}>
				<button type="button" className={ui.pill} onClick={handleSelectAll}>
					{t.deckSelector.selectAll}
				</button>
				<button type="button" className={ui.pill} onClick={handleDeselectAll}>
					{t.deckSelector.clear}
				</button>
				<button type="button" className={ui.pill} onClick={handleViewCards}>
					{t.deckSelector.preview}
				</button>
			</div>
		</Sheet>
	);
}
