"""
Sotuv Operatorlari uchun Yordamchi Bot
========================================
Bu bot sotuv operatorlariga (uy, mashina, tabiiy mahsulot va h.k. sohalarida)
tayyor skriptlar, xatoliklar tahlili, sotuv formulalari va 2x oshirish
sirlarini taqdim etadi. Bundan tashqari, erkin savolga AI (Claude API)
orqali javob beradi.

ISHGA TUSHIRISH:
1. pip install -r requirements.txt
2. .env faylida BOT_TOKEN va (ixtiyoriy) ANTHROPIC_API_KEY ni kiriting
3. python bot.py

Yangi kontent qo'shish uchun content/ papkasidagi JSON fayllarni tahrirlang
yoki yangi fayl qo'shib, CONTENT_FILES ro'yxatiga kiriting.
"""

import asyncio
import json
import logging
import os
from pathlib import Path

from aiogram import Bot, Dispatcher, F, Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
CONTENT_DIR = BASE_DIR / "content"

BOT_TOKEN = os.getenv("BOT_TOKEN", "PUT_YOUR_BOT_TOKEN_HERE")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Har bir soha uchun fayl nomi va tugma matni
CONTENT_FILES = {
    "uy_sotish": "uy_sotish.json",
    "mashina_sotish": "mashina_sotish.json",
    "tabiiy_mahsulot": "tabiiy_mahsulot.json",
}
UMUMIY_FILE = "umumiy.json"

BOLIM_NOMLARI = {
    "skriptlar": "📜 Skriptlar",
    "xatoliklar": "⚠️ Sotuvdagi xatoliklar",
    "formulalar": "🧩 Sotuv formulalari",
}


def load_json(filename: str) -> dict:
    path = CONTENT_DIR / filename
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all_content_text() -> str:
    """AI uchun barcha kontentni bitta matnga yig'ish (kontekst sifatida)."""
    parts = []
    for key, fname in CONTENT_FILES.items():
        data = load_json(fname)
        if not data:
            continue
        parts.append(f"\n### {data.get('nomi', key)} ###")
        for bolim_key in ("skriptlar", "xatoliklar", "formulalar"):
            for item in data.get(bolim_key, []):
                parts.append(f"- [{bolim_key}] {item['sarlavha']}: {item['matn']}")
    umumiy = load_json(UMUMIY_FILE)
    if umumiy:
        parts.append(f"\n### {umumiy.get('nomi')} ###")
        for item in umumiy.get("boblar", []):
            parts.append(f"- {item['sarlavha']}: {item['matn']}")
    return "\n".join(parts)


router = Router()


class SavolState(StatesGroup):
    kutilmoqda = State()


def asosiy_menu():
    kb = InlineKeyboardBuilder()
    kb.button(text="🏠 Uy sotish", callback_data="soha:uy_sotish")
    kb.button(text="🚗 Mashina sotish", callback_data="soha:mashina_sotish")
    kb.button(text="🌿 Tabiiy mahsulotlar", callback_data="soha:tabiiy_mahsulot")
    kb.button(text="📈 Sotuvni 2x oshirish sirlari", callback_data="umumiy")
    kb.button(text="❓ Savol berish (AI yordamchi)", callback_data="savol_ber")
    kb.adjust(1)
    return kb.as_markup()


def soha_menu(soha_key: str):
    kb = InlineKeyboardBuilder()
    for bolim_key, bolim_nomi in BOLIM_NOMLARI.items():
        kb.button(text=bolim_nomi, callback_data=f"bolim:{soha_key}:{bolim_key}")
    kb.button(text="⬅️ Orqaga", callback_data="bosh_menu")
    kb.adjust(1)
    return kb.as_markup()


def items_menu(soha_key: str, bolim_key: str, items: list):
    kb = InlineKeyboardBuilder()
    for idx, item in enumerate(items):
        kb.button(text=item["sarlavha"][:60], callback_data=f"item:{soha_key}:{bolim_key}:{idx}")
    kb.button(text="⬅️ Orqaga", callback_data=f"soha:{soha_key}")
    kb.adjust(1)
    return kb.as_markup()


def orqaga_tugma(callback_data: str):
    kb = InlineKeyboardBuilder()
    kb.button(text="⬅️ Orqaga", callback_data=callback_data)
    return kb.as_markup()


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "👋 Assalomu alaykum!\n\n"
        "Men <b>Sotuv Yordamchi Bot</b>man. Sizga sotuv skriptlari, "
        "eng ko'p uchraydigan xatoliklar, sotuv formulalari va "
        "sotuvni oshirish sirlarini taqdim etaman.\n\n"
        "Kerakli bo'limni tanlang 👇",
        reply_markup=asosiy_menu(),
    )


@router.callback_query(F.data == "bosh_menu")
async def cb_bosh_menu(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.message.edit_text("Kerakli bo'limni tanlang 👇", reply_markup=asosiy_menu())
    await callback.answer()


@router.callback_query(F.data.startswith("soha:"))
async def cb_soha(callback: CallbackQuery):
    soha_key = callback.data.split(":")[1]
    fname = CONTENT_FILES.get(soha_key)
    data = load_json(fname)
    nomi = data.get("nomi", soha_key)
    await callback.message.edit_text(
        f"<b>{nomi}</b>\n\nQaysi bo'lim kerak?",
        reply_markup=soha_menu(soha_key),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("bolim:"))
async def cb_bolim(callback: CallbackQuery):
    _, soha_key, bolim_key = callback.data.split(":")
    fname = CONTENT_FILES.get(soha_key)
    data = load_json(fname)
    items = data.get(bolim_key, [])
    if not items:
        await callback.answer("Hozircha bu bo'limda material yo'q.", show_alert=True)
        return
    await callback.message.edit_text(
        f"<b>{BOLIM_NOMLARI.get(bolim_key)}</b>\n\nKerakli mavzuni tanlang:",
        reply_markup=items_menu(soha_key, bolim_key, items),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("item:"))
async def cb_item(callback: CallbackQuery):
    _, soha_key, bolim_key, idx = callback.data.split(":")
    fname = CONTENT_FILES.get(soha_key)
    data = load_json(fname)
    items = data.get(bolim_key, [])
    item = items[int(idx)]
    matn = f"<b>{item['sarlavha']}</b>\n\n{item['matn']}"
    await callback.message.edit_text(
        matn, reply_markup=orqaga_tugma(f"bolim:{soha_key}:{bolim_key}")
    )
    await callback.answer()


@router.callback_query(F.data == "umumiy")
async def cb_umumiy(callback: CallbackQuery):
    data = load_json(UMUMIY_FILE)
    kb = InlineKeyboardBuilder()
    for idx, item in enumerate(data.get("boblar", [])):
        kb.button(text=item["sarlavha"][:60], callback_data=f"umumiy_item:{idx}")
    kb.button(text="⬅️ Orqaga", callback_data="bosh_menu")
    kb.adjust(1)
    await callback.message.edit_text(
        f"<b>{data.get('nomi')}</b>\n\nMavzuni tanlang:", reply_markup=kb.as_markup()
    )
    await callback.answer()


@router.callback_query(F.data.startswith("umumiy_item:"))
async def cb_umumiy_item(callback: CallbackQuery):
    idx = int(callback.data.split(":")[1])
    data = load_json(UMUMIY_FILE)
    item = data["boblar"][idx]
    matn = f"<b>{item['sarlavha']}</b>\n\n{item['matn']}"
    await callback.message.edit_text(matn, reply_markup=orqaga_tugma("umumiy"))
    await callback.answer()


@router.callback_query(F.data == "savol_ber")
async def cb_savol_ber(callback: CallbackQuery, state: FSMContext):
    await state.set_state(SavolState.kutilmoqda)
    await callback.message.edit_text(
        "✍️ Savolingizni yozing (masalan: \"mijoz narx qimmat deyapti, nima deyman?\").\n\n"
        "Men bazadagi barcha materiallar asosida javob beraman.",
        reply_markup=orqaga_tugma("bosh_menu"),
    )
    await callback.answer()


@router.message(SavolState.kutilmoqda)
async def savolga_javob(message: Message, state: FSMContext):
    savol = message.text
    await message.answer("⏳ Javob tayyorlanmoqda...")

    if not ANTHROPIC_API_KEY:
        await message.answer(
            "⚠️ AI yordamchi hozircha sozlanmagan (ANTHROPIC_API_KEY kiritilmagan). "
            "Iltimos, .env fayliga API kalitini qo'shing.\n\n"
            "Hozircha yuqoridagi menyudagi tayyor materiallardan foydalaning.",
            reply_markup=asosiy_menu(),
        )
        await state.clear()
        return

    try:
        javob = await ai_javob_ol(savol)
    except Exception as e:
        logger.exception("AI xatolik")
        javob = f"Kechirasiz, javob olishda xatolik yuz berdi: {e}"

    await message.answer(javob, reply_markup=asosiy_menu())
    await state.clear()


async def ai_javob_ol(savol: str) -> str:
    """Anthropic API orqali, bazadagi kontentni kontekst sifatida berib javob olish."""
    import httpx

    kontekst = load_all_content_text()
    system_prompt = (
        "Sen sotuv operatorlariga yordam beruvchi maslahatchisan. "
        "Quyidagi bilim bazasidan foydalanib, operatorning savoliga aniq, "
        "amaliy va qisqa (5-8 gapdan oshmasin) javob ber. O'zbek tilida javob ber.\n\n"
        f"BILIM BAZASI:\n{kontekst}"
    )
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-6",
                "max_tokens": 500,
                "system": system_prompt,
                "messages": [{"role": "user", "content": savol}],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return "".join(block.get("text", "") for block in data.get("content", []))


@router.message(Command("yordam"))
async def cmd_yordam(message: Message):
    await message.answer(
        "ℹ️ Bot buyruqlari:\n"
        "/start — asosiy menyu\n"
        "/yordam — shu xabar\n\n"
        "Menyudagi tugmalar orqali sohangizni tanlang va kerakli materialni oling."
    )


async def main():
    if BOT_TOKEN == "PUT_YOUR_BOT_TOKEN_HERE":
        print("⚠️  DIQQAT: .env fayliga haqiqiy BOT_TOKEN kiritilmagan!")
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher()
    dp.include_router(router)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
