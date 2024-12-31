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
	console.log(timeSegments);
	timeSegments = timeSegments.map((i) => [i[0] + 12, i[1], i[2]]);

	const indexToToken: {[key: number]: string} = {};

	console.log(indexToToken);

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
		if (index - 12 > 0) {
			console.log(indexToToken[index], index - 12, segmentIndex);

			[previousIndex] = timeSegments[segmentIndex - 1];
		}

		console.log(segmentIndex, timeSegments[segmentIndex]);

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
