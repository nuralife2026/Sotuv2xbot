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
- **Ovoz** — butun video davomida bitta uzluksiz fon audio chaladi
  (`audioSrc`, kerak bo'lsa avtomatik qayta-qayta — `loopAudio`). Namuna
  videoda bu **yuklagan asl videongizdan chiqarib olingan haqiqiy audio**
  (`public/audio/original-soundtrack.mp3`). Pastki sarlavhalarning vaqt
  jadvali esa alohida — `espeak-ng` bilan matndan hisoblanadi (pastga
  qarang), shuning uchun so'zlar tabiiy sur'atda almashinadi.

## O'rnatish

```bash
cd remotion
npm install
```

Ssenariyni o'zingiz qayta generatsiya qilmoqchi bo'lsangiz (`npm run
captions:from-content` — bu faqat pastki sarlavhalar vaqt jadvalini
hisoblash uchun `espeak-ng`dan foydalanadi), u ham kerak:

```bash
sudo apt-get install espeak-ng   # Ubuntu/Debian
brew install espeak-ng           # macOS
```

Bu ixtiyoriy — `src/data/example-scenes.json` va `public/audio/*.mp3` repo
bilan birga keladi, shuning uchun `espeak-ng` o'rnatilmagan bo'lsa ham
`npm start` / `npm run build` oddiy ishlayveradi.

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

`CaptionedVideoProps`:

```ts
type CaptionedVideoProps = {
  scenes: Scene[];
  audioSrc?: string;   // public/ ga nisbatan, masalan "audio/original-soundtrack.mp3"
                        // — butun video davomida chaladigan yagona fon audio
  loopAudio?: boolean;  // audioSrc videodan qisqa bo'lsa qayta-qayta chalinsinmi (standart: true)
};
```

Har bir sahna quyidagilardan biri:

```ts
type TalkingHeadScene = {
  type: 'talking-head';
  durationInFrames: number;
  videoSrc?: string;       // public/ ga nisbatan, masalan "footage/spiker.mp4"
  audioSrc?: string;       // ixtiyoriy: shu sahnaga xos qo'shimcha audio/effekt
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
hech qanday video fayl bo'lmasa ham darhol preview qilish mumkin. Sahnadagi
`audioSrc` faqat qo'shimcha effekt/sfx uchun — asosiy ovoz yuqoridagi
**global** `audioSrc` orqali beriladi.

### Pastki sarlavhalar vaqt jadvalini avtomatik generatsiya qilish (espeak-ng)

`src/utils/synthesizeVoiceover.ts`dagi `synthesizeVoiceover(words, outPath)`
har bir so'zni `espeak-ng` bilan alohida ovozga aylantirib, ularning HAQIQIY
davomiyligidan `Caption[]` (startMs/endMs) hisoblab chiqadi — bu faqat vaqt
o'lchash uchun, natijadagi wav fayllar hech qayerda ishlatilmaydi:

```ts
import {synthesizeVoiceover} from './utils/synthesizeVoiceover';

const {captions, durationMs} = synthesizeVoiceover(
  'Bugun sizga muhim sirni aytaman'.split(' '),
  '/tmp/faqat-vaqt-olchash.wav',
);
```

### Asl videodan ovozni ishlatish

`generateFromContent.ts` aynan shunday ishlaydi: `public/audio/original-soundtrack.mp3`
yuklagan namuna videongizdan ffmpeg bilan ajratib olingan haqiqiy audio, va u
`CaptionedVideoProps.audioSrc` orqali butun video davomida (kerak bo'lsa
qayta-qayta) chalinadi:

```bash
ffmpeg -i asl-video.mp4 -vn -acodec libmp3lame -b:a 128k public/audio/original-soundtrack.mp3
```

Agar so'zlarning ekranga chiqishi aynan shu audiodagi nutq bilan mos
kelishini xohlasangiz (haqiqiy lip-sync), `@remotion/install-whisper-cpp`
yordamida audioni transkripsiya qiling va natijadagi so'z-vaqt jadvalini
to'g'ridan-to'g'ri `Caption[]` sifatida `talking-head` sahnaga bering —
komponentlar bunga tayyor, hech narsa o'zgartirish shart emas.

Taxminiy vaqt jadvali kerak bo'lsa (audio yo'q, faqat matn bor holatlar
uchun), `src/utils/captionsFromScript.ts`dagi `captionsFromScript(matn)`
so'z uzunligiga qarab tezkor baho beradi.

> **Eslatma:** boshqa odam/kanaldan yuklab olingan videoning audiosini
> ishlatishdan oldin, uni qayta tarqatish/nashr qilish huquqingiz borligiga
> ishonch hosil qiling.

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
│   │   ├── synthesizeVoiceover.ts   # espeak-ng orqali so'z-so'z vaqt o'lchash
│   │   ├── wav.ts                   # Yengil WAV o'quvchi/yozuvchi/birlashtiruvchi
│   │   └── generateFromContent.ts   # umumiy.json → example-scenes.json
│   └── data/example-scenes.json     # Avtomatik generatsiya qilingan namuna
├── public/footage/              # O'z video kliplaringiz shu yerga
└── public/audio/                # Fon ovoz (original-soundtrack.mp3 — asl videodan)
```
