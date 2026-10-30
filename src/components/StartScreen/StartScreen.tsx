import { useI18n } from "../../shared/i18n/useI18n";
import ui from "../../shared/styles/ui.module.css";
import styles from "./StartScreen.module.css";

interface StartScreenProps {
	onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
	const { t } = useI18n();
	return (
		<div className={`${ui.screen} ${styles.startScreen}`}>
			<div className={styles.hero} aria-hidden="true">
				<span className={`${styles.heroCard} ${styles.heroCardBack}`} />
				<span className={`${styles.heroCard} ${styles.heroCardMiddle}`} />
				<span className={`${styles.heroCard} ${styles.heroCardFront}`}>
					{t.start.heroCard}
				</span>
			</div>

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
