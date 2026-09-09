import React from 'react';
import {Composition} from 'remotion';
import {CaptionedVideo} from './CaptionedVideo';
import {RealFootage} from './RealFootage';
import {FPS, HEIGHT, WIDTH} from './constants';
import type {CaptionedVideoProps, RealFootageProps} from './types';
import exampleScenes from './data/example-scenes.json';
import {taqsimLines} from './data/taqsim-lines';

const totalDurationInFrames = (exampleScenes as CaptionedVideoProps).scenes.reduce(
	(sum, scene) => sum + scene.durationInFrames,
	0,
);

const taqsimPromoProps: RealFootageProps = {
	videoSrc: 'footage/taqsim-promo.mp4',
	lines: taqsimLines,
	popSfxSrc: 'audio/pop.wav',
	popSfxVolume: 0.12,
};

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
			<Composition
				id="TaqsimPromo"
				component={RealFootage}
				durationInFrames={1155}
				fps={30}
				width={720}
				height={1280}
				defaultProps={taqsimPromoProps}
			/>
		</>
	);
};
