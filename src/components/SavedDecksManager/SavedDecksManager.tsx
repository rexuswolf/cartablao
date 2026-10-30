import { useState } from "react";
import { localize } from "../../data/language";
import {
	deleteDeck,
	getDeckCards,
	getSavedDecks,
	renameDeck,
	type SavedDeck,
} from "../../data/savedDecks";
import { useI18n } from "../../shared/i18n/useI18n";
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
	const { language, t } = useI18n();
	const [savedDecks, setSavedDecks] = useState<SavedDeck[]>(() =>
		getSavedDecks(),
	);
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

	const handleStartRename = (deck: SavedDeck) => {
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
				title={t.savedDecks.title}
				onClose={onClose}
				tall
				headerAction={
					<button
						type="button"
						className={ui.pill}
						onClick={() => setShowImportExport(true)}
					>
						{t.savedDecks.importOrExport}
					</button>
				}
			>
				{savedDecks.length === 0 ? (
					<div className={ui.emptyState}>
						<h3 className={ui.sectionTitle}>{t.savedDecks.empty}</h3>
						<p>{t.savedDecks.emptyHint}</p>
						<button
							type="button"
							className={ui.accent}
							onClick={() => setShowImportExport(true)}
						>
							<Icon name="upload" size={18} />
							{t.savedDecks.importDecks}
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
											aria-label={t.savedDecks.deckName}
										/>
										<div className={styles.rowActions}>
											<button
												type="button"
												className={ui.secondary}
												onClick={handleCancelRename}
											>
												{t.common.cancel}
											</button>
											<button
												type="submit"
												className={ui.accent}
												disabled={!editName.trim()}
											>
												{t.savedDecks.saveName}
											</button>
										</div>
									</form>
								) : (
									<>
										<div className={styles.deckHeader}>
											<div className={styles.deckInfo}>
												<h3 className={styles.deckName}>{deck.name}</h3>
												<p className={styles.deckMeta}>
													{t.deckLanguages[deck.language.code]},{" "}
													{t.common.cards(deck.cards.length)}
												</p>
											</div>
											<button
												type="button"
												className={ui.iconButton}
												aria-label={t.savedDecks.renameLabel(deck.name)}
												onClick={() => handleStartRename(deck)}
											>
												<Icon name="edit" size={18} />
											</button>
											<button
												type="button"
												className={ui.iconButton}
												aria-label={t.savedDecks.deleteLabel(deck.name)}
												onClick={() => setConfirmingDeleteId(deck.id)}
											>
												<Icon name="trash" size={18} />
											</button>
										</div>
										<p className={styles.preview}>
											{deck.cards
												.slice(0, 4)
												.map((card) => localize(card.text, language))
												.join(", ")}
											{deck.cards.length > 4 &&
												t.common.andMore(deck.cards.length - 4)}
										</p>
										{confirmingDeleteId === deck.id ? (
											<div className={styles.rowActions}>
												<button
													type="button"
													className={ui.secondary}
													onClick={() => setConfirmingDeleteId(null)}
												>
													{t.savedDecks.keepIt}
												</button>
												<button
													type="button"
													className={ui.danger}
													onClick={() => handleDeleteDeck(deck.id)}
												>
													{t.savedDecks.deleteDeck}
												</button>
											</div>
										) : (
											<button
												type="button"
												className={`${ui.accent} ${ui.block}`}
												onClick={() => handleUseDeck(deck.id)}
											>
												{t.savedDecks.playDeck}
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
