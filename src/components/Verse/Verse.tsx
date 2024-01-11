import {useEffect, useState} from 'react';
import {loadFont} from '@remotion/google-fonts/Amiri';
import {loadFont as loadPoppinsFont} from '@remotion/google-fonts/Poppins';

import './Verse.css';
interface props {
	min: number;
	frame: number;
	verse: string;
	segments: number[][];
	size: 'lg' | 'rg';
	englishWords: string[];
}

// Load Amiri Font
loadFont();
loadPoppinsFont();

const Verse = ({
	min,
	frame,
	verse,
	segments: timeSegments,
	size = 'rg',
	englishWords,
}: props) => {
	const NUM_OF_WORDS = size === 'rg' ? 7 : 5;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);
	const [segments, setSegments] = useState<string[]>([]);
	const [segmentsMap, setSegmentsMap] = useState<number[][]>([]);
	const [currentSegmentTranslation, setCurrentSegmentTrnaslation] =
		useState<string>('');

	useEffect(() => {
		const filteredVerseString = verse
			.split(
				/(?:\s)?\u06de(?:\s)?|(?:\s)?\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650(?:\s)?|(?:\s)?\u06e9(?:\s)?|(?:\s)?\u06e9(?:\s)?/
			)
			.join('');
		let segmentsWords = filteredVerseString.split(
			/(?:\s)?\u06da(?:\s)?|(?:\s)?\u06d6(?:\s)?|(?:\s)?\u06d7(?:\s)?|(?:\s)?\u06d8(?:\s)?|(?:\s)?\u06db(?:\s)?/
		);

		segmentsWords = segmentsWords
			.map((c) =>
				c.split(' ').length > NUM_OF_WORDS
					? Array.from(
							Array(Math.ceil(c.split(' ').length / NUM_OF_WORDS)).keys()
					  ).map((i) =>
							c
								.split(' ')
								.slice(NUM_OF_WORDS * i, NUM_OF_WORDS * (i + 1))
								.join(' ')
					  )
					: c
			)
			.flat();

		setSegments(segmentsWords);

		let index = 1;
		const map: number[][] = segmentsWords.map((seg) => {
			let f: number[] = seg.split(' ').map((_, i) => i + index);
			index += f.length;
			return f;
		});

		console.log({timeSegments, map});

		setSegmentsMap(map);
	}, [verse]);

	useEffect(() => {
		try {
			let newSectionIndex = currentVerseIndex;
			const foundSegment = timeSegments.find((segment) => min < segment[2]);
			if (foundSegment) {
				newSectionIndex = segmentsMap.findIndex((section) =>
					section.includes((foundSegment as number[])[0])
				);
			}

			if (segmentsMap[newSectionIndex]) {
				const segmentTranslation = segmentsMap[newSectionIndex]
					?.map((i) => englishWords[i - 1])
					.join(' ');

				if (segmentTranslation) {
					setCurrentSegmentTrnaslation(segmentTranslation);
				}
			}

			setCurrentVerseIndex(
				newSectionIndex >= 0 ? newSectionIndex : segments.length - 1
			);
		} catch (error) {
			console.log('catched error:', error);
		}
	}, [min]);

	return (
		<div
			className="center"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<h1 className={`ayah ${size}`}>{segments[currentVerseIndex]}</h1>
			<h2 className={`translation ${size}`}>{currentSegmentTranslation}</h2>
		</div>
	);
};

export default Verse;
