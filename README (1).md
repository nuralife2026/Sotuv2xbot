# Sotuv Yordamchi Bot

Sotuv operatorlari uchun bilim bazasi + AI maslahatchi Telegram bot.

## Bot nima qiladi
- Sohalar bo'yicha (uy sotish, mashina sotish, tabiiy mahsulot) tayyor:
  - **Skriptlar** — qo'ng'iroq, uchrashuv, bitim yopish uchun tayyor matnlar
  - **Xatoliklar** — operatorlar eng ko'p qiladigan xatolar va yechimi
  - **Formulalar** — AIDA, FAB, PAS kabi sotuv formulalari
- **Sotuvni 2x oshirish sirlari** — umumiy, barcha sohaga tegishli maslahatlar
- **Erkin savol** — operator o'z savolini yozadi, bot bazadagi barcha material asosida AI orqali javob beradi (Anthropic API kaliti kerak, ixtiyoriy)

## Ishga tushirish

```bash
cd sotuv_bot
pip install -r requirements.txt
cp .env.example .env
# .env faylini oching va BOT_TOKEN ni kiriting (@BotFather dan olinadi)
# ANTHROPIC_API_KEY ixtiyoriy - erkin savol funksiyasi uchun kerak
python bot.py
```

## Telegram bot tokenini olish
1. Telegramda @BotFather ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting, tokenni oling
4. Tokenni `.env` fayliga qo'ying

## Yangi kontent qo'shish

Barcha material `content/` papkasidagi JSON fayllarda:
- `uy_sotish.json`
- `mashina_sotish.json`
- `tabiiy_mahsulot.json`
- `umumiy.json`

Har bir faylni ochib, xuddi shu formatda yangi `sarlavha` va `matn` qo'shsangiz bo'ldi — kod o'zgartirish shart emas.

### Yangi soha (masalan "Kiyim-kechak sotish") qo'shish
1. `content/kiyim_sotish.json` faylini xuddi shu formatda yarating
2. `bot.py` faylida `CONTENT_FILES` lug'atiga qo'shing:
   ```python
   CONTENT_FILES = {
       "uy_sotish": "uy_sotish.json",
       "mashina_sotish": "mashina_sotish.json",
       "tabiiy_mahsulot": "tabiiy_mahsulot.json",
       "kiyim_sotish": "kiyim_sotish.json",  # yangi qator
   }
   ```
3. `asosiy_menu()` funksiyasiga yangi tugma qo'shing:
   ```python
   kb.button(text="👕 Kiyim sotish", callback_data="soha:kiyim_sotish")
   ```

## YouTube/Google'dan material yig'ish haqida
Botning o'zi YouTube'ni avtomatik skanerlamaydi — bu alohida jarayon:
1. Siz (yoki jamoangiz) YouTube videolarini tomosha qilib, muhim skript/formula/xatolarni yozib olasiz
2. Shu ma'lumotni tegishli JSON faylga qo'shasiz (yuqoridagi format bo'yicha)
3. Bot darhol yangi materialni operatorlarga ko'rsata boshlaydi

Agar xohlasangiz, keyingi bosqichda YouTube subtitrlarini avtomatik yuklab olib, undan qisqacha xulosa chiqaradigan yordamchi skript ham qo'shib beraman — shunda kontent qo'shish tezroq bo'ladi.

## Fayl tuzilishi
```
sotuv_bot/
├── bot.py                  # Asosiy bot kodi
├── requirements.txt
├── .env.example
├── content/
│   ├── uy_sotish.json
│   ├── mashina_sotish.json
│   ├── tabiiy_mahsulot.json
│   └── umumiy.json
└── README.md
```
