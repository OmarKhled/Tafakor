// const segments: [number, number, number][] = [
// 	[0, 0.014666666666666666, 0.019333333333333334],
// 	[1, 0.020666666666666667, 0.043333333333333335],
// 	[2, 0.04533333333333334, 0.05866666666666667],
// 	[3, 0.06133333333333334, 0.07666666666666667],
// 	[4, 0.07866666666666666, 0.08733333333333333],
// 	[5, 0.11733333333333333, 0.144],
// 	[6, 0.146, 0.15],
// 	[7, 0.15333333333333332, 0.172],
// 	[6, 0.186, 0.19],
// 	[7, 0.19333333333333333, 0.21066666666666667],
// 	[8, 0.21200000000000002, 0.2166666666666667],
// 	[9, 0.218, 0.22933333333333333],
// 	[10, 0.232, 0.26466666666666666],
// 	[11, 0.2753333333333333, 0.29933333333333334],
// 	[12, 0.3026666666666667, 0.3126666666666667],
// 	[13, 0.31466666666666665, 0.32599999999999996],
// 	[14, 0.32733333333333337, 0.3446666666666667],
// 	[15, 0.3473333333333333, 0.364],
// 	[16, 0.3813333333333333, 0.4086666666666666],
// 	[17, 0.41133333333333333, 0.416],
// 	[18, 0.41733333333333333, 0.434],
// 	[19, 0.43533333333333335, 0.482],
// ];

// const verse =
// 	'قُلۡ یَـٰعِبَادِیَ ٱلَّذِینَ أَسۡرَفُوا۟ عَلَىٰۤ أَنفُسِهِمۡ لَا تَقۡنَطُوا۟ مِن رَّحۡمَةِ ٱللَّهِۚ إِنَّ ٱللَّهَ یَغۡفِرُ ٱلذُّنُوبَ جَمِیعًاۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِیمُ';

// const transcript =
// 	'قُلۡ یَـٰعِبَادِیَ ٱلَّذِینَ أَسۡرَفُوا۟ عَلَىٰۤ أَنفُسِهِمۡ لَا تَقۡنَطُوا۟ | لَا تَقۡنَطُوا۟ | مِن رَّحۡمَةِ ٱللَّهِ | إِنَّ ٱللَّهَ یَغۡفِرُ ٱلذُّنُوبَ جَمِیعًاۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِیمُ';

// // 'سَيَقُولُونَ ثَلَٰثَةٌۭ رَّابِعُهُمْ كَلْبُهُمْ وَيَقُولُونَ خَمْسَةٌۭ سَادِسُهُمْ كَلْبُهُمْ رَجْمًۢا بِٱلْغَيْبِ ۖ وَيَقُولُونَ سَبْعَةٌۭ وَثَامِنُهُمْ كَلْبُهُمْ ۚ قُل رَّبِّىٓ أَعْلَمُ بِعِدَّتِهِم مَّا يَعْلَمُهُمْ إِلَّا قَلِيلٌۭ ۗ فَلَا تُمَارِ فِيهِمْ إِلَّا مِرَآءًۭ ظَٰهِرًۭا وَلَا تَسْتَفْتِ فِيهِم مِّنْهُمْ أَحَدًۭ'

// ('قُلۡ یَـٰعِبَادِیَ ٱلَّذِینَ أَسۡرَفُوا۟ عَلَىٰۤ أَنفُسِهِمۡ لَا تَقۡنَطُوا۟ | لَا تَقۡنَطُوا۟ | مِن رَّحۡمَةِ ٱللَّهِ | إِنَّ ٱللَّهَ یَغۡفِرُ ٱلذُّنُوبَ جَمِیعًاۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِیمُ');

const splitters = [
	'\u06da', // ج
	'\u06d6', // صلى
	'\u06d8', // م
	'\u06d7', // قلى
];

const filterChars = [
	'بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ',
	'۩',
	'۞',
	'\u06d9', // لا
];

('قُل يٰعِبادِىَ الَّذينَ أَسرَفوا عَلىٰ أَنفُسِهِم لا تَقنَطوا مِن رَحمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغفِرُ الذُّنوبَ جَميعًا ۚ إِنَّهُ هُوَ الغَفورُ الرَّحيمُ');

const chunkizeArray = <T>(array: T[], chunkSize: number) => {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		const chunk = array.slice(i, i + chunkSize);
		chunks.push(chunk);
	}
	return chunks;
};

export const getVerseSegments = (
	verse: string,
	timeSegments: [number, number, number][],
	englishTranslationWords: string[],
	displayCounts: number[] = [3]
) => {
	// console.log(verse);
	const indexToToken: {[key: number]: string} = {};

	// filtering out filter words
	filterChars.forEach((filterChar) => {
		verse = verse.replace(filterChar, '');
	});

	splitters.forEach((splitChar) => {
		verse = verse.replaceAll(` ${splitChar}`, `${splitChar}`);
	});

	// trimming multiple spaces
	verse = verse.replace(/\s+/g, ' ').trim();

	verse.split(' ').forEach((token, index) => {
		indexToToken[index] = token;
	});

	let transcript = '';
	let trackBackFrom = -1;

	// placing separator when tokens repeat backward
	timeSegments.forEach((segment, segmentIndex) => {
		const [index] = segment;

		let previousIndex = -1;
		if (index > 0) {
			[previousIndex] = timeSegments[segmentIndex - 1];
		}

		// console.log(index, indexToToken[index]);

		if (index > previousIndex) {
			if (trackBackFrom == index) {
				transcript += `${indexToToken[index]} - `;
			} else {
				transcript += `${indexToToken[index]} `;
			}
		} else {
			transcript += `- ${indexToToken[index]} `;
			trackBackFrom = previousIndex;
		}
	});

	// console.log(transcript);

	// placing separator on splitters
	splitters.forEach((splitChar) => {
		transcript = transcript.replaceAll(splitChar, ' - ');
	});

	// trimming multiple spaces
	transcript = transcript.replace(/\s+/g, ' ').trim();

	// console.log(transcript);

	// splitting transcript on splitters
	const textSegments = transcript.split(' - ');

	// Splitting transcript segments into equal chunks of length displayCount
	const displaySegments: {[key: number]: string[][]} = {};
	displayCounts.forEach((displayCount) => {
		displaySegments[displayCount] = [];

		textSegments.forEach((segment) => {
			const chunkedSegment = chunkizeArray<string>(
				segment.split(' '),
				displayCount
			);
			displaySegments[displayCount] =
				displaySegments[displayCount].concat(chunkedSegment);
		});
	});

	// Adding timestamps to each segment
	const displaySegmentsWithTimeStamps: {
		[key: number]: {
			start: number;
			end: number;
			tokens: string[];
			englishTokens: string[];
		}[];
	} = {};

	timeSegments[0][1] = 0;

	displayCounts.forEach((displayCount) => {
		const displaySegmentsTokens = displaySegments[displayCount];

		const segments: {
			start: number;
			end: number;
			tokens: string[];
			englishTokens: string[];
		}[] = [];

		let currentTimeSegmentIndex = 0;
		displaySegmentsTokens.forEach((displaySegmentTokens, index) => {
			const lengthOfTokens = displaySegmentTokens.length;

			const timeSegmentsStartIndex = currentTimeSegmentIndex;
			const timeSegmentsEndIndex = currentTimeSegmentIndex + lengthOfTokens - 1;

			const [_, start] = timeSegments[timeSegmentsStartIndex];
			const end = timeSegments[timeSegmentsEndIndex + 1]
				? timeSegments[timeSegmentsEndIndex + 1][1]
				: timeSegments[timeSegmentsEndIndex][1] + 5;

			const englishTokens: string[] = [];
			timeSegments
				.slice(timeSegmentsStartIndex, timeSegmentsEndIndex + 1)
				.forEach((segment) => {
					const [index] = segment;

					englishTokens.push(englishTranslationWords[index]);
				});

			segments.push({tokens: displaySegmentTokens, start, end, englishTokens});

			currentTimeSegmentIndex += lengthOfTokens;
		});

		displaySegmentsWithTimeStamps[displayCount] = segments;
	});

	return displaySegmentsWithTimeStamps;
};
