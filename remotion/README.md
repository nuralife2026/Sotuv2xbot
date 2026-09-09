# Sotuv2x — Remotion video generatori

Yuklangan namunadagi (TikTok/Reels uslubidagi, spiker chiqishi + so'z-so'z
animatsion pastki sarlavha + qutili bayonotlar + katta raqamli slaydlar +
pul-broll'dagi glitch effekti) qisqa vertikal videolarni **kod orqali**
yaratish uchun Remotion loyihasi. Bot ichidagi `umumiy.json`,
`uy_sotish.json`, `mashina_sotish.json`, `tabiiy_mahsulot.json` fayllaridagi
matnlardan avtomatik video ssenariysi generatsiya qilib beradi.

## Nima ichida bor

- **Talking-head sahna** — spiker videosi ustida gapirilayotgan so'z katta va
  qalin chiqib, keyin kichrayadigan "karaoke" pastki sarlavha
  (`@remotion/captions`ning `createTikTokStyleCaptions`iga asoslangan).
- **Statement sahna** — chegaralangan, yarim shaffof quti ichida ketma-ket
  chiqadigan bayonotlar (pul/naqd pul kadridagi kabi).
- **Big-number sahna** — bitta katta sarlavha + kichik quyi matn (masalan
  "$1.000.000 topyapsiz").
- **Glitch effekti** — RGB-split / chromatic aberration, b-roll kadrlarda
  yoqish mumkin.
- Barcha matn/vaqt sozlamalari **JSON orqali** beriladi — xuddi botdagi
  `content/*.json` mantig'iga o'xshab, kod o'zgartirmasdan yangi video
  ssenariysi yozish mumkin.
- **Diktor ovozi** — `audioSrc` orqali har bir sahnaga audio biriktiriladi
  (`<Audio>`). Namuna video uchun ovoz `espeak-ng` bilan so'z-so'z
  generatsiya qilingan, shuning uchun pastki sarlavhalar aynan ovoz bilan
  mos keladi (taxminiy emas).

## O'rnatish

```bash
cd remotion
npm install
```

Diktor ovozini o'zingiz generatsiya qilmoqchi bo'lsangiz (`npm run
captions:from-content`), `espeak-ng` ham kerak:

```bash
sudo apt-get install espeak-ng   # Ubuntu/Debian
brew install espeak-ng           # macOS
```

Bu ixtiyoriy — `public/audio/*.wav` fayllari repo bilan birga keladi, shuning
uchun `espeak-ng` o'rnatilmagan bo'lsa ham `npm start` / `npm run build`
oddiy ishlayveradi.

## Ko'rish (Remotion Studio)

```bash
npm start
```

Brauzerda ochilib, `CaptionedVideo` kompozitsiyasini jonli tahrirlash bilan
ko'rsatadi. **Birinchi marta ishga tushirganda** Remotion headless Chrome'ni
avtomatik yuklab oladi (internet kerak) — bu sandbox muhitida bloklangan
bo'lishi mumkin, lekin oddiy kompyuter/CI serverda muammosiz ishlaydi.

## Videoni render qilish

```bash
npm run build
# natija: out/video.mp4 (1080x1920, 30fps)
```

## Bot kontentidan avtomatik video ssenariysi yasash

```bash
npm run captions:from-content
```

Bu `../umumiy.json` ("Sotuvni 2x oshirish sirlari") faylini o'qib,
`src/data/example-scenes.json` ga tayyor sahnalar ro'yxatini yozadi — bu fayl
`Root.tsx`da standart video sifatida ishlatiladi. Boshqa fayl (masalan
`uy_sotish.json`) uchun skript ichidagi yo'lni o'zgartiring yoki xuddi shu
naqshda o'zingiz JSON yozing.

## O'z ssenariyingizni yozish

`CaptionedVideoProps` — `{ scenes: Scene[] }`. Har bir sahna quyidagilardan
biri:

```ts
type TalkingHeadScene = {
  type: 'talking-head';
  durationInFrames: number;
  videoSrc?: string;       // public/ ga nisbatan, masalan "footage/spiker.mp4"
  audioSrc?: string;       // public/ ga nisbatan, masalan "audio/topic-0-headline.wav"
  glitch?: boolean;
  captions: Caption[];     // @remotion/captions turi: {text, startMs, endMs, ...}
};

type StatementScene = {
  type: 'statement';
  durationInFrames: number;
  videoSrc?: string;
  audioSrc?: string;
  glitch?: boolean;
  lines: string[];
};

type BigNumberScene = {
  type: 'big-number';
  durationInFrames: number;
  videoSrc?: string;
  audioSrc?: string;
  glitch?: boolean;
  headline: string;
  subline?: string;
};
```

`videoSrc` berilmasa fon avtomatik qorong'i gradient bilan chiziladi — demak
hech qanday video fayl bo'lmasa ham darhol preview qilish mumkin. `audioSrc`
berilmasa sahna shunchaki ovozsiz o'tadi.

### Diktor ovozini avtomatik generatsiya qilish (espeak-ng)

`src/utils/synthesizeVoiceover.ts`dagi `synthesizeVoiceover(words, outPath)`
har bir so'zni `espeak-ng` bilan alohida ovozga aylantirib, ularni bitta WAV
faylga birlashtiradi va HAQIQIY audio davomiyligiga mos `Caption[]`
qaytaradi — shuning uchun `generateFromContent.ts` yasagan namuna videoda
pastki sarlavhalar ovoz bilan aniq mos keladi (taxminiy emas):

```ts
import {synthesizeVoiceover} from './utils/synthesizeVoiceover';

const {captions, durationMs} = synthesizeVoiceover(
  'Bugun sizga muhim sirni aytaman'.split(' '),
  'public/audio/mening-sahnam.wav',
);
```

Bu — tez sinov/demo uchun ovoz. Tayyor mahsulot uchun `espeak-ng`ni
professional diktor yozuvi yoki sifatli TTS (masalan ElevenLabs) bilan
almashtirish tavsiya etiladi.

### Haqiqiy diktor yozuvi bilan aniq moslashtirish

Agar tayyor ovozli videongiz bo'lsa (masalan yuklagan namunangizdagi kabi
spiker chiqishi) va so'zlar aynan o'sha audio bilan mos kelishini
xohlasangiz, `@remotion/install-whisper-cpp` yordamida audio transkripsiya
qiling va natijadagi so'z-vaqt jadvalini to'g'ridan-to'g'ri `Caption[]`
sifatida `talking-head` sahnaga bering — komponentlar bunga tayyor, hech
narsa o'zgartirish shart emas. `audioSrc` maydoniga esa asl audio (yoki
video ichidagi audio) faylini ko'rsating.

Taxminiy vaqt jadvali kerak bo'lsa (audio yo'q, faqat matn bor holatlar
uchun), `src/utils/captionsFromScript.ts`dagi `captionsFromScript(matn)`
so'z uzunligiga qarab tezkor baho beradi — lekin haqiqiy ovoz bilan ishlaganda
yuqoridagi `synthesizeVoiceover` yoki Whisper natijasi ancha aniqroq.

## Papka tuzilishi

```
remotion/
├── src/
│   ├── index.ts                 # registerRoot
│   ├── Root.tsx                 # Composition ro'yxati + standart props
│   ├── CaptionedVideo.tsx       # Sahnalarni ketma-ket birlashtiruvchi asosiy komponent
│   ├── TalkingHeadCaptions.tsx  # Karaoke pastki sarlavha logikasi
│   ├── Page.tsx / Word.tsx      # Har bir so'zning kirish/kattalashish animatsiyasi
│   ├── StatementOverlay.tsx     # Qutili bayonot uslubi
│   ├── BigNumberOverlay.tsx     # Katta sarlavha uslubi
│   ├── Glitch.tsx               # RGB-split effekti
│   ├── SceneBackground.tsx      # Video fon yoki gradient
│   ├── types.ts / constants.ts
│   ├── utils/
│   │   ├── captionsFromScript.ts    # Matndan taxminiy vaqt jadvali
│   │   ├── synthesizeVoiceover.ts   # espeak-ng orqali so'z-so'z diktor ovozi
│   │   ├── wav.ts                   # Yengil WAV o'quvchi/yozuvchi/birlashtiruvchi
│   │   └── generateFromContent.ts   # umumiy.json → example-scenes.json + audio
│   └── data/example-scenes.json     # Avtomatik generatsiya qilingan namuna
├── public/footage/              # O'z video kliplaringiz shu yerga
└── public/audio/                # Diktor ovozi (namuna uchun generatsiya qilingan)
```
