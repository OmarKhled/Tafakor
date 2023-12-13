type Verse = {
	id: number | string | undefined;
	from: number;
	to: number;
	surah: number;
	verse: string;
	duration: number;
	video: string | undefined;
};

type ReflectPost = {
	id: number;
	body: string;
	filters: {
		id: string;
		surah_number: number;
		from: number;
		to: number;
		indicator_text: `surah-${number}-${number}:${number}`;
	}[];
};

type AudioResponse = {
	audio_files: {
		audio_url: string;
		verse_timings: {
			timestamp_from: number;
			timestamp_to: number;
			segments: number[][];
			verse_key: string;
		}[];
	}[];
};

export {Verse, ReflectPost, AudioResponse};
