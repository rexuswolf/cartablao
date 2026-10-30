import ui from "../../shared/styles/ui.module.css";
import { useI18n } from "../../shared/i18n/useI18n";

export function NoCards() {
	const { t } = useI18n();
	return (
		<div className={ui.emptyState}>
			<h2 className={ui.sectionTitle}>{t.game.noMoreCards}</h2>
			<p>{t.game.noMoreCardsHint}</p>
		</div>
	);
}
