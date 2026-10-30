import type { GameLanguage } from "../../data/language";
import { useI18n } from "../../shared/i18n/useI18n";
import ui from "../../shared/styles/ui.module.css";
import { LanguageButton } from "../LanguageButton/LanguageButton";
import styles from "./StartScreen.module.css";

interface StartScreenProps {
	onStartGame: () => void;
	onLanguageChange: (language: GameLanguage) => void;
}

export function StartScreen({
	onStartGame,
	onLanguageChange,
}: StartScreenProps) {
	const { t } = useI18n();
	return (
		<div className={`${ui.screen} ${styles.startScreen}`}>
			<div className={styles.topBar}>
				<span className={styles.brand}>
					<img src="/favicon.svg" alt="" width={36} height={36} />
					Cartablao
				</span>
				<LanguageButton onChange={onLanguageChange} />
			</div>

			{/* One card per round, dealt in the order they are played */}
			<ol className={styles.hand} aria-hidden="true">
				{t.start.rounds.map((round, index) => (
					<li key={round} className={styles.roundCard}>
						<span className={styles.roundNumber}>{index + 1}</span>
						<span className={styles.roundName}>{round}</span>
					</li>
				))}
			</ol>

			<div className={styles.copy}>
				<h1 className={ui.title}>{t.start.title}</h1>
				<p className={ui.subtitle}>{t.start.subtitle}</p>
			</div>

			<div className={ui.bottomBar}>
				<button type="button" className={ui.primary} onClick={onStartGame}>
					{t.start.newGame}
				</button>
			</div>
		</div>
	);
}
