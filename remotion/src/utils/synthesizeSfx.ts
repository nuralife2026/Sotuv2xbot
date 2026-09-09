/**
 * Namuna sifatidagi qisqa "pop" tovushini dasturiy ravishda (hech qanday
 * tashqi audio fayl yoki internetsiz) generatsiya qiladi — pastki sarlavha
 * chiqqan paytda past ovozda eshitiladigan nozik urg'u effekti uchun.
 */
import {writeFileSync} from 'node:fs';
import {writeWav} from './wav';

const SAMPLE_RATE = 22050;

export const synthesizePop = (outPath: string): void => {
	const durationSec = 0.09;
	const numSamples = Math.round(SAMPLE_RATE * durationSec);
	const data = Buffer.alloc(numSamples * 2);

	const f0 = 1400;
	const f1 = 420;
	const decayRate = 32;

	for (let i = 0; i < numSamples; i++) {
		const t = i / SAMPLE_RATE;
		// Chiziqli chastota "chirp" fazasi: f(t) = f0 + (f1-f0)*t/duration
		const phase = 2 * Math.PI * (f0 * t + ((f1 - f0) * t * t) / (2 * durationSec));
		const envelope = Math.exp(-t * decayRate);
		const sample = Math.sin(phase) * envelope * 0.9;
		data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), i * 2);
	}

	writeFileSync(
		outPath,
		writeWav({sampleRate: SAMPLE_RATE, numChannels: 1, bitsPerSample: 16, data}),
	);
};
