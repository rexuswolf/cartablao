import { useState } from "react";
import { Language } from "../../data/language";
import { saveDeck } from "../../data/savedDecks";
import { generateDeckWithGemini } from "../../services/ai";
import ui from "../../shared/styles/ui.module.css";
import type { DeckCard } from "../Card/DeckCard";
import { Icon } from "../Icon/Icon";
import { Sheet } from "../Sheet/Sheet";
import { Stepper } from "../Stepper/Stepper";
import styles from "./CustomDeckCreator.module.css";

interface CustomDeckCreatorProps {
	onDeckCreated: (deckId: string) => void;
	onCancel: () => void;
}

type CreatorMode = "ai" | "manual";

export function CustomDeckCreator({
	onDeckCreated,
	onCancel,
}: CustomDeckCreatorProps) {
	const [mode, setMode] = useState<CreatorMode>("ai");

	// AI Generation State
	const [topic, setTopic] = useState("");
	const [cardCount, setCardCount] = useState(30);
	const [language, setLanguage] = useState<Language>(Language.universal());
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCards, setGeneratedCards] = useState<DeckCard[]>([]);
	const [error, setError] = useState("");
	const [saveName, setSaveName] = useState("");
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [apiKey, setApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);

	// Manual Creation State
	const [deckName, setDeckName] = useState("");
	const [manualLanguage, setManualLanguage] = useState<Language>(
		Language.universal(),
	);
	const [wordInput, setWordInput] = useState("");
	const [separator, setSeparator] = useState<"newline" | "comma" | "semicolon">(
		"newline",
	);
	const [manualCards, setManualCards] = useState<DeckCard[]>([]);
	const [manualError, setManualError] = useState("");

	// Remember saved decks so "Save" followed by "Use" doesn't store them twice
	const [savedAiDeckId, setSavedAiDeckId] = useState<string | null>(null);
	const [savedManualDeckId, setSavedManualDeckId] = useState<string | null>(
		null,
	);

	const generateDeck = async () => {
		if (!topic.trim()) {
			setError("Please enter a topic for your deck");
			return;
		}

		setIsGenerating(true);
		setError("");

		try {
			const cards = await generateDeckWithGemini(
				topic,
				apiKey,
				cardCount,
				language,
			);
			setGeneratedCards(cards);
			setSavedAiDeckId(null);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to generate deck. Please try again.";
			setError(errorMessage);
		} finally {
			setIsGenerating(false);
		}
	};

	const saveAiDeck = (name: string) => {
		if (savedAiDeckId) return savedAiDeckId;
		const deck = saveDeck({
			deckCards: generatedCards,
			name,
			language,
		});
		setSavedAiDeckId(deck.id);
		return deck.id;
	};

	const handleUseDeck = () => {
		if (generatedCards.length > 0) {
			// Decks are only playable once stored, so using a deck also saves it
			onDeckCreated(saveAiDeck(saveName.trim() || topic));
		}
	};

	const handleSaveDeck = () => {
		if (generatedCards.length > 0) {
			saveAiDeck(saveName.trim() || topic);
			setShowSuccessMessage(true);
			// Hide success message after 3 seconds
			setTimeout(() => setShowSuccessMessage(false), 3000);
		}
	};

	const regenerateDeck = () => {
		setGeneratedCards([]);
		setSavedAiDeckId(null);
		setError("");
	};

	const handleGenerateClick = () => {
		// Check if API key is available
		const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
		if (!envApiKey && !apiKey) {
			setShowApiKeyInput(true);
			return;
		}
		generateDeck();
	};

	// Manual deck creation functions
	const parseWords = () => {
		if (!wordInput.trim()) {
			setManualError("Please enter some words");
			return;
		}

		if (!deckName.trim()) {
			setManualError("Please enter a deck name");
			return;
		}

		let separatorChar = "\n";
		if (separator === "comma") separatorChar = ",";
		else if (separator === "semicolon") separatorChar = ";";

		const words = wordInput
			.split(separatorChar)
			.map((word) => word.trim())
			.filter((word) => word.length > 0);

		if (words.length === 0) {
			setManualError(
				"No valid words found. Please check your input and separator.",
			);
			return;
		}

		setManualCards(words);
		setSavedManualDeckId(null);
		setManualError("");
	};

	const saveManualDeck = () => {
		if (savedManualDeckId) return savedManualDeckId;
		const deck = saveDeck({
			deckCards: manualCards,
			name: deckName,
			language: manualLanguage,
		});
		setSavedManualDeckId(deck.id);
		return deck.id;
	};

	const handleUseManualDeck = () => {
		if (manualCards.length > 0) {
			// Decks are only playable once stored, so using a deck also saves it
			onDeckCreated(saveManualDeck());
		}
	};

	const handleSaveManualDeck = () => {
		if (manualCards.length > 0) {
			saveManualDeck();
			setShowSuccessMessage(true);
			// Hide success message after 3 seconds
			setTimeout(() => setShowSuccessMessage(false), 3000);
		}
	};

	const clearManualDeck = () => {
		setManualCards([]);
		setSavedManualDeckId(null);
		setWordInput("");
		setDeckName("");
		setManualError("");
	};

	const hasAiCards = generatedCards.length > 0;
	const hasManualCards = manualCards.length > 0;
	const needsApiKey = showApiKeyInput && !apiKey.trim();

	let footer: React.ReactNode;
	if (mode === "ai" && hasAiCards) {
		footer = (
			<>
				<button type="button" className={ui.secondary} onClick={handleSaveDeck}>
					{savedAiDeckId ? "Saved" : "Save"}
				</button>
				<button type="button" className={ui.primary} onClick={handleUseDeck}>
					Play it
				</button>
			</>
		);
	} else if (mode === "ai") {
		footer = (
			<button
				type="button"
				className={ui.primary}
				onClick={handleGenerateClick}
				disabled={isGenerating || !topic.trim() || needsApiKey}
			>
				{isGenerating ? "Making cards..." : "Make cards"}
			</button>
		);
	} else if (hasManualCards) {
		footer = (
			<>
				<button
					type="button"
					className={ui.secondary}
					onClick={handleSaveManualDeck}
				>
					{savedManualDeckId ? "Saved" : "Save"}
				</button>
				<button
					type="button"
					className={ui.primary}
					onClick={handleUseManualDeck}
				>
					Play it
				</button>
			</>
		);
	} else {
		footer = (
			<button
				type="button"
				className={ui.primary}
				onClick={parseWords}
				disabled={!wordInput.trim() || !deckName.trim()}
			>
				Make cards
			</button>
		);
	}

	const languageSelect = (
		id: string,
		value: Language,
		onChange: (language: Language) => void,
	) => (
		<label className={ui.field} htmlFor={id}>
			<span className={ui.label}>Language</span>
			<select
				id={id}
				className={ui.input}
				value={value.code}
				disabled={isGenerating}
				onChange={(e) => {
					const selectedLanguage = Language.fromCode(e.target.value);
					if (selectedLanguage) onChange(selectedLanguage);
				}}
			>
				{Language.getAll().map((lang) => (
					<option key={lang.code} value={lang.code}>
						{lang.display}
					</option>
				))}
			</select>
		</label>
	);

	return (
		<Sheet title="Make a deck" onClose={onCancel} tall footer={footer}>
			<div className={styles.modeSelector} role="group" aria-label="How to make it">
				<button
					type="button"
					className={mode === "ai" ? ui.chipSelected : ui.chip}
					aria-pressed={mode === "ai"}
					onClick={() => setMode("ai")}
				>
					<Icon name="sparkle" size={18} />
					With AI
				</button>
				<button
					type="button"
					className={mode === "manual" ? ui.chipSelected : ui.chip}
					aria-pressed={mode === "manual"}
					onClick={() => setMode("manual")}
				>
					<Icon name="edit" size={18} />
					Type my own
				</button>
			</div>

			{showSuccessMessage && (
				<p className={ui.success} role="status">
					Saved to My decks.
				</p>
			)}

			{mode === "ai" && !hasAiCards && (
				<>
					<label className={ui.field} htmlFor="topic">
						<span className={ui.label}>What should the cards be about?</span>
						<input
							id="topic"
							className={ui.input}
							placeholder="Pixar movies, kitchen tools, 90s pop stars..."
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							disabled={isGenerating}
						/>
					</label>
					<Stepper
						label="Number of cards"
						value={cardCount}
						min={10}
						max={200}
						step={10}
						onChange={setCardCount}
					/>
					{languageSelect("language", language, setLanguage)}

					{showApiKeyInput && (
						<div className={styles.apiKeyBox}>
							<label className={ui.field} htmlFor="apiKey">
								<span className={ui.label}>Gemini API key</span>
								<input
									id="apiKey"
									type="password"
									className={ui.input}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder="Paste your key"
									autoComplete="off"
								/>
							</label>
							<p className={styles.help}>
								Making decks with AI needs a free key from{" "}
								<a
									href="https://aistudio.google.com/app/apikey"
									target="_blank"
									rel="noopener noreferrer"
								>
									Google AI Studio
								</a>
								. Sign in, choose "Create API key" and paste it here.
							</p>
						</div>
					)}

					{isGenerating && (
						<p className={styles.status} role="status">
							Making cards about "{topic}"...
						</p>
					)}
					{error && <p className={ui.error}>{error}</p>}
				</>
			)}

			{mode === "ai" && hasAiCards && (
				<>
					<label className={ui.field} htmlFor="saveName">
						<span className={ui.label}>Deck name</span>
						<input
							id="saveName"
							className={ui.input}
							value={saveName}
							onChange={(e) => setSaveName(e.target.value)}
							placeholder={topic}
							disabled={Boolean(savedAiDeckId)}
						/>
					</label>
					<div className={styles.previewHeader}>
						<h3 className={ui.sectionTitle}>{generatedCards.length} cards</h3>
						<button type="button" className={ui.pill} onClick={regenerateDeck}>
							Start over
						</button>
					</div>
					<ul className={styles.cardsPreview}>
						{generatedCards.map((card, index) => (
							<li key={`${index}-${card}`} className={styles.previewCard}>
								{card}
							</li>
						))}
					</ul>
				</>
			)}

			{mode === "manual" && !hasManualCards && (
				<>
					<label className={ui.field} htmlFor="deckName">
						<span className={ui.label}>Deck name</span>
						<input
							id="deckName"
							className={ui.input}
							placeholder="Family inside jokes"
							value={deckName}
							onChange={(e) => setDeckName(e.target.value)}
						/>
					</label>
					{languageSelect("manualLanguage", manualLanguage, setManualLanguage)}
					<div className={ui.field}>
						<span className={ui.label} id="separator-label">
							Words are separated by
						</span>
						<div className={styles.modeSelector} role="group" aria-labelledby="separator-label">
							{(
								[
									["newline", "New lines"],
									["comma", "Commas"],
									["semicolon", "Semicolons"],
								] as const
							).map(([value, text]) => (
								<button
									key={value}
									type="button"
									className={separator === value ? ui.chipSelected : ui.chip}
									aria-pressed={separator === value}
									onClick={() => setSeparator(value)}
								>
									{text}
								</button>
							))}
						</div>
					</div>
					<label className={ui.field} htmlFor="wordInput">
						<span className={ui.label}>Words</span>
						<textarea
							id="wordInput"
							className={ui.input}
							placeholder={"Dog\nCat\nBird"}
							value={wordInput}
							onChange={(e) => setWordInput(e.target.value)}
							rows={8}
						/>
					</label>
					{manualError && <p className={ui.error}>{manualError}</p>}
				</>
			)}

			{mode === "manual" && hasManualCards && (
				<>
					<div className={styles.previewHeader}>
						<h3 className={ui.sectionTitle}>
							{deckName}: {manualCards.length} cards
						</h3>
						<button type="button" className={ui.pill} onClick={clearManualDeck}>
							Start over
						</button>
					</div>
					<ul className={styles.cardsPreview}>
						{manualCards.map((card, index) => (
							<li key={`${index}-${card}`} className={styles.previewCard}>
								{card}
							</li>
						))}
					</ul>
				</>
			)}
		</Sheet>
	);
}
