import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * "Sizni biznesingiz keltiradigan pul / talab qiladigan puldan kamroq
 * bo'lishi kerak" kadridagi kabi — chegarasi bor, yarim shaffof quti ichida
 * ketma-ket chiqadigan bayonotlar.
 */
export const StatementOverlay: React.FC<{lines: string[]}> = ({lines}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const msPerLine = 550;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				padding: '0 8%',
			}}
		>
			<div style={{display: 'flex', flexDirection: 'column', gap: 22, width: '100%'}}>
				{lines.map((line, i) => {
					const startMs = i * msPerLine;
					const currentMs = (frame / fps) * 1000;
					const opacity = interpolate(currentMs, [startMs, startMs + 260], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					const translateY = interpolate(currentMs, [startMs, startMs + 260], [18, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});

					return (
						<div
							key={i}
							style={{
								opacity,
								transform: `translateY(${translateY}px)`,
								border: '2px solid rgba(255,255,255,0.85)',
								borderRadius: 4,
								padding: '18px 22px',
								background: 'rgba(0,0,0,0.28)',
								backdropFilter: 'blur(1px)',
							}}
						>
							<span
								style={{
									fontFamily: 'Inter, system-ui, sans-serif',
									fontSize: 34,
									fontWeight: 700,
									color: '#ffffff',
									lineHeight: 1.3,
									textShadow: '0 2px 10px rgba(0,0,0,0.6)',
								}}
							>
								{line}
							</span>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
