import ui from "../../shared/styles/ui.module.css";
import { Sheet } from "../Sheet/Sheet";

interface ConfirmSheetProps {
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmSheet({
	title,
	message,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}: ConfirmSheetProps) {
	return (
		<Sheet
			title={title}
			onClose={onCancel}
			footer={
				<>
					<button type="button" className={ui.secondary} onClick={onCancel}>
						{cancelLabel}
					</button>
					<button type="button" className={ui.danger} onClick={onConfirm}>
						{confirmLabel}
					</button>
				</>
			}
		>
			<p className={ui.subtitle}>{message}</p>
		</Sheet>
	);
}
