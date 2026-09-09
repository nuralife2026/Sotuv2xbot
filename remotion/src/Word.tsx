import React from 'react';
import {interpolate} from 'remotion';
import type {TikTokToken} from '@remotion/captions';
import {ACCENT_COLOR} from './constants';

const REST_SIZE = 46;
const PEAK_SIZE = 66;
const ENTER_MS = 90;
const RELEASE_MS = 320;

export const Word: React.FC<{
	token: TikTokToken;
	currentMs: number;
	activeColor?: string;
}> = ({token, currentMs, activeColor = ACCENT_COLOR}) => {
	if (currentMs < token.fromMs - ENTER_MS) {
		return null;
	}

	const opacity = interpolate(
		currentMs,
		[token.fromMs - ENTER_MS, token.fromMs],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const fontSize = interpolate(
		currentMs,
		[token.fromMs - ENTER_MS, token.fromMs, token.toMs, token.toMs + RELEASE_MS],
		[REST_SIZE * 0.7, PEAK_SIZE, PEAK_SIZE, REST_SIZE],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const translateY = interpolate(
		currentMs,
		[token.fromMs - ENTER_MS, token.fromMs],
		[16, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const isActive = currentMs >= token.fromMs && currentMs <= token.toMs + RELEASE_MS / 2;
	const fontWeight = isActive ? 800 : 600;

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				fontSize,
				fontWeight,
				lineHeight: 1,
				transform: `translateY(${translateY}px)`,
				color: isActive ? activeColor : '#ffffff',
				textShadow:
					'0 2px 0 rgba(0,0,0,0.9), 0 4px 14px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.9)',
				whiteSpace: 'pre',
			}}
		>
			{token.text}
		</span>
	);
};
