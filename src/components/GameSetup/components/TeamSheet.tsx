import { useState } from "react";
import type { Team } from "../../../Game";
import { useI18n } from "../../../shared/i18n/useI18n";
import ui from "../../../shared/styles/ui.module.css";
import { Sheet } from "../../Sheet/Sheet";

interface TeamSheetProps {
	team: Team;
	onRename: (name: string) => void;
	onClose: () => void;
}

export function TeamSheet({ team, onRename, onClose }: TeamSheetProps) {
	const { t } = useI18n();
	const [teamName, setTeamName] = useState(team.name);

	const handleSave = (event?: React.FormEvent) => {
		event?.preventDefault();
		if (teamName.trim()) onRename(teamName.trim());
		onClose();
	};

	return (
		<Sheet
			title={t.teamSheet.title}
			onClose={onClose}
			footer={
				<button type="button" className={ui.primary} onClick={() => handleSave()}>
					{t.common.save}
				</button>
			}
		>
			<form onSubmit={handleSave}>
				<label className={ui.field}>
					<span className={ui.label}>{t.teamSheet.teamName}</span>
					<input
						className={ui.input}
						value={teamName}
						onChange={(event) => setTeamName(event.target.value)}
						enterKeyHint="done"
					/>
				</label>
			</form>
		</Sheet>
	);
}
