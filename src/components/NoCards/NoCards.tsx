import ui from "../../shared/styles/ui.module.css";

export function NoCards() {
	return (
		<div className={ui.emptyState}>
			<h2 className={ui.sectionTitle}>No more cards</h2>
			<p>End the turn to pass to the next player.</p>
		</div>
	);
}
