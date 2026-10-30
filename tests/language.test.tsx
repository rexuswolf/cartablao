import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { detectBrowserLanguage, loadGameLanguage } from '../src/data/language';
import { LanguageProvider } from '../src/shared/i18n/LanguageProvider';

const renderApp = () => render(<LanguageProvider><App /></LanguageProvider>);

const mockBrowserLanguages = (languages: string[]) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(languages[0] ?? '');
};

describe('game language', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('defaults to the browser language when it is Spanish or English', () => {
        mockBrowserLanguages(['es-ES', 'en']);
        expect(detectBrowserLanguage()).toBe('es');

        mockBrowserLanguages(['fr-FR', 'en-GB']);
        expect(detectBrowserLanguage()).toBe('en');

        mockBrowserLanguages(['de-DE']);
        expect(detectBrowserLanguage()).toBe('en');
    });

    it('prefers the language remembered in this browser', () => {
        mockBrowserLanguages(['en-US']);
        localStorage.setItem('charades-language', 'es');
        expect(loadGameLanguage()).toBe('es');
    });

    it('starts in the browser language', () => {
        mockBrowserLanguages(['es-MX']);
        renderApp();

        expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeTruthy();
        expect(document.documentElement.lang).toBe('es');
    });

    it('switches the interface, decks and default team names on the setup screen, and remembers it', () => {
        mockBrowserLanguages(['en-US']);
        renderApp();
        fireEvent.click(screen.getByRole('button', { name: 'New game' }));
        expect(screen.getByRole('heading', { name: "Who's playing?" })).toBeTruthy();
        expect(screen.getByText('🌟 Famous People')).toBeTruthy();
        expect(screen.getByText('Red Team')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Español' }));

        expect(screen.getByRole('heading', { name: '¿Quién juega?' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Español' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByText('🌟 Famosos')).toBeTruthy();
        expect(screen.getByText('Equipo rojo')).toBeTruthy();
        expect(screen.getByRole('button', { name: '¡A jugar!' })).toBeTruthy();
        expect(localStorage.getItem('charades-language')).toBe('es');

        // A new visit opens in the remembered language
        cleanup();
        renderApp();
        expect(screen.getByRole('button', { name: 'Nueva partida' })).toBeTruthy();
    });

    it('keeps team names typed by players when the language changes', () => {
        mockBrowserLanguages(['en-US']);
        localStorage.setItem('charades-teams', JSON.stringify([
            { id: 'a', name: 'The Mimes', color: '#ff5b3a', players: [] },
            { id: 'b', name: 'Blue Team', color: '#3355ff', players: [] },
        ]));
        renderApp();
        fireEvent.click(screen.getByRole('button', { name: 'New game' }));

        fireEvent.click(screen.getByRole('button', { name: 'Español' }));

        expect(screen.getByText('The Mimes')).toBeTruthy();
        expect(screen.getByText('Equipo azul')).toBeTruthy();
    });

    it('shows deck cards in the game language in the deck picker', () => {
        mockBrowserLanguages(['es-ES']);
        renderApp();
        fireEvent.click(screen.getByRole('button', { name: 'Nueva partida' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cambiar' }));

        expect(screen.getByRole('dialog', { name: 'Elegir barajas' })).toBeTruthy();
        expect(screen.getByText('Animales')).toBeTruthy();
        expect(screen.queryByText('Todos los idiomas')).toBeNull();
        expect(screen.getByText('Elefante')).toBeTruthy();
    });
});
