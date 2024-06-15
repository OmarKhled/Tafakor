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
	const NUM_OF_WORDS = size === 'rg' ? 6 : 6;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);
	const [segmentsTimings, setSegmentsTimings] = useState<
		{start: number; end: number}[]
	>([]);
	const [segments, setSegments] = useState<string[]>([]);
	const [segmentsMap, setSegmentsMap] = useState<number[][]>([]);
	const [currentSegmentTranslation, setCurrentSegmentTrnaslation] =
		useState<string>('');

	useEffect(() => {
		const filteredVerseString = verse
			.split(
				/(?:\s)?\u06de(?:\s)?|\u0628\u0650\u0633\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0645\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u064a\u0645\u0650 |(?:\s)?\u06e9(?:\s)?|(?:\s)?\u06e9(?:\s)?|(?:\s)?\u06d9/
			)
			.join('');

		// console.log(filteredVerseString);

		const clearVerse = filteredVerseString
			.split(/\u06da|\u06d6|\u06d7|\u06d8|\u06db/)
			.join('')
			.split('  ')
			.join(' ');

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

		let index = 1;
		let map: number[][] = segmentsWords.map((seg) => {
			let f: number[] = seg.split(' ').map((_, i) => i + index);
			index += f.length;
			return f;
		});

		for (let index = 0; index < timeSegments.length; index++) {
			const element = timeSegments[index];
			if (index > 0) {
				if (
					element[0] < timeSegments[index - 1][0] &&
					element[0] + 1 !== timeSegments[index + 1][0]
				) {
					timeSegments.splice(index, 1);
				}

				if (
					element[0] > timeSegments[index - 1][0] &&
					element[0] - 1 !== timeSegments[index - 1][0] &&
					timeSegments
						.slice(index)
						.find((segment) => segment[0] === element[0] - 1)
				) {
					const foundItem =
						timeSegments
							.slice(index)
							.findIndex((segment) => segment[0] === element[0] - 1) + index;
					timeSegments.splice(index, foundItem - index);
				}
			}
		}

		timeSegments.forEach((currentSegment, i) => {
			if (i > 0) {
				const prev = timeSegments[i - 1][0];
				if (currentSegment[0] <= prev) {
					const prevSegmentIndex = map.findIndex((segment) =>
						segment.includes(prev)
					);
					const nextResume =
						timeSegments
							.slice(i + 1)
							.findIndex((segment) => segment[0] == prev) +
						(i + 1);
					const insertedSlots = timeSegments
						.slice(i, nextResume)
						.map((i) => i[0]);

					if (insertedSlots.length > 1) {
						map = [
							...map.slice(0, prevSegmentIndex),
							map[prevSegmentIndex].slice(
								0,
								map[prevSegmentIndex].indexOf(prev) + 1
							),
							[...insertedSlots, prev],
							map[prevSegmentIndex].slice(
								map[prevSegmentIndex].indexOf(prev) + 1
							),
							...map.slice(prevSegmentIndex + 1),
						];
					} else {
						if (
							map[prevSegmentIndex].indexOf(prev) ==
							map[prevSegmentIndex].length - 1
						) {
							map = [
								...map.slice(0, prevSegmentIndex + 1),
								[prev, ...map[prevSegmentIndex + 1]],
								...map.slice(prevSegmentIndex + 2),
							];
						} else {
							map = [
								...map.slice(0, prevSegmentIndex),
								map[prevSegmentIndex].slice(
									0,
									map[prevSegmentIndex].indexOf(prev) + 1
								),
								[
									...insertedSlots,
									...map[prevSegmentIndex].slice(
										map[prevSegmentIndex].indexOf(prev)
									),
								],
								// insertedSlots,
								...map.slice(prevSegmentIndex + 1),
							];
						}
					}
				}
			}
		});

		let counter = -1;
		const segmentsTimings = map.map((segment, i) => {
			const prevCounter = counter == -1 ? 0 : counter;
			counter += segment.length;
			return {
				start:
					prevCounter == 0
						? timeSegments[prevCounter][1]
						: timeSegments[prevCounter + 1][1],
				end: timeSegments[counter][2],
			};
		});

		setSegmentsTimings(segmentsTimings);

		setSegments(
			map.map((segment) =>
				segment.map((i) => clearVerse.split(' ')[i - 1]).join(' ')
			)
		);

		setSegmentsMap(map);
	}, [verse]);

	useEffect(() => {
		try {
			let newSectionIndex = segmentsTimings.findIndex(
				(segment) => min < segment.end
			);

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
				opacity: frame < 52 ? Math.min(1, frame / 50) : 1,
			}}
		>
			<h1 className={`ayah ${size}`}>
				<span>{'﴾'}</span>
				{segments[currentVerseIndex]}
				<span>{'﴿'}</span>
			</h1>
			<h2 className={`translation ${size}`}>{currentSegmentTranslation}</h2>
		</div>
	);
};

export default Verse;
