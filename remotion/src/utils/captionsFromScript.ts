import type {Caption} from '@remotion/captions';

/**
 * Haqiqiy audio transkripsiyasi (masalan Whisper) bo'lmaganda, oddiy matndan
 * taxminiy so'z-vaqt jadvalini hisoblab chiqadi. So'z uzunligiga qarab
 * davomiylik beradi — shu bilan tez va sekin so'zlar tabiiyroq ko'rinadi.
 *
 * Haqiqiy videoga aniq moslash uchun buni Whisper (yoki boshqa STT) chiqishi
 * bilan almashtiring — @remotion/install-whisper-cpp shu ishni qiladi.
 */
export const captionsFromScript = (
	text: string,
	options?: {startMs?: number; msPerChar?: number; minWordMs?: number; gapMs?: number},
): Caption[] => {
	const startMs = options?.startMs ?? 0;
	const msPerChar = options?.msPerChar ?? 45;
	const minWordMs = options?.minWordMs ?? 220;
	const gapMs = options?.gapMs ?? 60;

	const words = text.trim().split(/\s+/).filter(Boolean);

	let cursor = startMs;
	const captions: Caption[] = [];

	for (const word of words) {
		const duration = Math.max(minWordMs, word.length * msPerChar);
		const wordStart = cursor;
		const wordEnd = wordStart + duration;

		captions.push({
			text: `${word} `,
			startMs: wordStart,
			endMs: wordEnd,
			timestampMs: (wordStart + wordEnd) / 2,
			confidence: null,
		});

		cursor = wordEnd + gapMs;
	}

	return captions;
};

/** Bir nechta gapdan iborat skriptni ketma-ket Caption[] ga aylantiradi. */
export const captionsFromLines = (
	lines: string[],
	options?: {msPerChar?: number; minWordMs?: number; gapMs?: number; pauseBetweenLinesMs?: number},
): Caption[] => {
	const pauseBetweenLinesMs = options?.pauseBetweenLinesMs ?? 350;
	let cursor = 0;
	const all: Caption[] = [];

	for (const line of lines) {
		const lineCaptions = captionsFromScript(line, {...options, startMs: cursor});
		all.push(...lineCaptions);
		const last = lineCaptions.at(-1);
		cursor = (last ? last.endMs : cursor) + pauseBetweenLinesMs;
	}

	return all;
};

/**
 * Matnni BERILGAN [startMs, endMs] oynasi ichiga sig'diradi — so'z uzunligiga
 * qarab proporsional vaqt beradi. Haqiqiy audioda pauza orqali aniqlangan
 * segment chegaralari ma'lum bo'lganda (masalan ffmpeg silencedetect), lekin
 * to'liq so'z-vaqt transkripsiyasi yo'q holatlarda ishlatiladi — natija
 * segment ichida tabiiy ko'rinadi va real pauzalarga aniq mos keladi.
 */
export const distributeWordsInWindow = (
	text: string,
	startMs: number,
	endMs: number,
	gapMs = 40,
): Caption[] => {
	const words = text.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];

	const totalGap = gapMs * (words.length - 1);
	const totalWeight = words.reduce((sum, w) => sum + w.length, 0);
	const available = Math.max(words.length * 60, endMs - startMs - totalGap);

	let cursor = startMs;
	const captions: Caption[] = [];

	for (const word of words) {
		const duration = (word.length / totalWeight) * available;
		const wordStart = cursor;
		const wordEnd = wordStart + duration;

		captions.push({
			text: `${word} `,
			startMs: wordStart,
			endMs: wordEnd,
			timestampMs: (wordStart + wordEnd) / 2,
			confidence: null,
		});

		cursor = wordEnd + gapMs;
	}

	return captions;
};

/** Berilgan Caption[] ning umumiy davomiyligini freymlarga aylantiradi (kichik "quyruq" bilan). */
export const durationInFramesFromCaptions = (
	captions: Caption[],
	fps: number,
	tailMs = 600,
): number => {
	const last = captions.at(-1);
	const totalMs = (last ? last.endMs : 0) + tailMs;
	return Math.max(1, Math.round((totalMs / 1000) * fps));
};
