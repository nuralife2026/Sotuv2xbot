/** Juda oddiy, bog'liqliksiz WAV (PCM) o'quvchi/yozuvchi — faqat espeak-ng chiqargan
 * fayllarni birlashtirish uchun yetarli. */

export type PcmWav = {
	sampleRate: number;
	numChannels: number;
	bitsPerSample: number;
	data: Buffer;
};

export const readWav = (buffer: Buffer): PcmWav => {
	if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
		throw new Error('WAV fayl emas yoki formati noto\'g\'ri');
	}

	let offset = 12;
	let sampleRate = 0;
	let numChannels = 0;
	let bitsPerSample = 0;
	let data: Buffer | null = null;

	while (offset < buffer.length) {
		const chunkId = buffer.toString('ascii', offset, offset + 4);
		const chunkSize = buffer.readUInt32LE(offset + 4);
		const chunkStart = offset + 8;

		if (chunkId === 'fmt ') {
			numChannels = buffer.readUInt16LE(chunkStart + 2);
			sampleRate = buffer.readUInt32LE(chunkStart + 4);
			bitsPerSample = buffer.readUInt16LE(chunkStart + 14);
		} else if (chunkId === 'data') {
			data = buffer.subarray(chunkStart, chunkStart + chunkSize);
		}

		offset = chunkStart + chunkSize + (chunkSize % 2);
	}

	if (!data) {
		throw new Error('WAV faylda "data" chunk topilmadi');
	}

	return {sampleRate, numChannels, bitsPerSample, data};
};

export const writeWav = ({sampleRate, numChannels, bitsPerSample, data}: PcmWav): Buffer => {
	const blockAlign = numChannels * (bitsPerSample / 8);
	const byteRate = sampleRate * blockAlign;
	const header = Buffer.alloc(44);

	header.write('RIFF', 0, 'ascii');
	header.writeUInt32LE(36 + data.length, 4);
	header.write('WAVE', 8, 'ascii');
	header.write('fmt ', 12, 'ascii');
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20); // PCM
	header.writeUInt16LE(numChannels, 22);
	header.writeUInt32LE(sampleRate, 24);
	header.writeUInt32LE(byteRate, 28);
	header.writeUInt16LE(blockAlign, 32);
	header.writeUInt16LE(bitsPerSample, 34);
	header.write('data', 36, 'ascii');
	header.writeUInt32LE(data.length, 40);

	return Buffer.concat([header, data]);
};

export const silence = (ms: number, wav: Pick<PcmWav, 'sampleRate' | 'numChannels' | 'bitsPerSample'>): Buffer => {
	const bytesPerSample = wav.bitsPerSample / 8;
	const numSamples = Math.round((ms / 1000) * wav.sampleRate) * wav.numChannels;
	return Buffer.alloc(numSamples * bytesPerSample);
};
