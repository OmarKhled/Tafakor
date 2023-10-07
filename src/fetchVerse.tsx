const getVerse = async () => {
	/** Getting Quran reflections */
	const res = await (
		await fetch(
			'https://quranreflect.com/posts.json?client_auth_token=tUqQpl4f87wIGnLRLzG61dGYe03nkBQj&q%5Bfilters_operation%5D=OR&q%5Btags_operation%5D=OR&page=1&tab=trending&lang=ar&feed=&verified=&student=&scholar=&approved=&exact_ayah=&within_range=&prioritize_ayah=&featured=true',
			{method: 'GET'}
		)
	).json();

	console.log(res);
	// const postIndex = Math.ceil(Math.random() * res.posts.length);
	// const postIndex = 16; // Ghafer
	const postIndex = 2;

	const post = res.posts[postIndex];

	// https://api.qurancdn.com/api/qdc/audio/reciters/161/audio_files?chapter=2&segments=true

	const audioRes = await (
		await fetch(
			`https://api.qurancdn.com/api/qdc/audio/reciters/161/audio_files?chapter=${post.filters[0].surah_number}&segments=true`,
			{method: 'GET'}
		)
	).json();

	console.log(audioRes);

	const url = audioRes.audio_files[0].audio_url;
	console.log('URL: ' + url);
	let lastVerseTiming = 0;
	let lastVerseIndex = 0;

	const verseDetails = audioRes.audio_files[0].verse_timings
		.slice(post.filters[0].from - 1, post.filters[0].to)
		.map((verse: any, index: number) => {
			const segments = verse.segments.map((segment: number[]) => [
				segment[0] + lastVerseIndex,
				(segment[1] - verse.segments[0][1]) / 1000 / 60 + lastVerseTiming,
				(segment[2] - verse.segments[0][1]) / 1000 / 60 + lastVerseTiming,
			]);
			lastVerseTiming = segments[segments.length - 1][1];
			lastVerseIndex = segments[segments.length - 1][0];
			return {
				timestamp_from: verse.timestamp_from,
				timestamp_to: verse.timestamp_to,
				verseIndex: verse.verse_key.split(':')[1],
				segments,
			};
		});

	verseDetails.forEach((verse: any) => {
		console.log(
			`Verse ${verse.verseIndex}: starts from ${
				verse.timestamp_from / 1000 / 60
			} and ends at ${verse.timestamp_to / 1000 / 60} `
		);
	});

	console.log(verseDetails.length);

	return {
		url: url,
		verseDetails,
		durationInMins:
			(verseDetails[verseDetails.length - 1].timestamp_to -
				verseDetails[0].timestamp_from) /
			1000 /
			60,
		start: verseDetails[0].timestamp_from / 1000 / 60,
		to: verseDetails[verseDetails.length - 1].timestamp_to / 1000 / 60,
		verse: post.citation_texts['0']
			.map((cite: any) => cite.text)
			.map((text: any) => text.split(' '))
			.flat()
			.join(' '),
		// verse: post.citation_texts[Object.keys(post.citation_texts)[0]][0].text,
		surahNumber: post.filters[0].surah_number,
		segments: verseDetails.map((verse: any) => verse.segments).flat(),
	};
};

export {getVerse};
