import { createContext, useContext } from "react";
import type { GameLanguage } from "../../data/language";
import { TRANSLATIONS, type Translations } from "./translations";

interface I18nContextValue {
	language: GameLanguage;
	setLanguage: (language: GameLanguage) => void;
	t: Translations;
}

// Without a provider (e.g. in isolated tests) the app speaks English
export const I18nContext = createContext<I18nContextValue>({
	language: "en",
	setLanguage: () => {},
	t: TRANSLATIONS.en,
});

export function useI18n(): I18nContextValue {
	return useContext(I18nContext);
}
