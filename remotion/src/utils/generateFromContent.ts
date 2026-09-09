/**
 * Repo tub qismidagi umumiy.json ("Sotuvni 2x oshirish sirlari") faylidan
 * CaptionedVideo kompozitsiyasi uchun tayyor scenes.json generatsiya qiladi.
 *
 * Pastki sarlavhalarning vaqt jadvali aniq bo'lishi uchun matn espeak-ng
 * bilan (tinch fonda, faqat davomiylikni o'lchash maqsadida) sintez qilinadi
 * — lekin haqiqiy ovoz sifatida asl videodan olingan
 * `public/audio/original-soundtrack.mp3` fayli ishlatiladi (butun video
 * davomida bitta uzluksiz fon audio sifatida, kerak bo'lsa qayta-qayta
 * chalinadi).
 *
 * Talab: tizimda `espeak-ng` o'rnatilgan bo'lishi kerak (pastga qarang).
 *
 * Ishga tushirish:
 *   npm run captions:from-content
 *
 * Natija: src/data/example-scenes.json (Root.tsx shundan defaultProps oladi)
 *
 * Alohida props fayli sifatida ham ishlatish mumkin:
 *   npx remotion render src/index.ts CaptionedVideo out/video.mp4 \
 *     --props=src/data/example-scenes.json
 */
import {writeFileSync, readFileSync, mkdtempSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {tmpdir} from 'node:os';
import {FPS} from '../constants';
import type {Scene} from '../types';
import {synthesizeVoiceover, assertEspeakInstalled} from './synthesizeVoiceover';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const REMOTION_ROOT = join(__dirname, '..', '..');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'example-scenes.json');
// Faqat vaqt jadvalini o'lchash uchun — bu wav fayllar public/ ga yozilmaydi.
const SCRATCH_AUDIO_DIR = mkdtempSync(join(tmpdir(), 'sotuv2x-timing-'));
const SOUNDTRACK_REL_PATH = 'audio/original-soundtrack.mp3';
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

	if (!existsSync(join(REMOTION_ROOT, 'public', SOUNDTRACK_REL_PATH))) {
		console.warn(
			`⚠️  public/${SOUNDTRACK_REL_PATH} topilmadi — video ovozsiz chiqadi. ` +
				"Asl videodan audio chiqarib shu yo'lga qo'ying (ffmpeg -i video.mp4 -vn -acodec copy " +
				`public/${SOUNDTRACK_REL_PATH}).`,
		);
	}

	const raw = readFileSync(join(REPO_ROOT, 'umumiy.json'), 'utf-8');
	const data: Umumiy = JSON.parse(raw);

	const scenes: Scene[] = [];
	let scratchIndex = 0;
	const scratchWavPath = () => join(SCRATCH_AUDIO_DIR, `timing-${scratchIndex++}.wav`);

	// Intro — quti ichida ilgak (hook)
	const introWords = stripForSpeech(`${data.nomi}. Diqqat bilan tinglang.`).split(' ');
	const intro = synthesizeVoiceover(introWords, scratchWavPath());
	scenes.push({
		type: 'statement',
		durationInFrames: msToFrames(intro.durationMs),
		lines: [data.nomi, 'Diqqat bilan tinglang 👇'],
	});

	data.boblar.slice(0, MAX_TOPICS).forEach((bob) => {
		const headlineWords = stripForSpeech(bob.sarlavha).split(' ');
		const headline = synthesizeVoiceover(headlineWords, scratchWavPath());
		scenes.push({
			type: 'talking-head',
			durationInFrames: msToFrames(headline.durationMs, 800),
			captions: headline.captions,
		});

		const bodyWords = stripForSpeech(bob.matn).split(' ');
		const body = synthesizeVoiceover(bodyWords, scratchWavPath());
		scenes.push({
			type: 'statement',
			durationInFrames: msToFrames(body.durationMs, 700),
			lines: wrapIntoLines(bob.matn),
		});
	});

	// Outro — katta CTA
	const outroWords = stripForSpeech("Sotuv2xBot. Ko'proq maslahat uchun botga o'ting.").split(' ');
	const outro = synthesizeVoiceover(outroWords, scratchWavPath());
	scenes.push({
		type: 'big-number',
		durationInFrames: msToFrames(outro.durationMs, 700),
		headline: 'Sotuv2xBot',
		subline: "Ko'proq maslahat uchun botga o'ting",
	});

	const props = {scenes, audioSrc: SOUNDTRACK_REL_PATH, loopAudio: true};
	writeFileSync(OUTPUT_PATH, JSON.stringify(props, null, 2), 'utf-8');
	console.log(`✅ ${scenes.length} ta sahna yozildi: ${OUTPUT_PATH}`);
};

main();
