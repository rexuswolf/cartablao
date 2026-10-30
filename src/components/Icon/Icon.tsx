const PATHS = {
	plus: "M12 5v14M5 12h14",
	minus: "M5 12h14",
	close: "M6 6l12 12M18 6L6 18",
	check: "M5 12.5l4.5 4.5L19 7.5",
	chevronRight: "M9 6l6 6-6 6",
	chevronLeft: "M15 6l-6 6 6 6",
	shuffle: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
	trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
	edit: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
	sparkle: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z",
	upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
	download: "M12 4v12M7 11l5 5 5-5M4 20h16",
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
	name: IconName;
	size?: number;
	strokeWidth?: number;
}

export function Icon({ name, size = 22, strokeWidth = 2.6 }: IconProps) {
	return (
		<svg
			aria-hidden="true"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={PATHS[name]} />
		</svg>
	);
}
