import {AudioResponse, Verse} from './types';

const reciters = [
	{
		name: 'مشاري راشد العفاسي',
		id: 7,
	},
	{
		name: 'خليفة الطنيجى',
		id: 161,
	},
	{
		name: 'محمود خليل الحصرى',
		id: 6,
	},
	{
		name: 'ابو بكر الشاطري',
		id: 4,
	},
	{
		name: 'هانى الرفاعي',
		id: 5,
	},
];

interface versePostReponse {
	id: string;
	surah_number: number;
	from: number;
	to: number;
	video: {
		Valid: boolean;
		String: string;
	};
	type: {
		Valid: boolean;
		String: 'reel' | 'post';
	};
	reciter: {
		Valid: boolean;
		Int16: number;
	};
}

let reciter: {name: string; id: number};
let reciterId: number;

const initReciter = (id: number = 7) => {
	if (id && id != reciterId) {
		const found = reciters.find((reciter) => reciter.id === id);
		if (found) {
			reciter = found;
			reciterId = reciter.id;
		}
	}
};

/**
 * @description returns recitation data of verse(s)
 * @param surah - Surah Number
 * @param from - Start Verse Number
 * @param to - End Verse Number
 */
const recitationData = async (
	surah: number,
	from: number,
	to: number,
	reciterIdProp?: number
) => {
	if (!reciter || !reciterId || reciterIdProp) {
		initReciter(reciterIdProp);
	}
	// Verse fetching from qurancdn
	const res: AudioResponse = await (
		await fetch(
			`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah}&segments=true`,
			{method: 'GET'}
		)
	).json();

	// url of recitation (mostly mp3)
	const recitationUrl = res.audio_files[0].audio_url;

	// Maping verses numbers
	const verses = [...Array(to - from + 1)].map((e, i) => from + i);

	//
	let lastVerseEnding = 0;
	let lastVerseWordIndex = 0;

	const versesTimings = res.audio_files[0].verse_timings.slice(
		verses[0] - 1,
		verses[verses.length - 1]
	);
	// Timings for each verse
	const timings = versesTimings.map((verse) => {
		const segments = verse.segments
			// Filters out eligable segments
			.filter((segment: any) => segment.length === 3)
			/** Each segment of segments is a 3 items array
			 * The first item is the index of the word inside the verse
			 * The other two items are the begining and ending timestamps respectivly
			 *
			 * The following map function returns the segments of the verse joined on the other verses (if any)
			 * */
			.map((segment: number[]) => [
				segment[0] + lastVerseWordIndex,
				(segment[1] - verse.segments[0][1]) / 1000 / 60 + lastVerseEnding,
				(segment[2] - verse.segments[0][1]) / 1000 / 60 + lastVerseEnding,
			]);

		lastVerseEnding =
			(verse.timestamp_to - versesTimings[0].timestamp_from) / 1000 / 60;
		lastVerseWordIndex = segments[segments.length - 1][0];
		return {
			timestamp_from: verse.timestamp_from,
			timestamp_to: verse.timestamp_to,
			verseIndex: verse.verse_key.split(':')[1],
			segments,
		};
	});

	// Word by word translations
	const wbwTranslations: {
		verses: {
			words: {translation: {text: string}; char_type_name: 'end' | 'word'}[];
		}[];
	} = await (
		await fetch(
			`https://api.qurancdn.com/api/qdc/verses/by_chapter/${surah}?` +
				new URLSearchParams({
					words: 'true',
					per_page: '10000',
					word_translation_language: 'en',
					word_fields: 'verse_key,verse_id,location,qpc_uthmani_hafs',
					page: '1',
				})
		)
	).json();

	// Filtering words
	let words = wbwTranslations.verses
		.filter((_, i) => verses.includes(i + 1))
		.map((verse) =>
			verse.words
				.filter((word) => word.char_type_name === 'word')
				?.map((word) => word.translation.text.replace(/[\(\)]/g, ''))
		)
		.flat();

	// Duplicates filtering
	words = words.map((word, index) => (words[index - 1] == word ? '' : word));

	return {
		timings,
		url: recitationUrl,
		englishWords: words,
	};
};

/**
 * @description fetches the scheculed verse
 */
const getVerse = async (
	{
		surah,
		from,
		to,
	}: {
		surah?: number;
		from?: number;
		to?: number;
	},
	random: boolean = false
): Promise<Verse> => {
	let post: versePostReponse | undefined;

	if (!(surah && from && to)) {
		post = (await (
			await fetch(
				`${process.env.TAFAKOR_API_ENDPOINT}/verses/one?random=${random}`
			)
		).json()) as versePostReponse;

		// Post verse(s) data
		surah = post.surah_number;
		from = post.from;
		to = post.to;
	}

	// @ts-ignore
	const verses = [...Array(to - from + 1)].map((e, i) => from + i);

	const verseText = await getVerseText(surah, verses);

	// Verse timings
	const {timings} = await recitationData(
		surah,
		from,
		to,
		post?.reciter.Valid ? post?.reciter.Int16 : undefined
	);

	return {
		from: verses[0],
		to: verses[verses.length - 1],
		surah: surah,
		id: post?.id,
		verse: verseText,
		duration:
			(timings[timings.length - 1].timestamp_to - timings[0].timestamp_from) /
			1000,
		video: post?.video.Valid ? post?.video.String : undefined,
		type: post?.type.Valid ? post?.type.String : undefined,
		reciterId: post?.reciter.Valid ? post?.reciter.Int16 : undefined,
	};
};

/**
 * @description returns ceratin verse(s) citation text
 * @param surah - Surah Number
 * @param verses - Verrses
 */
export const getVerseText = async (surah: number, verses: number[]) => {
	const versesTexts = [];

	for (let index = 0; index < verses.length; index++) {
		const verse = verses[index];

		const res = await (
			await fetch(
				`https://api.alquran.cloud/v1/ayah/${surah}:${verse}/quran-uthmani-min`,
				{method: 'GET'}
			)
		).json();

		versesTexts.push(res.data.text);
	}

	const joinedVerses = versesTexts.join(' \u06da ');

	return joinedVerses;
};

/**
 * @description returns ceratin verse(s) data
 * @param surah - Surah Number
 * @param verses - Verrses
 */
const getVerseData = async (
	surah: number,
	verses: number[],
	reciterIdProp?: number
) => {
	if (!reciter || !reciterId) {
		initReciter(reciterIdProp);
	}

	const {timings, url, englishWords} = await recitationData(
		surah,
		verses[0],
		verses[verses.length - 1],
		reciterIdProp
	);

	const verseText = await getVerseText(surah, verses);

	return {
		url: url,
		durationInMins:
			(timings[timings.length - 1].timestamp_to - timings[0].timestamp_from) /
			1000 /
			60,
		from: timings[0].timestamp_from / 1000 / 60,
		to: timings[timings.length - 1].timestamp_to / 1000 / 60,
		verse: verseText,
		surahNumber: surah,
		segments: timings.map((verse: any) => verse.segments).flat(),
		reciter: reciter.name,
		englishWords,
	};
};

export {getVerse, getVerseData};
