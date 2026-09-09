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

## O'rnatish

```bash
cd remotion
npm install
```

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
  glitch?: boolean;
  captions: Caption[];     // @remotion/captions turi: {text, startMs, endMs, ...}
};

type StatementScene = {
  type: 'statement';
  durationInFrames: number;
  videoSrc?: string;
  glitch?: boolean;
  lines: string[];
};

type BigNumberScene = {
  type: 'big-number';
  durationInFrames: number;
  videoSrc?: string;
  glitch?: boolean;
  headline: string;
  subline?: string;
};
```

`videoSrc` berilmasa fon avtomatik qorong'i gradient bilan chiziladi — demak
hech qanday video fayl bo'lmasa ham darhol preview qilish mumkin.

### Karaoke pastki sarlavha vaqtlarini qo'lda yozish

Haqiqiy audio bo'lmasa, `src/utils/captionsFromScript.ts`dagi
`captionsFromScript(matn)` funksiyasi so'z uzunligiga qarab taxminiy vaqt
jadvali chiqarib beradi:

```ts
import {captionsFromScript, durationInFramesFromCaptions} from './utils/captionsFromScript';
import {FPS} from './constants';

const captions = captionsFromScript('Bugun sizga muhim sirni aytaman');
const durationInFrames = durationInFramesFromCaptions(captions, FPS);
```

### Haqiqiy audio bilan aniq moslashtirish

Agar o'zingizning ovozli videongiz bo'lsa va so'zlar aniq audio bilan mos
kelishini xohlasangiz, `@remotion/install-whisper-cpp` yordamida audio
transkripsiya qiling va natijadagi so'z-vaqt jadvalini to'g'ridan-to'g'ri
`Caption[]` sifatida `talking-head` sahnaga bering — komponentlar bunga
tayyor, hech narsa o'zgartirish shart emas.

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
│   │   └── generateFromContent.ts   # umumiy.json → example-scenes.json
│   └── data/example-scenes.json     # Avtomatik generatsiya qilingan namuna
└── public/footage/              # O'z video kliplaringiz shu yerga
```
