import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import type {CaptionedVideoProps} from './types';
import {SceneBackground} from './SceneBackground';
import {Glitch} from './Glitch';
import {TalkingHeadCaptions} from './TalkingHeadCaptions';
import {StatementOverlay} from './StatementOverlay';
import {BigNumberOverlay} from './BigNumberOverlay';

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
	scenes,
	audioSrc,
	loopAudio = true,
}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000000'}}>
			{audioSrc ? <Audio src={staticFile(audioSrc)} loop={loopAudio} /> : null}

			<Series>
				{scenes.map((scene, i) => (
					<Series.Sequence key={i} durationInFrames={scene.durationInFrames}>
						<AbsoluteFill>
							{scene.audioSrc ? <Audio src={staticFile(scene.audioSrc)} /> : null}

							{scene.glitch ? (
								<Glitch seed={`scene-${i}`}>
									<SceneBackground videoSrc={scene.videoSrc} />
								</Glitch>
							) : (
								<SceneBackground videoSrc={scene.videoSrc} />
							)}

							<Vignette />

							{scene.type === 'talking-head' ? (
								<TalkingHeadCaptions captions={scene.captions} />
							) : null}

							{scene.type === 'statement' ? (
								<StatementOverlay lines={scene.lines} />
							) : null}

							{scene.type === 'big-number' ? (
								<BigNumberOverlay headline={scene.headline} subline={scene.subline} />
							) : null}
						</AbsoluteFill>
					</Series.Sequence>
				))}
			</Series>
		</AbsoluteFill>
	);
};
