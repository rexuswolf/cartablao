import { describe, expect, it } from 'vitest';
import { DECK_LIBRARY, getAllDecks } from '../src/data/deck';

describe('built-in decks', () => {
    const decks = getAllDecks();

    it('use unique ids that match their library key', () => {
        for (const [key, deck] of Object.entries(DECK_LIBRARY)) {
            expect(deck.id).toBe(key);
        }
        expect(new Set(decks.map(deck => deck.id)).size).toBe(decks.length);
    });

    it.each(decks.map(deck => [deck.name, deck] as const))('%s has enough cards for a game', (_, deck) => {
        expect(deck.cards.length).toBeGreaterThanOrEqual(30);
    });

    it.each(decks.map(deck => [deck.name, deck] as const))('%s has no blank or repeated cards', (_, deck) => {
        const normalized = deck.cards.map(card => card.trim().toLowerCase());
        expect(normalized.every(card => card.length > 0)).toBe(true);
        const repeats = normalized.filter((card, index) => normalized.indexOf(card) !== index);
        expect(repeats).toEqual([]);
    });
});
