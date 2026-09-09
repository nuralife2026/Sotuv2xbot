import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {Page} from './Page';

export const TalkingHeadCaptions: React.FC<{captions: Caption[]}> = ({captions}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const currentMs = (frame / fps) * 1000;

	const {pages} = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds: 1200,
			}),
		[captions],
	);

	const activePage = pages.find(
		(page) => currentMs >= page.startMs - 200 && currentMs <= page.startMs + page.durationMs + 400,
	);

	if (!activePage) {
		return null;
	}

	return <Page page={activePage} currentMs={currentMs} />;
};
