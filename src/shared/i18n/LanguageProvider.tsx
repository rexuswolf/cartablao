import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
	type GameLanguage,
	loadGameLanguage,
	saveGameLanguage,
} from "../../data/language";
import { TRANSLATIONS } from "./translations";
import { I18nContext } from "./useI18n";

// Holds the game's language: remembered in this browser, otherwise the browser's own
export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<GameLanguage>(loadGameLanguage);

	useEffect(() => {
		document.documentElement.lang = language;
	}, [language]);

	const value = useMemo(
		() => ({
			language,
			setLanguage: (next: GameLanguage) => {
				saveGameLanguage(next);
				setLanguageState(next);
			},
			t: TRANSLATIONS[language],
		}),
		[language],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
