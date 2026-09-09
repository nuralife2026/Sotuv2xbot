import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {TikTokPage} from '@remotion/captions';
import type {FootageLine} from './types';
import {Page} from './Page';
import {IconBadge} from './IconBadge';
import {distributeWordsInWindow} from './utils/captionsFromScript';

export const FootageCaptionLine: React.FC<{line: FootageLine; topPercent: number}> = ({
	line,
	topPercent,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const currentMs = (frame / fps) * 1000;

	const page: TikTokPage = useMemo(() => {
		const words = distributeWordsInWindow(line.text, line.startMs, line.endMs);
		return {
			text: line.text,
			startMs: line.startMs,
			durationMs: line.endMs - line.startMs,
			tokens: words.map((w) => ({text: w.text, fromMs: w.startMs, toMs: w.endMs})),
		};
	}, [line.text, line.startMs, line.endMs]);

	return (
		<>
			{line.icon ? <IconBadge kind={line.icon} startMs={line.startMs} endMs={line.endMs} /> : null}
			<Page page={page} currentMs={currentMs} activeColor="#ffffff" topPercent={topPercent} />
		</>
	);
};
