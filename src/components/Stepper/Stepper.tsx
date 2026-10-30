import ui from "../../shared/styles/ui.module.css";
import { useI18n } from "../../shared/i18n/useI18n";
import { Icon } from "../Icon/Icon";
import styles from "./Stepper.module.css";

interface StepperProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	unit?: string;
	onChange: (value: number) => void;
}

export function Stepper({
	label,
	value,
	min,
	max,
	step = 1,
	unit = "",
	onChange,
}: StepperProps) {
	const { t } = useI18n();
	return (
		<div className={styles.stepper}>
			<span className={styles.label}>{label}</span>
			<div className={styles.controls}>
				<button
					type="button"
					className={ui.iconButton}
					aria-label={t.stepper.decrease(label)}
					disabled={value <= min}
					onClick={() => onChange(Math.max(min, value - step))}
				>
					<Icon name="minus" size={20} />
				</button>
				<output className={styles.value} aria-live="polite">
					{value}
					{unit}
				</output>
				<button
					type="button"
					className={ui.iconButton}
					aria-label={t.stepper.increase(label)}
					disabled={value >= max}
					onClick={() => onChange(Math.min(max, value + step))}
				>
					<Icon name="plus" size={20} />
				</button>
			</div>
		</div>
	);
}
