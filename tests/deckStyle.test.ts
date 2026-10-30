import { describe, expect, it } from 'vitest';
import { GameDeckManager } from '../src/services/GameDeckManager';
import { getDeckColor, splitDeckName } from '../src/shared/libs/deckStyle';

describe('deck card helpers', () => {
    it('splits a leading emoji off the deck name', () => {
        expect(splitDeckName('🌟 Famous People')).toEqual({ symbol: '🌟', title: 'Famous People' });
        expect(splitDeckName('▶️ Famous YouTubers')).toEqual({ symbol: '▶️', title: 'Famous YouTubers' });
        expect(splitDeckName('🇪🇸 Cine y series de España')).toEqual({ symbol: '🇪🇸', title: 'Cine y series de España' });
    });

    it('keeps names without an emoji as they are', () => {
        expect(splitDeckName('Family jokes')).toEqual({ symbol: null, title: 'Family jokes' });
    });

    it('always gives a deck the same color', () => {
        expect(getDeckColor('famous-people')).toBe(getDeckColor('famous-people'));
        expect(getDeckColor('famous-people')).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('previews the first three words of a deck', () => {
        localStorage.clear();
        const manager = new GameDeckManager();

        expect(manager.getSampleCards('famous-people')).toEqual(['Albert Einstein', 'Marie Curie', 'Isaac Newton']);
        expect(manager.getSampleCards('missing-deck')).toEqual([]);
    });
});
