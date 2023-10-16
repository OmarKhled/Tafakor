import {Dispatch, SetStateAction, useEffect} from 'react';
import {AbsoluteFill} from 'remotion';

interface props {
	min: number;
	frame: number;
	verse: string;
	segments: number[][];
	setCurrentVerseIndex: Dispatch<SetStateAction<number>>;
	currentVerseIndex: number;
	font: string;
}

const Verse = ({
	min,
	frame,
	verse,
	segments,
	setCurrentVerseIndex,
	currentVerseIndex,
	font,
}: props) => {
	const NUM_OF_WORDS = 7;

	useEffect(() => {
		const words = verse.split(' ');
		const indexs = Array.from({length: words.length}, (_, i) => i + 1);

		const wordsMap = Array.from(
			{length: Math.ceil(words.length / NUM_OF_WORDS)},
			() => indexs.splice(0, NUM_OF_WORDS)
		);

		try {
			const newSection =
				wordsMap.findIndex((section) =>
					section.includes(
						(segments.find((segment) => min < segment[2]) as number[])[0]
					)
				) + 1;
			setCurrentVerseIndex(newSection > 0 ? newSection : 1);
		} catch (error) {
			console.log(error);
		}
	}, [min]);

	return (
		<AbsoluteFill
			className="wrapper center"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<h1
				className="ayah"
				style={{
					fontFamily: font,
				}}
			>
				{verse
					.split(' ')
					.slice(
						(currentVerseIndex - 1) * NUM_OF_WORDS,
						(currentVerseIndex - 1) * NUM_OF_WORDS + NUM_OF_WORDS
					)
					.join(' ')}
			</h1>
		</AbsoluteFill>
	);
};

export default Verse;
