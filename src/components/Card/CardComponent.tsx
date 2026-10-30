import { useState } from "react";
import { type SwipeEventData, useSwipeable } from "react-swipeable";
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
}

const SWIPE_TRIGGER_THRESHOLD = 150;

export function CardComponent({
	card,
	onSkip,
	onCorrect,
	isSwiping,
	swipeDirection,
	onSwiping,
	onSwiped,
	showActionButtons = true,
}: CardProps) {
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
	});

	const getCardClassName = () => {
		if (!isSwiping) return styles.card;
		if (swipeDirection === "left")
			return `${styles.card} ${styles.cardSwipingLeft}`;
		if (swipeDirection === "right")
			return `${styles.card} ${styles.cardSwipingRight}`;
		return styles.card;
	};

	return (
		<div
			className={`${styles.cardContainer} ${!showActionButtons ? styles.noActionButtons : ""}`}
		>
			<div
				className={getCardClassName()}
				style={{
					transform: `translateX(${swipeX}px) rotate(${swipeX / 15}deg)`,
					transition: isAnimating
						? "transform 0.3s cubic-bezier(.23,1.12,.67,1.01)"
						: "none",
				}}
				{...handlers}
			>
				<div className={styles.cardWord}>{card.word}</div>
				{isSwiping && (
					<div className={styles.swipeOverlay}>
						{swipeDirection === "left" && (
							<span className={`${styles.swipeText} ${styles.swipeTextSkip}`}>
								SKIP
							</span>
						)}
						{swipeDirection === "right" && (
							<span
								className={`${styles.swipeText} ${styles.swipeTextCorrect}`}
							>
								CORRECT
							</span>
						)}
					</div>
				)}
			</div>

			{showActionButtons && (
				<div className={styles.actionButtons}>
					<button
						type="button"
						className={`${styles.actionButton} ${styles.skipButton}`}
						onClick={onSkip}
					>
						← SKIP
					</button>
					<button
						type="button"
						className={`${styles.actionButton} ${styles.correctButton}`}
						onClick={onCorrect}
					>
						CORRECT →
					</button>
				</div>
			)}
		</div>
	);
}
