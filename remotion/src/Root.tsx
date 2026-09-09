import React from 'react';
import {Composition} from 'remotion';
import {CaptionedVideo} from './CaptionedVideo';
import {FPS, HEIGHT, WIDTH} from './constants';
import type {CaptionedVideoProps} from './types';
import exampleScenes from './data/example-scenes.json';

const totalDurationInFrames = (exampleScenes as CaptionedVideoProps).scenes.reduce(
	(sum, scene) => sum + scene.durationInFrames,
	0,
);

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="CaptionedVideo"
				component={CaptionedVideo}
				durationInFrames={totalDurationInFrames}
				fps={FPS}
				width={WIDTH}
				height={HEIGHT}
				defaultProps={exampleScenes as CaptionedVideoProps}
			/>
		</>
	);
};
