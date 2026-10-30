import ui from "../../shared/styles/ui.module.css";
import styles from "./StartScreen.module.css";

interface StartScreenProps {
	onStartGame: () => void;
}

export function StartScreen({ onStartGame }: StartScreenProps) {
	return (
		<div className={`${ui.screen} ${styles.startScreen}`}>
			<div className={styles.hero} aria-hidden="true">
				<span className={`${styles.heroCard} ${styles.heroCardBack}`} />
				<span className={`${styles.heroCard} ${styles.heroCardMiddle}`} />
				<span className={`${styles.heroCard} ${styles.heroCardFront}`}>
					Charades
				</span>
			</div>

			<div className={styles.copy}>
				<h1 className={ui.title}>Act it out. Beat the clock.</h1>
				<p className={ui.subtitle}>
					One player acts, their team guesses. Swipe right when they get it,
					left to skip.
				</p>
			</div>

			<div className={ui.bottomBar}>
				<button type="button" className={ui.primary} onClick={onStartGame}>
					New game
				</button>
			</div>
		</div>
	);
}
