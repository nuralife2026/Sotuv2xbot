/** Bir martalik skript: public/audio/pop.wav faylini generatsiya qiladi. */
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {synthesizePop} from './synthesizeSfx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = join(__dirname, '..', '..', 'public', 'audio');

mkdirSync(AUDIO_DIR, {recursive: true});
synthesizePop(join(AUDIO_DIR, 'pop.wav'));
console.log('✅ public/audio/pop.wav yaratildi');
