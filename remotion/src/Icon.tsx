import React from 'react';

export type IconKind = 'question' | 'clock' | 'check' | 'chat';

const paths: Record<IconKind, React.ReactNode> = {
	question: (
		<>
			<path d="M9 9a3 3 0 1 1 4.5 2.6c-.9.5-1.5 1-1.5 2.4" strokeLinecap="round" strokeLinejoin="round" />
			<circle cx="12" cy="18" r="0.6" fill="currentColor" stroke="none" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="8" />
			<path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
		</>
	),
	check: <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />,
	chat: (
		<path
			d="M4 5.5h16v10H10l-4 3.5v-3.5H4z"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	),
};

export const Icon: React.FC<{kind: IconKind; size?: number; color?: string}> = ({
	kind,
	size = 34,
	color = '#ffffff',
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth={1.8}
	>
		{paths[kind]}
	</svg>
);
