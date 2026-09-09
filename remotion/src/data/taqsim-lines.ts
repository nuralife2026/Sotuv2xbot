import type {FootageLine} from '../types';

/**
 * public/footage/taqsim-promo.mp4 uchun sarlavha skripti.
 *
 * Vaqt chegaralari (startMs/endMs) videoning O'ZIDAGI haqiqiy nutq
 * pauzalaridan olingan (ffmpeg silencedetect, noise=-30dB, d=0.35):
 *   0.00–2.41s | 2.94–9.59s | 10.03–29.82s | 30.18–38.50s
 *
 * Uzun (10.03–29.82s) segment uch qismga bo'lingan — bitta ekranda faqat
 * bir necha so'z ko'rinishi uchun (uzluksiz paragraf emas), lekin umumiy
 * chegaralar segmentdan chiqmaydi.
 */
export const taqsimLines: FootageLine[] = [
	{
		text: "Xodimlaringiz sizdan tez-tez avans so'raydimi?",
		startMs: 0,
		endMs: 2410,
		icon: 'question',
	},
	{
		text: 'Har safar buxgalter hisob-kitob qilishi, rahbar tasdiqlashi — bu ortiqcha vaqt talab qiladi.',
		startMs: 2938,
		endMs: 9586,
		icon: 'clock',
	},
	{
		text: 'Taqsim — aynan shu muammoni hal qilish uchun yaratilgan zamonaviy HR yechim.',
		startMs: 10028,
		endMs: 16812,
		icon: 'check',
	},
	{
		text: "Xodimlaringiz ilovada o'zi avans so'raydi, siz esa bir tugma bilan tasdiqlaysiz — buxgalteriya va ortiqcha hujjatlarsiz.",
		startMs: 16812,
		endMs: 25858,
	},
	{
		text: 'Bu vaqtingizni tejaydi va xodimlaringiz ishonchini oshiradi.',
		startMs: 25858,
		endMs: 29816,
	},
	{
		text: "Biznesingiz uchun hamkorlik qilishni xohlasangiz — biz bilan bog'laning.",
		startMs: 30175,
		endMs: 38450,
		icon: 'chat',
	},
];
