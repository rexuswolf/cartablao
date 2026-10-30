import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_TEAMS, loadSavedTeams, saveTeams } from '../src/data/teams';
import type { Team } from '../src/Game';

const teams: Team[] = [
    { id: 'a', name: 'Red Team', color: '#ff5b3a', players: [{ id: 'p1', name: 'Ana', teamId: 'a' }] },
    { id: 'b', name: 'Blue Team', color: '#3355ff', players: [] },
];

describe('saved teams', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts with two empty teams and no player names', () => {
        expect(DEFAULT_TEAMS).toHaveLength(2);
        expect(DEFAULT_TEAMS.every(team => team.players.length === 0)).toBe(true);
    });

    it('returns null when nothing has been saved', () => {
        expect(loadSavedTeams()).toBeNull();
    });

    it('restores the last saved teams and players', () => {
        saveTeams(teams);

        expect(loadSavedTeams()).toEqual(teams);
    });

    it('ignores corrupt storage', () => {
        localStorage.setItem('charades-teams', '{not json');

        expect(loadSavedTeams()).toBeNull();
    });

    it('drops malformed entries and keeps players pointing at their team', () => {
        localStorage.setItem('charades-teams', JSON.stringify([
            { id: 'a', name: 'Red Team', color: '#ff5b3a', players: [{ id: 'p1', name: 'Ana', teamId: 'old' }, { bad: true }] },
            { name: 'No id' },
        ]));

        expect(loadSavedTeams()).toEqual([
            { id: 'a', name: 'Red Team', color: '#ff5b3a', players: [{ id: 'p1', name: 'Ana', teamId: 'a' }] },
        ]);
    });
});
