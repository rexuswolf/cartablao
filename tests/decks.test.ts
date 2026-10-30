import { describe, expect, it } from 'vitest';
import type { DeckCard } from '../src/components/Card/DeckCard';
import { DECK_LIBRARY, getAllDecks } from '../src/data/deck';
import { GAME_LANGUAGES, localize } from '../src/data/language';

describe('built-in decks', () => {
    const decks = getAllDecks();
    const eachDeck = decks.map(deck => [deck.name.en, deck] as const);

    it('use unique ids that match their library key', () => {
        for (const [key, deck] of Object.entries(DECK_LIBRARY)) {
            expect(deck.id).toBe(key);
        }
        expect(new Set(decks.map(deck => deck.id)).size).toBe(decks.length);
    });

    it.each(eachDeck)('%s has a name in every language and an emoji', (_, deck) => {
        for (const language of GAME_LANGUAGES) {
            expect(deck.name[language].trim()).not.toBe('');
        }
        expect(deck.emoji.trim()).not.toBe('');
    });

    it.each(eachDeck)('%s has enough cards for a game', (_, deck) => {
        expect(deck.cards.length).toBeGreaterThanOrEqual(30);
    });

    it.each(eachDeck)('%s has unique card ids', (_, deck) => {
        const ids = deck.cards.map(card => card.id);
        expect(ids.every(id => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toBe(true);
        expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
    });

    it.each(eachDeck)('%s has text for every card in both languages', (_, deck) => {
        for (const language of GAME_LANGUAGES) {
            const blank = deck.cards.filter(card => !localize(card.text, language)?.trim());
            expect(blank, language).toEqual([]);
        }
    });

    it.each(eachDeck)('%s has no repeated cards in either language', (_, deck) => {
        for (const language of GAME_LANGUAGES) {
            const normalized = deck.cards.map(card => localize(card.text, language).trim().toLowerCase());
            const repeats = normalized.filter((card, index) => normalized.indexOf(card) !== index);
            expect(repeats, language).toEqual([]);
        }
    });

    it('only uses per-language text when the languages differ', () => {
        const needless = decks.flatMap(deck => deck.cards)
            .filter(card => typeof card.text !== 'string' && card.text.es === card.text.en);
        expect(needless).toEqual([]);
    });

    it('gives a card shared by several decks the same text everywhere', () => {
        const byId = new Map<string, DeckCard>();
        const mismatches: string[] = [];
        for (const card of decks.flatMap(deck => deck.cards)) {
            const seen = byId.get(card.id);
            if (seen && JSON.stringify(seen.text) !== JSON.stringify(card.text)) mismatches.push(card.id);
            byId.set(card.id, card);
        }
        expect(mismatches).toEqual([]);
    });
});
