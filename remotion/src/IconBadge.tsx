import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Icon, type IconKind} from './Icon';

/**
 * Gap mazmuniga mos, yuqori qismda paydo bo'ladigan kichik motion-graphic
 * belgi (masalan savol, soat, tasdiq belgisi). Yuzni to'smasligi uchun
 * ekranning yuqori chegarasiga yaqin joylashadi.
 */
export const IconBadge: React.FC<{
	kind: IconKind;
	startMs: number;
	endMs: number;
}> = ({kind, startMs, endMs}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const currentMs = (frame / fps) * 1000;

	if (currentMs < startMs - 100 || currentMs > endMs + 300) {
		return null;
	}

	const startFrame = (startMs / 1000) * fps;
	const scale = spring({
		frame: frame - startFrame,
		fps,
		config: {damping: 11, mass: 0.5},
		from: 0.4,
		to: 1,
	});

	const opacity = interpolate(
		currentMs,
		[startMs - 100, startMs, endMs, endMs + 300],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<div
			style={{
				position: 'absolute',
				top: '9%',
				left: '50%',
				transform: `translateX(-50%) scale(${scale})`,
				opacity,
				width: 64,
				height: 64,
				borderRadius: '50%',
				background: 'rgba(10, 15, 12, 0.55)',
				border: '1.5px solid rgba(255,255,255,0.5)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
			}}
		>
			<Icon kind={kind} />
		</div>
	);
};
