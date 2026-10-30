import { useState } from "react";
import { GAME_LANGUAGES, type GameLanguage } from "../../data/language";
import { LANGUAGE_FLAGS, LANGUAGE_NAMES } from "../../shared/i18n/translations";
import { useI18n } from "../../shared/i18n/useI18n";
import { Icon } from "../Icon/Icon";
import { Sheet } from "../Sheet/Sheet";
import styles from "./LanguageButton.module.css";

interface LanguageButtonProps {
	onChange: (language: GameLanguage) => void;
}

// Shows the game's language as a flag; tapping it opens the choice of languages
export function LanguageButton({ onChange }: LanguageButtonProps) {
	const { language, t } = useI18n();
	const [isOpen, setIsOpen] = useState(false);

	const choose = (option: GameLanguage) => {
		if (option !== language) onChange(option);
		setIsOpen(false);
	};

	return (
		<>
			<button
				type="button"
				className={styles.flagButton}
				aria-label={t.language.button(LANGUAGE_NAMES[language])}
				onClick={() => setIsOpen(true)}
			>
				<span aria-hidden="true">{LANGUAGE_FLAGS[language]}</span>
			</button>
			{isOpen && (
				<Sheet title={t.language.title} onClose={() => setIsOpen(false)}>
					<ul className={styles.options}>
						{GAME_LANGUAGES.map((option) => {
							const isCurrent = option === language;
							return (
								<li key={option}>
									<button
										type="button"
										lang={option}
										className={`${styles.option} ${isCurrent ? styles.current : ""}`}
										aria-pressed={isCurrent}
										onClick={() => choose(option)}
									>
										<span className={styles.optionFlag} aria-hidden="true">
											{LANGUAGE_FLAGS[option]}
										</span>
										<span className={styles.optionName}>
											{LANGUAGE_NAMES[option]}
										</span>
										{isCurrent && <Icon name="check" size={20} />}
									</button>
								</li>
							);
						})}
					</ul>
				</Sheet>
			)}
		</>
	);
}
