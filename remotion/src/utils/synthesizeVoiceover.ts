/**
 * Matnni so'z-so'z espeak-ng bilan ovozga aylantiradi va HAQIQIY audio
 * davomiyligiga mos Caption[] (startMs/endMs) qaytaradi — shuning uchun
 * pastki sarlavhalar ekrandagi ovoz bilan aniq mos keladi (taxminiy emas).
 *
 * Talab: tizimda `espeak-ng` o'rnatilgan bo'lishi kerak.
 *   Ubuntu/Debian: sudo apt-get install espeak-ng
 *   macOS:         brew install espeak-ng
 *   Windows:       https://github.com/espeak-ng/espeak-ng/releases
 *
 * Bu — DEMO/placeholder ovoz. Tayyor mahsulot uchun buni professional diktor
 * yozuvi yoki sifatli TTS (masalan ElevenLabs) bilan almashtiring: shunchaki
 * public/audio/ ga tayyor audio qo'yib, sahnaga real Caption[] (haqiqiy
 * transkripsiya vaqtlari bilan) bering — qolgan komponentlar o'zgarishsiz ishlayveradi.
 */
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {Caption} from '@remotion/captions';
import {readWav, silence, writeWav, type PcmWav} from './wav';

const WORD_GAP_MS = 70;
const SENTENCE_GAP_EXTRA_MS = 260;
const ESPEAK_VOICE = 'uz';
const ESPEAK_SPEED_WPM = 165;

const endsWithSentencePunctuation = (word: string) => /[.!?…]$/.test(word);

export const assertEspeakInstalled = () => {
	try {
		execFileSync('espeak-ng', ['--version'], {stdio: 'ignore'});
	} catch {
		throw new Error(
			"espeak-ng topilmadi. O'rnating: `apt-get install espeak-ng` (Linux) yoki " +
				'`brew install espeak-ng` (macOS), keyin qayta urinib ko\'ring.',
		);
	}
};

export const synthesizeVoiceover = (
	words: string[],
	outWavPath: string,
): {captions: Caption[]; durationMs: number} => {
	assertEspeakInstalled();

	const tmpDir = mkdtempSync(join(tmpdir(), 'sotuv2x-tts-'));
	const captions: Caption[] = [];
	const chunks: Buffer[] = [];
	let format: Pick<PcmWav, 'sampleRate' | 'numChannels' | 'bitsPerSample'> | null = null;
	let cursorMs = 0;

	try {
		for (const rawWord of words) {
			const word = rawWord.trim();
			if (!word) continue;

			const wordPath = join(tmpDir, `word-${captions.length}.wav`);
			execFileSync('espeak-ng', [
				'-v',
				ESPEAK_VOICE,
				'-s',
				String(ESPEAK_SPEED_WPM),
				'-w',
				wordPath,
				word,
			]);

			const wav = readWav(readFileSync(wordPath));
			if (!format) {
				format = {
					sampleRate: wav.sampleRate,
					numChannels: wav.numChannels,
					bitsPerSample: wav.bitsPerSample,
				};
			}

			const durationMs = (wav.data.length / (wav.numChannels * (wav.bitsPerSample / 8)) / wav.sampleRate) * 1000;
			const startMs = cursorMs;
			const endMs = startMs + durationMs;

			captions.push({
				text: `${word} `,
				startMs,
				endMs,
				timestampMs: (startMs + endMs) / 2,
				confidence: null,
			});

			chunks.push(wav.data);

			const gap = WORD_GAP_MS + (endsWithSentencePunctuation(word) ? SENTENCE_GAP_EXTRA_MS : 0);
			chunks.push(silence(gap, wav));
			cursorMs = endMs + gap;
		}
	} finally {
		rmSync(tmpDir, {recursive: true, force: true});
	}

	if (!format) {
		return {captions: [], durationMs: 0};
	}

	const combined = writeWav({...format, data: Buffer.concat(chunks)});
	writeFileSync(outWavPath, combined);

	return {captions, durationMs: cursorMs};
};
