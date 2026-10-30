import { useCallback, useState } from 'react';
import type { Player, Team } from '../../Game';

export const TEAM_COLORS = [
    '#ff5b3a', '#3355ff', '#2fb872', '#9b5cff', '#ff7ab6',
    '#00a6a6', '#ff9f1c', '#5cc8ff', '#c2e812', '#ffd23f',
];



export function useTeamManager(initialTeams: Team[] = []) {
    const [teams, setTeams] = useState<Team[]>(initialTeams);

    const addTeam = useCallback((name: string) => {
        if (name.trim()) {
            // Built outside the updater so the caller always gets the new team's id back
            const newTeam: Team = {
                id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: name.trim(),
                color: TEAM_COLORS[0],
                players: [],
            };
            setTeams(prev => {
                newTeam.color = TEAM_COLORS[prev.length % TEAM_COLORS.length];
                return [...prev, newTeam];
            });
            return newTeam;
        }
        return null;
    }, []);

    const removeTeam = useCallback((teamId: string) => {
        setTeams(prev => prev.filter(team => team.id !== teamId));
    }, []);

    const addPlayer = useCallback((teamId: string, name: string) => {
        if (name.trim()) {
            const newPlayer: Player = {
                id: `player-${Date.now()}`,
                name: name.trim(),
                teamId,
            };

            setTeams(prev => prev.map(team =>
                team.id === teamId
                    ? { ...team, players: [...team.players, newPlayer] }
                    : team
            ));
            return newPlayer;
        }
        return null;
    }, []);

    const removePlayer = useCallback((teamId: string, playerId: string) => {
        setTeams(prev => prev.map(team =>
            team.id === teamId
                ? { ...team, players: team.players.filter(p => p.id !== playerId) }
                : team
        ));
    }, []);

    const balanceTeams = useCallback(() => {
        const allPlayers = teams.flatMap(team => team.players);
        const shuffledPlayers = [...allPlayers].sort(() => Math.random() - 0.5);

        const balancedTeams = teams.map((team, index) => ({
            ...team,
            players: shuffledPlayers
                .filter((_, playerIndex) => playerIndex % teams.length === index)
                // Players moved to another team must point at it, or their turns score for the old team
                .map(player => ({ ...player, teamId: team.id })),
        }));

        setTeams(balancedTeams);
    }, [teams]);

    const updateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
        setTeams(prev => prev.map(team =>
            team.id === teamId ? { ...team, ...updates } : team
        ));
    }, []);

    const getTeamById = useCallback((teamId: string) => {
        return teams.find(team => team.id === teamId);
    }, [teams]);

    const getPlayerById = useCallback((playerId: string) => {
        return teams.flatMap(team => team.players).find(player => player.id === playerId);
    }, [teams]);

    const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
        setTeams(prev => prev.map(team => ({
            ...team,
            players: team.players.map(player =>
                player.id === playerId ? { ...player, ...updates } : player
            ),
        })));
    }, []);

    const movePlayer = useCallback((playerId: string, newTeamId: string) => {
        setTeams(prev => {
            const player = prev.flatMap(team => team.players).find(p => p.id === playerId);
            if (!player) return prev;

            return prev.map(team => ({
                ...team,
                players: team.id === newTeamId
                    ? [...team.players, { ...player, teamId: newTeamId }]
                    : team.players.filter(p => p.id !== playerId)
            }));
        });
    }, []);

    const clearTeams = useCallback(() => {
        setTeams([]);
    }, []);

    const setTeamsDirectly = useCallback((newTeams: Team[]) => {
        setTeams(newTeams);
    }, []);

    return {
        // State
        teams,

        // Actions
        addTeam,
        removeTeam,
        addPlayer,
        removePlayer,
        balanceTeams,
        updateTeam,
        updatePlayer,
        movePlayer,
        clearTeams,
        setTeams: setTeamsDirectly,

        // Getters
        getTeamById,
        getPlayerById,

        // Computed values
        totalPlayers: teams.reduce((sum, team) => sum + team.players.length, 0),
        hasTeams: teams.length > 0,
        hasPlayers: teams.some(team => team.players.length > 0),
        teamCount: teams.length,
        averagePlayersPerTeam: teams.length > 0
            ? teams.reduce((sum, team) => sum + team.players.length, 0) / teams.length
            : 0,
    };
} 