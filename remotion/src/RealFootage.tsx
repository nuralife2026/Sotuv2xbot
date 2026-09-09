import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useVideoConfig} from 'remotion';
import type {RealFootageProps} from './types';
import {FootageCaptionLine} from './FootageCaptionLine';

const CAPTION_TOP_PERCENT = 66;
const POP_SFX_DURATION_MS = 90;

/**
 * Haqiqiy (spikerning o'zi tomonidan yozib berilgan) video ustiga oq rangli,
 * so'z-so'z animatsiyalanadigan sarlavhalar va nozik motion-graphic
 * belgilarni qo'yadi. Asl video O'ZINING audiosi bilan to'liq, o'zgarishsiz
 * ishlatiladi — hech qanday ovoz almashtirilmaydi yoki o'chirilmaydi.
 */
export const RealFootage: React.FC<RealFootageProps> = ({
	videoSrc,
	lines,
	popSfxSrc,
	popSfxVolume = 0.12,
}) => {
	const {fps} = useVideoConfig();
	const popDurationInFrames = Math.max(1, Math.round((POP_SFX_DURATION_MS / 1000) * fps));

	return (
		<AbsoluteFill style={{backgroundColor: '#000000'}}>
			<OffthreadVideo
				src={staticFile(videoSrc)}
				style={{width: '100%', height: '100%', objectFit: 'cover'}}
			/>

			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.62) 100%)',
					pointerEvents: 'none',
				}}
			/>

			{lines.map((line, i) => (
				<FootageCaptionLine key={i} line={line} topPercent={CAPTION_TOP_PERCENT} />
			))}

			{popSfxSrc
				? lines.map((line, i) => (
						<Sequence
							key={`sfx-${i}`}
							from={Math.round((line.startMs / 1000) * fps)}
							durationInFrames={popDurationInFrames}
							layout="none"
						>
							<Audio src={staticFile(popSfxSrc)} volume={popSfxVolume} />
						</Sequence>
					))
				: null}
		</AbsoluteFill>
	);
};
