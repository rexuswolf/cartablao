import { useState } from "react";
import { type SwipeEventData, useSwipeable } from "react-swipeable";
import { useI18n } from "../../shared/i18n/useI18n";
import { Icon } from "../Icon/Icon";
import styles from "./CardComponent.module.css";
import type { GameCard } from "./GameCard";

interface CardProps {
	card: GameCard;
	onSkip: () => void;
	onCorrect: () => void;
	isSwiping: boolean;
	swipeDirection: "left" | "right" | null;
	onSwiping: (eventData: SwipeEventData) => void;
	onSwiped: () => void;
	showActionButtons?: boolean;
	label?: string;
	cardsLeft?: number;
}

export const SWIPE_TRIGGER_THRESHOLD = 110;

export function CardComponent({
	card,
	onSkip,
	onCorrect,
	isSwiping,
	swipeDirection,
	onSwiping,
	onSwiped,
	showActionButtons = true,
	label,
	cardsLeft,
}: CardProps) {
	const { t } = useI18n();
	const [swipeX, setSwipeX] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const handlers = useSwipeable({
		delta: 0, // start swiping immediately
		onSwiping: (eventData) => {
			setSwipeX(eventData.deltaX);
			onSwiping(eventData);
		},
		onSwiped: (eventData) => {
			const isFarEnough =
				Math.abs(eventData.deltaX) > SWIPE_TRIGGER_THRESHOLD;
			// The parent swaps in the next card right away, so show it centered
			// instead of animating it off screen
			if (eventData.dir === "Left" && isFarEnough) {
				setSwipeX(0);
				onSkip();
				return;
			}
			if (eventData.dir === "Right" && isFarEnough) {
				setSwipeX(0);
				onCorrect();
				return;
			}
			// Not far enough: snap back
			setIsAnimating(true);
			setSwipeX(0);
			onSwiped();
			setTimeout(() => setIsAnimating(false), 300);
		},
		trackMouse: true,
		preventScrollOnSwipe: true,
	});

	const showStamp = showActionButtons && isSwiping && swipeDirection;

	return (
		<div className={styles.cardArea}>
			<div className={styles.stack}>
				<span className={styles.backCard} aria-hidden="true" />
				<span className={styles.middleCard} aria-hidden="true" />
				<div
					key={card.id}
					className={styles.card}
					style={{
						transform: `translateX(${swipeX}px) rotate(${-1.5 + swipeX / 18}deg)`,
						transition: isAnimating
							? "transform 0.3s cubic-bezier(.23,1.12,.67,1.01)"
							: "none",
					}}
					{...handlers}
				>
					{(label || cardsLeft !== undefined) && (
						<div className={styles.cardMeta}>
							<span>{label}</span>
							{cardsLeft !== undefined && <span>{t.game.cardsLeftShort(cardsLeft)}</span>}
						</div>
					)}
					<div className={styles.cardWord} aria-live="polite">
						{card.word}
					</div>
					{showActionButtons && (
						<p className={styles.cardHint}>{t.game.swipeHint}</p>
					)}
					{showStamp && (
						<span
							className={
								swipeDirection === "right"
									? styles.stampCorrect
									: styles.stampSkip
							}
							aria-hidden="true"
						>
							{swipeDirection === "right" ? t.game.gotIt : t.game.skip}
						</span>
					)}
				</div>
			</div>

			{showActionButtons && (
				<div className={styles.actionButtons}>
					<button type="button" className={styles.actionButton} onClick={onSkip}>
						<span className={`${styles.actionCircle} ${styles.skipCircle}`}>
							<Icon name="close" size={34} strokeWidth={2.8} />
						</span>
						{t.game.skip}
					</button>
					<button
						type="button"
						className={styles.actionButton}
						onClick={onCorrect}
					>
						<span className={`${styles.actionCircle} ${styles.correctCircle}`}>
							<Icon name="check" size={38} strokeWidth={3} />
						</span>
						{t.game.gotIt}
					</button>
				</div>
			)}
		</div>
	);
}

