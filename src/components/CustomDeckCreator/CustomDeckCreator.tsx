import { useState } from "react";
import { Language } from "../../data/language";
import { saveDeck } from "../../data/savedDecks";
import { GeminiError, generateDeckWithGemini } from "../../services/ai";
import { useI18n } from "../../shared/i18n/useI18n";
import ui from "../../shared/styles/ui.module.css";
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
	const { language: gameLanguage, t } = useI18n();
	// New decks start in the game's language
	const [initialLanguage] = useState(
		() => Language.fromCode(gameLanguage) ?? Language.universal(),
	);
	const [mode, setMode] = useState<CreatorMode>("ai");

	// AI Generation State
	const [topic, setTopic] = useState("");
	const [cardCount, setCardCount] = useState(30);
	const [language, setLanguage] = useState<Language>(initialLanguage);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedCards, setGeneratedCards] = useState<string[]>([]);
	const [error, setError] = useState("");
	const [saveName, setSaveName] = useState("");
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [apiKey, setApiKey] = useState("");
	const [showApiKeyInput, setShowApiKeyInput] = useState(false);

	// Manual Creation State
	const [deckName, setDeckName] = useState("");
	const [manualLanguage, setManualLanguage] =
		useState<Language>(initialLanguage);
	const [wordInput, setWordInput] = useState("");
	const [separator, setSeparator] = useState<"newline" | "comma" | "semicolon">(
		"newline",
	);
	const [manualCards, setManualCards] = useState<string[]>([]);
	const [manualError, setManualError] = useState("");

	// Remember saved decks so "Save" followed by "Use" doesn't store them twice
	const [savedAiDeckId, setSavedAiDeckId] = useState<string | null>(null);
	const [savedManualDeckId, setSavedManualDeckId] = useState<string | null>(
		null,
	);

	const generateDeck = async () => {
		if (!topic.trim()) {
			setError(t.creator.enterTopic);
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
			// A rejected key is the one failure people can fix themselves
			const isKeyRejected =
				err instanceof GeminiError &&
				(err.status === 400 || err.status === 401 || err.status === 403);
			setError(isKeyRejected ? t.creator.invalidApiKey : t.creator.generateFailed);
		} finally {
			setIsGenerating(false);
		}
	};

	const saveAiDeck = (name: string) => {
		if (savedAiDeckId) return savedAiDeckId;
		const deck = saveDeck({
			words: generatedCards,
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
			setManualError(t.creator.enterWords);
			return;
		}

		if (!deckName.trim()) {
			setManualError(t.creator.enterDeckName);
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
			setManualError(t.creator.noValidWords);
			return;
		}

		setManualCards(words);
		setSavedManualDeckId(null);
		setManualError("");
	};

	const saveManualDeck = () => {
		if (savedManualDeckId) return savedManualDeckId;
		const deck = saveDeck({
			words: manualCards,
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
					{savedAiDeckId ? t.creator.saved : t.common.save}
				</button>
				<button type="button" className={ui.primary} onClick={handleUseDeck}>
					{t.creator.playIt}
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
				{isGenerating ? t.creator.makingCards : t.creator.makeCards}
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
					{savedManualDeckId ? t.creator.saved : t.common.save}
				</button>
				<button
					type="button"
					className={ui.primary}
					onClick={handleUseManualDeck}
				>
					{t.creator.playIt}
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
				{t.creator.makeCards}
			</button>
		);
	}

	const languageSelect = (
		id: string,
		value: Language,
		onChange: (language: Language) => void,
	) => (
		<label className={ui.field} htmlFor={id}>
			<span className={ui.label}>{t.creator.language}</span>
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
						{t.deckLanguages[lang.code]}
					</option>
				))}
			</select>
		</label>
	);

	return (
		<Sheet title={t.creator.title} onClose={onCancel} tall footer={footer}>
			<div
				className={styles.modeSelector}
				role="group"
				aria-label={t.creator.howToMake}
			>
				<button
					type="button"
					className={mode === "ai" ? ui.chipSelected : ui.chip}
					aria-pressed={mode === "ai"}
					onClick={() => setMode("ai")}
				>
					<Icon name="sparkle" size={18} />
					{t.creator.withAi}
				</button>
				<button
					type="button"
					className={mode === "manual" ? ui.chipSelected : ui.chip}
					aria-pressed={mode === "manual"}
					onClick={() => setMode("manual")}
				>
					<Icon name="edit" size={18} />
					{t.creator.typeMyOwn}
				</button>
			</div>

			{showSuccessMessage && (
				<p className={ui.success} role="status">
					{t.creator.savedToMyDecks}
				</p>
			)}

			{mode === "ai" && !hasAiCards && (
				<>
					<label className={ui.field} htmlFor="topic">
						<span className={ui.label}>{t.creator.topic}</span>
						<input
							id="topic"
							className={ui.input}
							placeholder={t.creator.topicPlaceholder}
							value={topic}
							onChange={(e) => setTopic(e.target.value)}
							disabled={isGenerating}
						/>
					</label>
					<Stepper
						label={t.creator.numberOfCards}
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
								<span className={ui.label}>{t.creator.apiKey}</span>
								<input
									id="apiKey"
									type="password"
									className={ui.input}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									placeholder={t.creator.apiKeyPlaceholder}
									autoComplete="off"
								/>
							</label>
							<p className={styles.help}>
								{t.creator.apiKeyHelpBefore}
								<a
									href="https://aistudio.google.com/app/apikey"
									target="_blank"
									rel="noopener noreferrer"
								>
									Google AI Studio
								</a>
								{t.creator.apiKeyHelpAfter}
							</p>
						</div>
					)}

					{isGenerating && (
						<p className={styles.status} role="status">
							{t.creator.makingCardsAbout(topic)}
						</p>
					)}
					{error && <p className={ui.error}>{error}</p>}
				</>
			)}

			{mode === "ai" && hasAiCards && (
				<>
					<label className={ui.field} htmlFor="saveName">
						<span className={ui.label}>{t.creator.deckName}</span>
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
						<h3 className={ui.sectionTitle}>
							{t.common.cards(generatedCards.length)}
						</h3>
						<button type="button" className={ui.pill} onClick={regenerateDeck}>
							{t.creator.startOver}
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
						<span className={ui.label}>{t.creator.deckName}</span>
						<input
							id="deckName"
							className={ui.input}
							placeholder={t.creator.deckNamePlaceholder}
							value={deckName}
							onChange={(e) => setDeckName(e.target.value)}
						/>
					</label>
					{languageSelect("manualLanguage", manualLanguage, setManualLanguage)}
					<div className={ui.field}>
						<span className={ui.label} id="separator-label">
							{t.creator.separatedBy}
						</span>
						<div className={styles.modeSelector} role="group" aria-labelledby="separator-label">
							{(["newline", "comma", "semicolon"] as const).map((value) => (
								<button
									key={value}
									type="button"
									className={separator === value ? ui.chipSelected : ui.chip}
									aria-pressed={separator === value}
									onClick={() => setSeparator(value)}
								>
									{t.creator.separators[value]}
								</button>
							))}
						</div>
					</div>
					<label className={ui.field} htmlFor="wordInput">
						<span className={ui.label}>{t.creator.words}</span>
						<textarea
							id="wordInput"
							className={ui.input}
							placeholder={t.creator.wordsPlaceholder}
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
							{t.creator.namedDeckCards(deckName, manualCards.length)}
						</h3>
						<button type="button" className={ui.pill} onClick={clearManualDeck}>
							{t.creator.startOver}
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
