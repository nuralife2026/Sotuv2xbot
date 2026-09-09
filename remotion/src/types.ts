import type {Caption} from '@remotion/captions';

export type BaseScene = {
	durationInFrames: number;
	/** public/ papkasiga nisbatan yo'l, masalan "footage/spiker.mp4". Bo'sh bo'lsa fon gradient bo'ladi. */
	videoSrc?: string;
	/** public/ papkasiga nisbatan yo'l, masalan "audio/topic-0.wav" — diktor ovozi yoki musiqa. */
	audioSrc?: string;
	/** RGB split / glitch effekti (pul yomg'iri kabi b-roll kadrlarda ko'ringan) */
	glitch?: boolean;
};

/** Spiker gapirayotganda so'z-so'z animatsiyalanadigan pastki sarlavha (karaoke uslubi) */
export type TalkingHeadScene = BaseScene & {
	type: 'talking-head';
	/** Millisekundlarda, sahna boshiga nisbatan */
	captions: Caption[];
};

/** Chegaralangan quti ichida ikkita bayonot (masalan pul/qo'lda naqd pul kadri) */
export type StatementScene = BaseScene & {
	type: 'statement';
	lines: string[];
};

/** Katta, qalin sarlavha + kichik quyi matn (masalan "$1.000.000 topyapsiz") */
export type BigNumberScene = BaseScene & {
	type: 'big-number';
	headline: string;
	subline?: string;
};

export type Scene = TalkingHeadScene | StatementScene | BigNumberScene;

export type CaptionedVideoProps = {
	scenes: Scene[];
	/** Butun video davomida chaladigan yagona fon audio (masalan asl videodan olingan ovoz). public/ ga nisbatan yo'l. */
	audioSrc?: string;
	/** audioSrc video umumiy davomiyligidan qisqa bo'lsa, uni qayta-qayta chaladi. Standart: true. */
	loopAudio?: boolean;
};

/** Haqiqiy (spikerning o'z ovozi bilan yozilgan) video ustiga sarlavha qo'shish uchun. */
export type FootageLine = {
	text: string;
	/** Millisekundlarda, videoning o'zidan (audio pauzalaridan) aniqlangan haqiqiy vaqt. */
	startMs: number;
	endMs: number;
	icon?: 'question' | 'clock' | 'check' | 'chat';
};

export type RealFootageProps = {
	/** public/ ga nisbatan yo'l — asl video, o'z audiosi bilan (o'zgartirilmaydi). */
	videoSrc: string;
	lines: FootageLine[];
	/** public/ ga nisbatan yo'l — har bir sarlavha chiqqanda past ovozda eshitiladigan effekt. */
	popSfxSrc?: string;
	/** popSfxSrc ovoz balandligi (0..1). Standart: 0.12 — asl ovozni bosmasligi uchun past. */
	popSfxVolume?: number;
};
