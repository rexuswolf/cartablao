import { useState } from "react";
import type { Deck } from "../../data/Decks/Deck";
import {
	deleteDeck,
	getDeckCards,
	getSavedDecks,
	renameDeck,
} from "../../data/savedDecks";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";
import { ImportExportDialog } from "../ImportExportDialog/ImportExportDialog";
import { Sheet } from "../Sheet/Sheet";
import styles from "./SavedDecksManager.module.css";

interface SavedDecksManagerProps {
	onDeckSelected: (deckId: string) => void;
	onClose: () => void;
}

export function SavedDecksManager({
	onDeckSelected,
	onClose,
}: SavedDecksManagerProps) {
	const [savedDecks, setSavedDecks] = useState<Deck[]>(() => getSavedDecks());
	const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
		null,
	);
	const [showImportExport, setShowImportExport] = useState(false);

	const handleUseDeck = (deckId: string) => {
		if (getDeckCards(deckId)) {
			onDeckSelected(deckId);
			onClose();
		}
	};

	const handleDeleteDeck = (deckId: string) => {
		if (deleteDeck(deckId)) {
			setSavedDecks(getSavedDecks());
		}
		setConfirmingDeleteId(null);
	};

	const handleStartRename = (deck: Deck) => {
		setEditingDeckId(deck.id);
		setEditName(deck.name);
	};

	const handleSaveRename = (deckId: string) => {
		if (renameDeck(deckId, editName.trim())) {
			setSavedDecks(getSavedDecks());
		}
		setEditingDeckId(null);
		setEditName("");
	};

	const handleCancelRename = () => {
		setEditingDeckId(null);
		setEditName("");
	};

	const handleImportSuccess = () => {
		setSavedDecks(getSavedDecks());
	};

	return (
		<>
			<Sheet
				title="My decks"
				onClose={onClose}
				tall
				headerAction={
					<button
						type="button"
						className={ui.pill}
						onClick={() => setShowImportExport(true)}
					>
						Import or export
					</button>
				}
			>
				{savedDecks.length === 0 ? (
					<div className={ui.emptyState}>
						<h3 className={ui.sectionTitle}>No saved decks yet</h3>
						<p>Decks you make or import show up here.</p>
						<button
							type="button"
							className={ui.accent}
							onClick={() => setShowImportExport(true)}
						>
							<Icon name="upload" size={18} />
							Import decks
						</button>
					</div>
				) : (
					<ul className={styles.decksList}>
						{savedDecks.map((deck) => (
							<li key={deck.id} className={styles.savedDeckItem}>
								{editingDeckId === deck.id ? (
									<form
										className={styles.renameForm}
										onSubmit={(event) => {
											event.preventDefault();
											if (editName.trim()) handleSaveRename(deck.id);
										}}
									>
										<input
											className={ui.input}
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											aria-label="Deck name"
										/>
										<div className={styles.rowActions}>
											<button
												type="button"
												className={ui.secondary}
												onClick={handleCancelRename}
											>
												Cancel
											</button>
											<button
												type="submit"
												className={ui.accent}
												disabled={!editName.trim()}
											>
												Save name
											</button>
										</div>
									</form>
								) : (
									<>
										<div className={styles.deckHeader}>
											<div className={styles.deckInfo}>
												<h3 className={styles.deckName}>{deck.name}</h3>
												<p className={styles.deckMeta}>
													{deck.language.display}, {deck.cards.length} cards
												</p>
											</div>
											<button
												type="button"
												className={ui.iconButton}
												aria-label={`Rename ${deck.name}`}
												onClick={() => handleStartRename(deck)}
											>
												<Icon name="edit" size={18} />
											</button>
											<button
												type="button"
												className={ui.iconButton}
												aria-label={`Delete ${deck.name}`}
												onClick={() => setConfirmingDeleteId(deck.id)}
											>
												<Icon name="trash" size={18} />
											</button>
										</div>
										<p className={styles.preview}>
											{deck.cards.slice(0, 4).join(", ")}
											{deck.cards.length > 4 &&
												` and ${deck.cards.length - 4} more`}
										</p>
										{confirmingDeleteId === deck.id ? (
											<div className={styles.rowActions}>
												<button
													type="button"
													className={ui.secondary}
													onClick={() => setConfirmingDeleteId(null)}
												>
													Keep it
												</button>
												<button
													type="button"
													className={ui.danger}
													onClick={() => handleDeleteDeck(deck.id)}
												>
													Delete deck
												</button>
											</div>
										) : (
											<button
												type="button"
												className={`${ui.accent} ${ui.block}`}
												onClick={() => handleUseDeck(deck.id)}
											>
												Play this deck
											</button>
										)}
									</>
								)}
							</li>
						))}
					</ul>
				)}
			</Sheet>

			{showImportExport && (
				<ImportExportDialog
					onClose={() => setShowImportExport(false)}
					onImportSuccess={handleImportSuccess}
				/>
			)}
		</>
	);
}
