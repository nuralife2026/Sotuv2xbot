import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

/**
 * Manba videoning pul yog'ayotgan kadrlarida ko'ringan RGB-split / "glitch"
 * effektini taqlid qiladi: qizil va ko'k kanallar tasodifiy siljiydi.
 * `children` ustiga qo'yiladi.
 */
export const Glitch: React.FC<{children: React.ReactNode; seed?: string}> = ({
	children,
	seed = 'glitch',
}) => {
	const frame = useCurrentFrame();

	// Har 6-8 freymda yangi siljish qiymati — silliq emas, "titroq" ko'rinish uchun
	const step = Math.floor(frame / 6);
	const dx = (random(`${seed}-x-${step}`) - 0.5) * 14;
	const dy = (random(`${seed}-y-${step}`) - 0.5) * 6;

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					mixBlendMode: 'screen',
					transform: `translate(${dx}px, ${dy}px)`,
					filter: 'sepia(1) saturate(6) hue-rotate(-50deg)',
					opacity: 0.55,
				}}
			>
				{children}
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					mixBlendMode: 'screen',
					transform: `translate(${-dx}px, ${-dy}px)`,
					filter: 'sepia(1) saturate(6) hue-rotate(140deg)',
					opacity: 0.55,
				}}
			>
				{children}
			</AbsoluteFill>
			<AbsoluteFill>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};
