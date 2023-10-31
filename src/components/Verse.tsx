import {Dispatch, SetStateAction, useEffect, useState} from 'react';
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
	const [segs, setSegs] = useState<string[]>([]);

	useEffect(() => {
		let s = verse.split(/ \u06da | \u06d6 | \u06d7 /);
		s = s
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
		setSegs(s);
		console.log(s);

		// console.log();
	}, [verse]);

	useEffect(() => {
		const words = verse.split(' ');

		let index = 1;
		let map = segs.map((seg) => {
			let f: any = seg.split(' ').map((w, i) => i + index);
			index += f.length;
			// if (f.length > NUM_OF_WORDS) {
			// f = Array.from(Array(Math.ceil(f.length / NUM_OF_WORDS)).keys()).map(
			// 	(i) => f.slice(NUM_OF_WORDS * i, NUM_OF_WORDS * (i + 1))
			// );
			// }
			return f;
		});
		// .flat();

		const indexs = Array.from({length: words.length}, (_, i) => i + 1);

		const wordsMap = Array.from(
			{length: Math.ceil(words.length / NUM_OF_WORDS)},
			() => indexs.splice(0, NUM_OF_WORDS)
		);

		try {
			let newSection = currentVerseIndex;
			if (segments.find((segment) => min < segment[2])) {
				console.log(segments.find((segment) => min < segment[2]));
				// console.log(segments.find((segment) => min < segment[2]));
				newSection = map.findIndex((section) =>
					section.includes(
						(segments.find((segment) => min < segment[2]) as number[])[0]
					)
				);
			}

			console.log(newSection);

			setCurrentVerseIndex(newSection >= 0 ? newSection : segs.length - 1);
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
					textAlign: 'center',
					padding: '2rem',
					lineHeight: '7rem',
				}}
			>
				{/* {verse
					.split(' ')
					.slice(
						(currentVerseIndex - 1) * NUM_OF_WORDS,
						(currentVerseIndex - 1) * NUM_OF_WORDS + NUM_OF_WORDS
					)
					.join(' ')} */}
				{segs[currentVerseIndex]}
			</h1>
		</AbsoluteFill>
	);
};

export default Verse;
