import { useRef, useState } from "react";
import { useExport } from "../../shared/hooks/useExport";
import { useImport } from "../../shared/hooks/useImport";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";
import { Sheet } from "../Sheet/Sheet";
import styles from "./ImportExportDialog.module.css";

interface ImportExportDialogProps {
	onClose: () => void;
	onImportSuccess?: () => void;
}

export function ImportExportDialog({
	onClose,
	onImportSuccess,
}: ImportExportDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileError, setFileError] = useState("");
	const {
		isExporting,
		exportMessage,
		exportSuccess,
		handleExport,
		clearExportMessage,
		hasExportMessage,
	} = useExport();

	const {
		isImporting,
		importMessage,
		importSuccess,
		handleImport,
		clearImportMessage,
		validateFile,
		hasImportMessage,
	} = useImport();

	const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const validation = validateFile(file);
		if (!validation.isValid) {
			setFileError(validation.error ?? "This file can't be imported.");
			return;
		}
		setFileError("");

		handleImport(file).then((result) => {
			if (result.success && onImportSuccess) {
				onImportSuccess();
			}
		});

		// Clear the file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleClose = () => {
		clearExportMessage();
		clearImportMessage();
		onClose();
	};

	return (
		<Sheet title="Import or export" onClose={handleClose}>
			<section className={ui.section}>
				<h3 className={ui.sectionTitle}>Export</h3>
				<p className={styles.description}>
					Save all your decks to a file to back them up or share them with
					friends.
				</p>
				<button
					type="button"
					className={ui.secondary}
					onClick={handleExport}
					disabled={isExporting}
				>
					<Icon name="download" size={18} />
					{isExporting ? "Exporting..." : "Export all decks"}
				</button>
				{hasExportMessage && (
					<p className={exportSuccess ? ui.success : ui.error}>{exportMessage}</p>
				)}
			</section>

			<section className={ui.section}>
				<h3 className={ui.sectionTitle}>Import</h3>
				<p className={styles.description}>
					Add decks from an exported .json file (up to 10 MB). Decks with a
					name you already use get a number added.
				</p>
				<label className={`${ui.accent} ${styles.fileButton}`}>
					<Icon name="upload" size={18} />
					{isImporting ? "Importing..." : "Choose a file"}
					<input
						ref={fileInputRef}
						type="file"
						accept=".json,application/json"
						onChange={handleImportFile}
						className={styles.fileInput}
						disabled={isImporting}
					/>
				</label>
				{fileError && <p className={ui.error}>{fileError}</p>}
				{hasImportMessage && (
					<p className={importSuccess ? ui.success : ui.error}>
						{importMessage}
					</p>
				)}
			</section>
		</Sheet>
	);
}
