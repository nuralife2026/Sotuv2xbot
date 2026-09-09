/**
 * Repo tub qismidagi umumiy.json ("Sotuvni 2x oshirish sirlari") faylidan
 * CaptionedVideo kompozitsiyasi uchun tayyor scenes.json generatsiya qiladi.
 *
 * Ishga tushirish:
 *   npm run captions:from-content
 *
 * Natija: src/data/example-scenes.json (Root.tsx shundan defaultProps oladi)
 * Alohida props fayli sifatida ham ishlatish mumkin:
 *   npx remotion render src/index.ts CaptionedVideo out/video.mp4 \
 *     --props=src/data/example-scenes.json
 */
import {writeFileSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {FPS} from '../constants';
import type {Scene} from '../types';
import {captionsFromScript, durationInFramesFromCaptions} from './captionsFromScript';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const OUTPUT_PATH = join(__dirname, '..', 'data', 'example-scenes.json');
const MAX_TOPICS = 3;

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

const main = () => {
	const raw = readFileSync(join(REPO_ROOT, 'umumiy.json'), 'utf-8');
	const data: Umumiy = JSON.parse(raw);

	const scenes: Scene[] = [];

	// Intro — quti ichida ilgak (hook)
	scenes.push({
		type: 'statement',
		durationInFrames: Math.round(2.6 * FPS),
		lines: [data.nomi, 'Diqqat bilan tinglang 👇'],
	});

	for (const bob of data.boblar.slice(0, MAX_TOPICS)) {
		const headlineCaptions = captionsFromScript(bob.sarlavha);
		scenes.push({
			type: 'talking-head',
			durationInFrames: durationInFramesFromCaptions(headlineCaptions, FPS, 900),
			captions: headlineCaptions,
		});

		scenes.push({
			type: 'statement',
			durationInFrames: Math.round(3.4 * FPS),
			lines: wrapIntoLines(bob.matn),
		});
	}

	// Outro — katta CTA
	scenes.push({
		type: 'big-number',
		durationInFrames: Math.round(2.4 * FPS),
		headline: 'Sotuv2xBot',
		subline: "Ko'proq maslahat uchun botga o'ting",
	});

	const props = {scenes};
	writeFileSync(OUTPUT_PATH, JSON.stringify(props, null, 2), 'utf-8');
	console.log(`✅ ${scenes.length} ta sahna yozildi: ${OUTPUT_PATH}`);
};

main();
