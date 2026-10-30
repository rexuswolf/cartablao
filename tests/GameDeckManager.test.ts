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
        const deck = saveDeck({ deckCards: ['One', 'Two'], name: 'Mine' });

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
});
