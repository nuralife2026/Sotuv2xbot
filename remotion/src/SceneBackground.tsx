import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

/**
 * Sahna foni: agar videoSrc berilgan bo'lsa uni ko'rsatadi (masalan spiker chiqishi
 * yoki b-roll klip), aks holda asl videodagi qorong'i sahna pardasiga o'xshash
 * gradient bilan almashtiradi — shu bilan videosiz ham kompozitsiya darhol
 * preview qilinadi.
 */
export const SceneBackground: React.FC<{videoSrc?: string}> = ({videoSrc}) => {
	if (videoSrc) {
		return (
			<AbsoluteFill style={{backgroundColor: '#000'}}>
				<OffthreadVideo
					src={staticFile(videoSrc)}
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
			</AbsoluteFill>
		);
	}

	return (
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(circle at 50% 20%, #1c2b22 0%, #0a0f0c 55%, #000000 100%)',
			}}
		>
			<AbsoluteFill
				style={{
					background:
						'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 40px)',
				}}
			/>
		</AbsoluteFill>
	);
};
