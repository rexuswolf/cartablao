import type { DeckCard } from "../components/Card/DeckCard";
import type { GameCard } from "../components/Card/GameCard";
import { DECK_LIBRARY, getAllDecks } from "../data/deck";
import { type GameLanguage, type Language, localize } from "../data/language";
import { getDeckCards, getSavedDecks } from "../data/savedDecks";

// Deck management types
export interface GameDeckSelection {
    deckId: string
    name: string // In the game's language, starting with the deck's emoji for built-in decks
    cardCount: number
    language?: Language // Only saved decks, which keep the language they were written in
    isSelected: boolean
}

export interface GameDeckManagerState {
    selectedDecks: GameDeckSelection[]
    availableDecks: GameDeckSelection[]
    mixedCards: GameCard[]
    isMixed: boolean
}

// Default deck configuration
const DEFAULT_DECK_ID = "famous-people";

export class GameDeckManager {
    private state: GameDeckManagerState;
    private officialDecks: GameDeckSelection[] = [];
    private customDecks: GameDeckSelection[] = [];
    private language: GameLanguage;

    constructor(language: GameLanguage = "en") {
        this.language = language;
        this.state = {
            selectedDecks: [],
            availableDecks: [],
            mixedCards: [],
            isMixed: false
        };
        this.initializeAvailableDecks();
    }

    private initializeAvailableDecks(): void {
        this.loadAvailableDecks(new Set([DEFAULT_DECK_ID]));
    }

    // Rebuilds the deck lists from the library and storage, keeping the given decks selected
    private loadAvailableDecks(selectedDeckIds: Set<string>): void {
        const savedDecks = getSavedDecks();
        const libraryDecks = getAllDecks();

        // Separate official and custom decks
        this.officialDecks = libraryDecks.map(deck => ({
            deckId: deck.id,
            name: `${deck.emoji} ${localize(deck.name, this.language)}`,
            cardCount: deck.cards.length,
            isSelected: selectedDeckIds.has(deck.id)
        }));

        this.customDecks = savedDecks.map(deck => ({
            deckId: deck.id,
            name: deck.name,
            cardCount: deck.cards.length,
            language: deck.language,
            isSelected: selectedDeckIds.has(deck.id)
        }));

        // Combine all decks for the main state
        this.state.availableDecks = [...this.officialDecks, ...this.customDecks];
        this.state.selectedDecks = this.state.availableDecks.filter(deck => deck.isSelected);
        this.ensureDeckSelected();

        this.mixSelectedDecks();
    }

    // Falls back to the default deck when nothing is selected
    private ensureDeckSelected(): void {
        if (this.state.selectedDecks.length > 0) return;

        const defaultDeck = this.state.availableDecks.find(deck => deck.deckId === DEFAULT_DECK_ID);
        if (defaultDeck) {
            defaultDeck.isSelected = true;
            this.state.selectedDecks = [defaultDeck];
        }
    }

    public getOfficialDecks(): GameDeckSelection[] {
        return [...this.officialDecks];
    }

    public getCustomDecks(): GameDeckSelection[] {
        return [...this.customDecks];
    }

    public getLanguage(): GameLanguage {
        return this.language;
    }

    // Deck names and card texts follow the game's language; the selection stays
    public setLanguage(language: GameLanguage): void {
        if (language === this.language) return;
        this.language = language;
        this.refreshAvailableDecks();
    }

    public getState(): GameDeckManagerState {
        // Copy nested data so callers (e.g. React state) never share objects this class mutates
        return {
            ...this.state,
            selectedDecks: this.state.selectedDecks.map(deck => ({ ...deck })),
            availableDecks: this.state.availableDecks.map(deck => ({ ...deck })),
            mixedCards: [...this.state.mixedCards],
        };
    }

    public toggleDeckSelection(deckId: string): void {
        const deckIndex = this.state.availableDecks.findIndex(deck => deck.deckId === deckId);
        if (deckIndex === -1) return;

        const deck = this.state.availableDecks[deckIndex];
        deck.isSelected = !deck.isSelected;

        // Update selected decks
        if (deck.isSelected) {
            this.state.selectedDecks.push(deck);
        } else {
            this.state.selectedDecks = this.state.selectedDecks.filter(d => d.deckId !== deckId);
        }

        // Ensure at least one deck is selected
        this.ensureDeckSelected();

        this.mixSelectedDecks();
    }

    public setDeckSelection(deckId: string, isSelected: boolean): void {
        const deckIndex = this.state.availableDecks.findIndex(deck => deck.deckId === deckId);
        if (deckIndex === -1) return;

        const deck = this.state.availableDecks[deckIndex];
        deck.isSelected = isSelected;

        // Update selected decks
        if (isSelected) {
            // Only add if not already in the list
            if (!this.state.selectedDecks.some(d => d.deckId === deckId)) {
                this.state.selectedDecks.push(deck);
            }
        } else {
            this.state.selectedDecks = this.state.selectedDecks.filter(d => d.deckId !== deckId);
        }

        // Ensure at least one deck is selected
        this.ensureDeckSelected();

        this.mixSelectedDecks();
    }

    public selectAllDecks(): void {
        this.state.availableDecks.forEach(deck => {
            deck.isSelected = true;
        });
        this.state.selectedDecks = [...this.state.availableDecks];
        this.mixSelectedDecks();
    }

    public deselectAllDecks(): void {
        // Ensure at least one deck is selected (fallback to default)
        this.selectOnlyDecks([]);
    }

    public selectDefaultDeckOnly(): void {
        this.selectOnlyDecks([DEFAULT_DECK_ID]);
    }

    public selectOnlyDecks(deckIds: string[]): void {
        const ids = new Set(deckIds);
        this.state.availableDecks.forEach(deck => {
            deck.isSelected = ids.has(deck.deckId);
        });
        this.state.selectedDecks = this.state.availableDecks.filter(deck => deck.isSelected);
        this.ensureDeckSelected();
        this.mixSelectedDecks();
    }

    private mixSelectedDecks(): void {
        if (this.state.selectedDecks.length === 0) {
            this.state.mixedCards = [];
            this.state.isMixed = false;
            return;
        }

        const allCards: GameCard[] = [];
        // A card shared by several decks plays once. Different cards with the same text
        // (e.g. a word typed into a saved deck that a built-in deck also has) play once too.
        const seenCardIds = new Set<string>();
        const seenWords = new Set<string>();

        for (const selectedDeck of this.state.selectedDecks) {
            for (const card of this.getDeckCards(selectedDeck.deckId)) {
                const word = localize(card.text, this.language);
                const normalizedWord = word.trim().toLowerCase();
                if (seenCardIds.has(card.id) || seenWords.has(normalizedWord)) continue;

                seenCardIds.add(card.id);
                seenWords.add(normalizedWord);
                allCards.push({
                    // Cards are looked up by id during the game, so every card needs a unique one
                    id: allCards.length,
                    cardId: card.id,
                    word,
                    deckId: selectedDeck.deckId,
                });
            }
        }

        // Shuffle the mixed cards
        this.state.mixedCards = this.shuffleCards(allCards);
        this.state.isMixed = true;
    }

    private shuffleCards(cards: GameCard[]): GameCard[] {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    private getDeckCards(deckId: string): DeckCard[] {
        const libraryDeck = DECK_LIBRARY[deckId as keyof typeof DECK_LIBRARY];
        return libraryDeck ? libraryDeck.cards : getDeckCards(deckId) ?? [];
    }

    // The first few words of a deck, to preview what it contains
    public getSampleCards(deckId: string, count = 3): string[] {
        return this.getDeckCards(deckId)
            .slice(0, count)
            .map(card => localize(card.text, this.language));
    }

    public getMixedCards(): GameCard[] {
        return [...this.state.mixedCards];
    }

    public getSelectedDecksCount(): number {
        return this.state.selectedDecks.length;
    }

    public getTotalAvailableCards(): number {
        return this.state.mixedCards.length;
    }

    public refreshAvailableDecks(): void {
        // Keep the current selection, dropping decks that no longer exist
        this.loadAvailableDecks(new Set(this.state.selectedDecks.map(deck => deck.deckId)));
    }

    public resetToDefault(): void {
        this.state.selectedDecks = [];
        this.state.mixedCards = [];
        this.state.isMixed = false;
        this.initializeAvailableDecks();
    }
} 