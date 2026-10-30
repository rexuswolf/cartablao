import { type ReactNode, useEffect, useId } from "react";
import ui from "../../shared/styles/ui.module.css";
import { Icon } from "../Icon/Icon";

interface SheetProps {
	title: string;
	onClose: () => void;
	children: ReactNode;
	footer?: ReactNode;
	headerAction?: ReactNode;
	tall?: boolean;
}

// Open sheets, newest last, so Escape only closes the one on top
const openSheets: symbol[] = [];

// Bottom sheet on phones, centered dialog on wider screens
export function Sheet({
	title,
	onClose,
	children,
	footer,
	headerAction,
	tall = false,
}: SheetProps) {
	const titleId = useId();

	useEffect(() => {
		const sheetId = Symbol("sheet");
		openSheets.push(sheetId);
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && openSheets.at(-1) === sheetId) onClose();
		};
		document.addEventListener("keydown", handleKeyDown);

		// Keep the page behind the sheet from scrolling
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			openSheets.splice(openSheets.indexOf(sheetId), 1);
			document.body.style.overflow = previousOverflow;
		};
	}, [onClose]);

	return (
		<div
			className={ui.overlay}
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			role="presentation"
		>
			<div
				className={tall ? ui.sheetFull : ui.sheet}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<div className={ui.sheetHeader}>
					<h2 id={titleId} className={ui.sheetTitle}>
						{title}
					</h2>
					<div style={{ display: "flex", gap: 8 }}>
						{headerAction}
						<button
							type="button"
							className={ui.iconButton}
							onClick={onClose}
							aria-label="Close"
						>
							<Icon name="close" size={20} />
						</button>
					</div>
				</div>
				<div className={ui.sheetBody}>{children}</div>
				{footer && <div className={ui.sheetFooter}>{footer}</div>}
			</div>
		</div>
	);
}
