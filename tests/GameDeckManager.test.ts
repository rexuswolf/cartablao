import { beforeEach, describe, expect, it } from 'vitest';
import { saveDeck } from '../src/data/savedDecks';
import { GameDeckManager } from '../src/services/GameDeckManager';

const selectedIds = (manager: GameDeckManager) =>
    manager.getState().selectedDecks.map(deck => deck.deckId);

describe('GameDeckManager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('gives every mixed card a unique id', () => {
        const manager = new GameDeckManager();
        manager.selectAllDecks();

        const ids = manager.getState().mixedCards.map(card => card.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('keeps the selection when decks are refreshed', () => {
        const manager = new GameDeckManager();
        manager.selectOnlyDecks(['animals', 'sports']);

        manager.refreshAvailableDecks();

        expect(selectedIds(manager).sort()).toEqual(['animals', 'sports']);
        const flagged = manager.getState().availableDecks.filter(deck => deck.isSelected);
        expect(flagged.map(deck => deck.deckId).sort()).toEqual(['animals', 'sports']);
    });

    it('selects exactly the requested decks without re-adding the default deck', () => {
        const manager = new GameDeckManager();

        manager.selectOnlyDecks(['animals']);

        expect(selectedIds(manager)).toEqual(['animals']);
    });

    it('falls back to the default deck when nothing valid is selected', () => {
        const manager = new GameDeckManager();

        manager.selectOnlyDecks(['does-not-exist']);

        expect(selectedIds(manager)).toEqual(['famous-people']);
    });

    it('can select a newly saved custom deck after refreshing', () => {
        const manager = new GameDeckManager();
        const deck = saveDeck({ words: ['One', 'Two'], name: 'Mine' });

        manager.refreshAvailableDecks();
        manager.selectOnlyDecks([deck.id]);

        expect(manager.getState().mixedCards.map(card => card.word).sort()).toEqual(['One', 'Two']);
    });

    it('does not let callers mutate its internal state', () => {
        const manager = new GameDeckManager();
        const state = manager.getState();

        state.availableDecks[0].isSelected = !state.availableDecks[0].isSelected;
        state.selectedDecks.length = 0;

        expect(manager.getState().selectedDecks.length).toBe(1);
        expect(manager.getState().availableDecks[0].isSelected).not.toBe(state.availableDecks[0].isSelected);
    });

    describe('language', () => {
        it('shows deck names and cards in the game language', () => {
            const manager = new GameDeckManager('es');
            manager.selectOnlyDecks(['animals']);

            const animals = manager.getState().availableDecks.find(deck => deck.deckId === 'animals');
            expect(animals?.name).toBe('🐾 Animales');
            expect(manager.getState().mixedCards.map(card => card.word)).toContain('Elefante');
            expect(manager.getSampleCards('animals')).toEqual(['Elefante', 'León', 'Jirafa']);
        });

        it('switches language keeping the selection and card count', () => {
            const manager = new GameDeckManager('en');
            manager.selectOnlyDecks(['animals', 'profesiones']);
            const englishCount = manager.getState().mixedCards.length;
            expect(manager.getState().mixedCards.map(card => card.word)).toContain('Firefighter');

            manager.setLanguage('es');

            expect(manager.getLanguage()).toBe('es');
            expect(selectedIds(manager).sort()).toEqual(['animals', 'profesiones']);
            const words = manager.getState().mixedCards.map(card => card.word);
            expect(words).toContain('Bombero');
            expect(words).not.toContain('Firefighter');
            expect(words).toHaveLength(englishCount);
        });

        it('keeps saved decks in the language they were written in', () => {
            const deck = saveDeck({ words: ['Tortuga Ninja', 'Paella'], name: 'Mía' });
            const manager = new GameDeckManager('en');
            manager.selectOnlyDecks([deck.id]);

            expect(manager.getState().mixedCards.map(card => card.word).sort()).toEqual(['Paella', 'Tortuga Ninja']);
        });
    });

    describe('mixing decks', () => {
        it('plays a card shared by two decks once', () => {
            const manager = new GameDeckManager('en');
            manager.selectOnlyDecks(['marvel-characters']);
            const marvelCount = manager.getState().mixedCards.length;
            manager.selectOnlyDecks(['blockbuster-movies']);
            const moviesCount = manager.getState().mixedCards.length;

            manager.selectOnlyDecks(['marvel-characters', 'blockbuster-movies']);

            const cardIds = manager.getState().mixedCards.map(card => card.cardId);
            expect(cardIds.filter(id => id === 'iron-man')).toHaveLength(1);
            expect(new Set(cardIds).size).toBe(cardIds.length);
            // Iron Man, Spider-Man, Captain America, Thor, Deadpool, Black Panther and Doctor Strange are in both
            expect(cardIds).toHaveLength(marvelCount + moviesCount - 7);
        });

        it('dedupes by id even when the shared card reads differently from other cards', () => {
            const manager = new GameDeckManager('es');
            manager.selectOnlyDecks(['blockbuster-movies', 'disney-y-pixar']);

            const words = manager.getState().mixedCards.map(card => card.word);
            expect(words.filter(word => word === 'Vaiana')).toHaveLength(1);
            expect(words.filter(word => word === 'Zootrópolis')).toHaveLength(1);
        });

        it('plays a typed word once when a built-in deck has the same word', () => {
            const deck = saveDeck({ words: ['Shark', 'My own word'], name: 'Mine' });
            const manager = new GameDeckManager('en');
            manager.selectOnlyDecks(['animals', deck.id]);

            const words = manager.getState().mixedCards.map(card => card.word);
            expect(words.filter(word => word === 'Shark')).toHaveLength(1);
            expect(words).toContain('My own word');
        });
    });
});
