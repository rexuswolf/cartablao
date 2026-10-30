import { useCallback, useState } from "react";
import type { SwipeEventData } from "react-swipeable";
import type { GameDeckManagerState } from "../../services/GameDeckManager";
import ui from "../../shared/styles/ui.module.css";
import { CardComponent } from "../Card/CardComponent";
import type { GameCard } from "../Card/GameCard";
import { DeckSelector } from "../DeckSelector/DeckSelector";
import { Icon } from "../Icon/Icon";
import { Sheet } from "../Sheet/Sheet";
import styles from "./DeckExplorer.module.css";

interface DeckExplorerProps {
	cards: GameCard[];
	currentDeckState: GameDeckManagerState;
	onDeckStateChange: (newState: GameDeckManagerState) => void;
	onClose: () => void;
}

export function DeckExplorer({
	cards,
	currentDeckState,
	onDeckStateChange,
	onClose,
}: DeckExplorerProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isSwiping, setIsSwiping] = useState(false);
	const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
		null,
	);
	const [showDeckSelector, setShowDeckSelector] = useState(false);

	const currentCard = cards[currentIndex];
	const totalCards = cards.length;

	const handlePrevious = useCallback(() => {
		setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
	}, [totalCards]);

	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
	}, [totalCards]);

	const handleSkip = useCallback(() => {
		handleNext();
	}, [handleNext]);

	const handleCorrect = useCallback(() => {
		handleNext();
	}, [handleNext]);

	const handleSwiping = useCallback((eventData: SwipeEventData) => {
		setIsSwiping(true);
		if (eventData.deltaX < -50) {
			setSwipeDirection("left");
		} else if (eventData.deltaX > 50) {
			setSwipeDirection("right");
		} else {
			setSwipeDirection(null);
		}
	}, []);

	const handleSwiped = useCallback(() => {
		setIsSwiping(false);
		setSwipeDirection(null);
	}, []);

	const handleDeckSelectorClose = useCallback(() => {
		setShowDeckSelector(false);
	}, []);

	const handleDeckStateChange = useCallback(
		(newDeckState: GameDeckManagerState) => {
			onDeckStateChange(newDeckState);
			setCurrentIndex(0); // Reset to first card when deck changes
		},
		[onDeckStateChange],
	);

	if (showDeckSelector) {
		return (
			<DeckSelector
				currentDeckState={currentDeckState}
				onDeckStateChange={handleDeckStateChange}
				onClose={handleDeckSelectorClose}
			/>
		);
	}

	if (cards.length === 0) {
		return (
			<Sheet title="Preview cards" onClose={onClose}>
				<div className={ui.emptyState}>
					<p>No cards to preview. Pick at least one deck first.</p>
					<button
						type="button"
						className={ui.accent}
						onClick={() => setShowDeckSelector(true)}
					>
						Choose decks
					</button>
				</div>
			</Sheet>
		);
	}

	return (
		<Sheet
			title="Preview cards"
			onClose={onClose}
			tall
			footer={
				<>
					<button
						type="button"
						className={ui.secondary}
						onClick={handlePrevious}
						disabled={totalCards <= 1}
					>
						<Icon name="chevronLeft" size={20} />
						Back
					</button>
					<button
						type="button"
						className={ui.accent}
						onClick={handleNext}
						disabled={totalCards <= 1}
					>
						Next
						<Icon name="chevronRight" size={20} />
					</button>
				</>
			}
		>
			<p className={styles.counter}>
				Card {currentIndex + 1} of {totalCards}. Swipe either way to flip
				through; nothing is scored here.
			</p>
			<div className={styles.cardContainer}>
				{currentCard && (
					<CardComponent
						card={currentCard}
						onSkip={handleSkip}
						onCorrect={handleCorrect}
						isSwiping={isSwiping}
						swipeDirection={swipeDirection}
						onSwiping={handleSwiping}
						onSwiped={handleSwiped}
						showActionButtons={false}
					/>
				)}
			</div>
			<button
				type="button"
				className={ui.pill}
				onClick={() => setShowDeckSelector(true)}
			>
				Change decks
			</button>
		</Sheet>
	);
}
