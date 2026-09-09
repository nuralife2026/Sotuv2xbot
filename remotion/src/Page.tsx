import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {TikTokPage} from '@remotion/captions';
import {Word} from './Word';

/**
 * Manba videoda ko'ringan "karaoke" pastki sarlavha: gapirilayotgan so'z katta
 * va qalin bo'lib chiqadi, keyin kichrayib qoladi. Har bir "page"
 * (@remotion/captions tomonidan bir necha so'zga bo'lingan bo'lak) shu
 * komponent bilan chiziladi.
 */
export const Page: React.FC<{
	page: TikTokPage;
	currentMs: number;
	activeColor?: string;
	topPercent?: number;
}> = ({page, currentMs, activeColor, topPercent = 52}) => {
	const relativeMs = currentMs - page.startMs;
	if (relativeMs < -200 || relativeMs > page.durationMs + 400) {
		return null;
	}

	const pageOpacity = interpolate(
		relativeMs,
		[-200, 0, page.durationMs, page.durationMs + 400],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-start',
				alignItems: 'center',
				paddingTop: `${topPercent}%`,
			}}
		>
			<div
				style={{
					opacity: pageOpacity,
					width: '86%',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'flex-end',
					justifyContent: 'center',
					columnGap: 14,
					rowGap: 6,
					fontFamily: 'Inter, system-ui, sans-serif',
					textAlign: 'center',
				}}
			>
				{page.tokens.map((token, i) => (
					<Word
						key={`${token.text}-${i}`}
						token={token}
						currentMs={currentMs}
						activeColor={activeColor}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
