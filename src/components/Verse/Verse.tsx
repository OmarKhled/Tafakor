import {useEffect, useState} from 'react';
import {loadFont} from '@remotion/google-fonts/Amiri';
import {AbsoluteFill} from 'remotion';

import './Verse.css';
interface props {
	min: number;
	frame: number;
	verse: string;
	segments: number[][];
	size: 'lg' | 'rg';
}

// Load Amiri Font
loadFont();

const Verse = ({min, frame, verse, segments, size = 'rg'}: props) => {
	const NUM_OF_WORDS = size === 'rg' ? 7 : 5;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);
	const [segs, setSegs] = useState<string[]>([]);

	useEffect(() => {
		let s = verse
			.split(
				/(?:\s)?\u06de(?:\s)?|(?:\s)?\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650(?:\s)?|(?:\s)?\u06e9(?:\s)?|(?:\s)?\u06e9(?:\s)?/
			)
			.join('')
			.split(
				/(?:\s)?\u06da(?:\s)?|(?:\s)?\u06d6(?:\s)?|(?:\s)?\u06d7(?:\s)?|(?:\s)?\u06d8(?:\s)?|(?:\s)?\u06db(?:\s)?/
			);
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
	}, [verse]);

	useEffect(() => {
		let index = 1;
		let map = segs.map((seg) => {
			let f: any = seg.split(' ').map((w, i) => i + index);
			index += f.length;
			return f;
		});

		try {
			let newSection = currentVerseIndex;
			const foundSegment = segments.find((segment) => min < segment[2]);
			if (foundSegment) {
				newSection = map.findIndex((section) =>
					section.includes((foundSegment as number[])[0])
				);
			}

			setCurrentVerseIndex(newSection >= 0 ? newSection : segs.length - 1);
		} catch (error) {}
	}, [min]);

	return (
		<AbsoluteFill
			className="wrapper center"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<h1 className={`ayah ${size}`}>
				{/* {
					'\u062c\u064e\u0645\u0650\u06cc\u0639\u064b\u0627\u06da \u0625\u0650\u0646\u0651\u064e\u0647\u064f\u06e5 \u0647\u064f\u0648\u064e \u0671\u0644\u06e1\u063a\u064e\u0641\u064f\u0648\u0631\u064f \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u06cc\u0645\u064f'
				} */}
				{segs[currentVerseIndex]}
			</h1>
		</AbsoluteFill>
	);
};

export default Verse;
