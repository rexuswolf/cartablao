import { describe, expect, it } from 'vitest';
import type { GameCard } from '../src/components/Card/GameCard';
import type { Team } from '../src/Game';
import { Round } from '../src/Round';
import { getGameResults } from '../src/services/GameResults';

const card = (id: number): GameCard => ({ id, cardId: `card-${id}`, word: `Card ${id}`, deckId: 'test' });

const teams: Team[] = [
    { id: 'red', name: 'Red', color: '#f00', players: [{ id: 'ana', name: 'Ana', teamId: 'red' }] },
    { id: 'blue', name: 'Blue', color: '#00f', players: [{ id: 'ben', name: 'Ben', teamId: 'blue' }] },
];

const roundWithTurns = () => {
    const round = new Round([], 1);
    round.addTurn({ playerId: 'ana', teamId: 'red', correctCards: [card(1), card(2)], skippedCards: [card(3)], playedCardIds: [], timeLeft: 0 });
    round.addTurn({ playerId: 'ben', teamId: 'blue', correctCards: [card(3)], skippedCards: [], playedCardIds: [], timeLeft: 0 });
    round.addTurn({ playerId: 'ana', teamId: 'red', correctCards: [card(4)], skippedCards: [card(5)], playedCardIds: [], timeLeft: 0 });
    return round;
};

describe('getGameResults', () => {
    it('totals team scores from skipped and correct cards', () => {
        const { teamResults, leaderScore, totalCorrect } = getGameResults([roundWithTurns()], teams);

        expect(teamResults.map(result => [result.team.id, result.totalCorrect, result.totalSkipped])).toEqual([
            ['red', 3, 2],
            ['blue', 1, 0],
        ]);
        expect(leaderScore).toBe(3);
        expect(totalCorrect).toBe(4);
    });

    it('aggregates players across turns using the game teams', () => {
        const { playerResults } = getGameResults([roundWithTurns()], teams);

        expect(playerResults.map(result => [result.player.name, result.team.name, result.correct, result.skipped])).toEqual([
            ['Ana', 'Red', 3, 2],
            ['Ben', 'Blue', 1, 0],
        ]);
    });
});
