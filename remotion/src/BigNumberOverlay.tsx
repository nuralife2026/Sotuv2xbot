import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ACCENT_COLOR} from './constants';

/**
 * "$1.000.000 topyapsiz" kadridagi kabi — bitta kuchli, qalin sarlavha va
 * ixtiyoriy kichikroq quyi matn. Sahna boshida sakrab kirib keladi.
 */
export const BigNumberOverlay: React.FC<{headline: string; subline?: string}> = ({
	headline,
	subline,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const scale = spring({frame, fps, config: {damping: 12, mass: 0.6}, from: 0.7, to: 1});
	const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-start',
				alignItems: 'center',
				paddingTop: '46%',
			}}
		>
			<div
				style={{
					opacity,
					transform: `scale(${scale})`,
					width: '88%',
					textAlign: 'center',
					fontFamily: 'Inter, system-ui, sans-serif',
				}}
			>
				<div
					style={{
						fontSize: 58,
						fontWeight: 800,
						color: '#ffffff',
						lineHeight: 1.15,
						textShadow: '0 3px 0 rgba(0,0,0,0.9), 0 6px 20px rgba(0,0,0,0.6)',
					}}
				>
					{headline}
				</div>
				{subline ? (
					<div
						style={{
							marginTop: 14,
							fontSize: 28,
							fontWeight: 600,
							color: ACCENT_COLOR,
							textShadow: '0 2px 10px rgba(0,0,0,0.6)',
						}}
					>
						{subline}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};
