import styles from "./MainLayout.module.css";

interface MainLayoutProps {
	children: React.ReactNode;
	background?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
	children,
	background,
}) => {
	return (
		<div className={styles.app} style={background ? { background } : undefined}>
			<main className={styles.container}>{children}</main>
		</div>
	);
};
