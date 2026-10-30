export interface GameCard {
    id: number; // Unique within a game
    cardId: string; // The deck card it shows
    word: string; // The card's text in the game's language
    deckId: string;
}
