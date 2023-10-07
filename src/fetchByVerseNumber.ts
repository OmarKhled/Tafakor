const getVerse = async () => {
	const surah_number = 48;
	const ayat = [4];

	const reciterId = 7;

	// https://api.qurancdn.com/api/qdc/audio/reciters/161/audio_files?chapter=2&segments=true

	const audioRes = await (
		await fetch(
			`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/audio_files?chapter=${surah_number}&segments=true`,
			{method: 'GET'}
		)
	).json();

	console.log(audioRes);

	const url = audioRes.audio_files[0].audio_url;
	console.log('URL: ' + url);
	let lastVerseTiming = 0;
	let lastVerseIndex = 0;

	const verseDetails = audioRes.audio_files[0].verse_timings
		.slice(ayat[0] - 1, ayat[ayat.length - 1])
		.map((verse: any, index: number) => {
			const segments = verse.segments.map((segment: number[]) => [
				segment[0] + lastVerseIndex,
				(segment[1] - verse.segments[0][1]) / 1000 / 60 + lastVerseTiming,
				(segment[2] - verse.segments[0][1]) / 1000 / 60 + lastVerseTiming,
			]);
			lastVerseTiming = segments[segments.length - 1][2];
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
		verse: (
			await (
				await fetch(
					`https://quranreflect.com/citation_texts/citation_texts_from_filter?client_auth_token=tUqQpl4f87wIGnLRLzG61dGYe03nkBQj&from=${
						ayat[0]
					}&to=${ayat[ayat.length - 1]}&citation_id=${
						surah_number + 1
					}&translation_id=8`,
					{method: 'GET'}
				)
			).json()
		).citation_texts
			.map((cite: any) => cite.text)
			.map((text: any) => text.split(' '))
			.flat()
			.join(' '),

		// verse: post.citation_texts[Object.keys(post.citation_texts)[0]][0].text,
		surahNumber: 48,
		segments: verseDetails.map((verse: any) => verse.segments).flat(),
	};
};

export {getVerse};
