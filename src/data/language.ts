// Languages a game can be played in; every built-in card and the whole interface come in both
export type GameLanguage = "es" | "en";
export const GAME_LANGUAGES: GameLanguage[] = ["es", "en"];

// Text that is either the same in every language (e.g. "Minecraft") or translated per language
export type LocalizedText = Record<GameLanguage, string>;
export type Localizable = string | LocalizedText;

export function localize(text: Localizable, language: GameLanguage): string {
    return typeof text === "string" ? text : text[language];
}

export function isGameLanguage(value: unknown): value is GameLanguage {
    return value === "es" || value === "en";
}

// Keeps the app's old name so data saved by earlier versions is still found
const GAME_LANGUAGE_STORAGE_KEY = "charades-language";

// The browser's preferred language when it is Spanish or English, otherwise English
export function detectBrowserLanguage(): GameLanguage {
    const preferred = typeof navigator === "undefined"
        ? []
        : [...(navigator.languages ?? []), navigator.language];
    for (const tag of preferred) {
        const code = tag?.slice(0, 2).toLowerCase();
        if (isGameLanguage(code)) return code;
    }
    return "en";
}

// The language chosen for the last game in this browser, or the browser's own language
export function loadGameLanguage(): GameLanguage {
    try {
        const stored = localStorage.getItem(GAME_LANGUAGE_STORAGE_KEY);
        if (isGameLanguage(stored)) return stored;
    } catch {
        // Storage can be blocked (e.g. private browsing)
    }
    return detectBrowserLanguage();
}

export function saveGameLanguage(language: GameLanguage): void {
    try {
        localStorage.setItem(GAME_LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
        console.error("Error saving language:", error);
    }
}

// The language a saved deck was written in; "universal" decks mix languages or don't need one
export type DeckLanguageCode = "universal" | GameLanguage;

export class Language {
    private readonly _code: DeckLanguageCode;
    private readonly _display: string;

    private constructor(
        code: DeckLanguageCode,
        display: string
    ) {
        this._code = code;
        this._display = display;
    }

    get code(): DeckLanguageCode {
        return this._code;
    }

    // English name, used in AI prompts; the interface shows translated names instead
    get display(): string {
        return this._display;
    }

    static getAll(): Language[] {
        return [Language.universal(), Language.spanish(), Language.english()];
    }

    static fromCode(code: string): Language | undefined {
        return Language.getAll().find(lang => lang.code === code);
    }

    static isValid(code: string): boolean {
        return Language.fromCode(code) !== undefined;
    }

    static universal(): Language {
        return new Language("universal", "Universal");
    }

    static english(): Language {
        return new Language("en", "English");
    }

    static spanish(): Language {
        return new Language("es", "Spanish");
    }
}
