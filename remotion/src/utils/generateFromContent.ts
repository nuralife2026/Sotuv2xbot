/**
 * Repo tub qismidagi umumiy.json ("Sotuvni 2x oshirish sirlari") faylidan
 * CaptionedVideo kompozitsiyasi uchun tayyor scenes.json va diktor ovozini
 * (espeak-ng orqali, so'z-so'z) generatsiya qiladi — shu bilan pastki
 * sarlavhalar HAQIQIY audio davomiyligiga mos keladi.
 *
 * Talab: tizimda `espeak-ng` o'rnatilgan bo'lishi kerak (pastga qarang).
 *
 * Ishga tushirish:
 *   npm run captions:from-content
 *
 * Natija:
 *   - src/data/example-scenes.json (Root.tsx shundan defaultProps oladi)
 *   - public/audio/*.wav (diktor ovozi)
 *
 * Alohida props fayli sifatida ham ishlatish mumkin:
 *   npx remotion render src/index.ts CaptionedVideo out/video.mp4 \
 *     --props=src/data/example-scenes.json
 */
import {writeFileSync, readFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {FPS} from '../constants';
import type {Scene} from '../types';
import {synthesizeVoiceover, assertEspeakInstalled} from './synthesizeVoiceover';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const REMOTION_ROOT = join(__dirname, '..', '..');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'example-scenes.json');
const AUDIO_DIR = join(REMOTION_ROOT, 'public', 'audio');
const MAX_TOPICS = 3;
const TAIL_MS = 500;

type Bob = {sarlavha: string; matn: string};
type Umumiy = {nomi: string; boblar: Bob[]};

const wrapIntoLines = (text: string, maxCharsPerLine = 46): string[] => {
	const words = text.split(/\s+/);
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (candidate.length > maxCharsPerLine && current) {
			lines.push(current);
			current = word;
		} else {
			current = candidate;
		}
	}
	if (current) lines.push(current);
	return lines;
};

/** Diktor uchun matnni tozalaydi — emoji va notinch belgilarni olib tashlaydi. */
const stripForSpeech = (text: string): string =>
	text
		.replace(/[^\p{L}\p{N}\s.,!?'’—-]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const msToFrames = (ms: number, tailMs = TAIL_MS) => Math.max(1, Math.round(((ms + tailMs) / 1000) * FPS));

const main = () => {
	assertEspeakInstalled();
	mkdirSync(AUDIO_DIR, {recursive: true});

	const raw = readFileSync(join(REPO_ROOT, 'umumiy.json'), 'utf-8');
	const data: Umumiy = JSON.parse(raw);

	const scenes: Scene[] = [];

	// Intro — quti ichida ilgak (hook)
	const introWords = stripForSpeech(`${data.nomi}. Diqqat bilan tinglang.`).split(' ');
	const intro = synthesizeVoiceover(introWords, join(AUDIO_DIR, 'intro.wav'));
	scenes.push({
		type: 'statement',
		durationInFrames: msToFrames(intro.durationMs),
		audioSrc: 'audio/intro.wav',
		lines: [data.nomi, 'Diqqat bilan tinglang 👇'],
	});

	data.boblar.slice(0, MAX_TOPICS).forEach((bob, i) => {
		const headlineWords = stripForSpeech(bob.sarlavha).split(' ');
		const headline = synthesizeVoiceover(headlineWords, join(AUDIO_DIR, `topic-${i}-headline.wav`));
		scenes.push({
			type: 'talking-head',
			durationInFrames: msToFrames(headline.durationMs, 800),
			audioSrc: `audio/topic-${i}-headline.wav`,
			captions: headline.captions,
		});

		const bodyWords = stripForSpeech(bob.matn).split(' ');
		const body = synthesizeVoiceover(bodyWords, join(AUDIO_DIR, `topic-${i}-body.wav`));
		scenes.push({
			type: 'statement',
			durationInFrames: msToFrames(body.durationMs, 700),
			audioSrc: `audio/topic-${i}-body.wav`,
			lines: wrapIntoLines(bob.matn),
		});
	});

	// Outro — katta CTA
	const outroWords = stripForSpeech("Sotuv2xBot. Ko'proq maslahat uchun botga o'ting.").split(' ');
	const outro = synthesizeVoiceover(outroWords, join(AUDIO_DIR, 'outro.wav'));
	scenes.push({
		type: 'big-number',
		durationInFrames: msToFrames(outro.durationMs, 700),
		audioSrc: 'audio/outro.wav',
		headline: 'Sotuv2xBot',
		subline: "Ko'proq maslahat uchun botga o'ting",
	});

	const props = {scenes};
	writeFileSync(OUTPUT_PATH, JSON.stringify(props, null, 2), 'utf-8');
	console.log(`✅ ${scenes.length} ta sahna va diktor ovozi yozildi: ${OUTPUT_PATH}`);
};

main();
