import {loadFont} from '@remotion/google-fonts/Amiri';
import {useEffect, useState} from 'react';
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
			.split(/\u06de | \u06de /)
			.join('')
			.split(/ \u06da | \u06d6 | \u06d7 /);
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
			if (segments.find((segment) => min < segment[2])) {
				newSection = map.findIndex((section) =>
					section.includes(
						(segments.find((segment) => min < segment[2]) as number[])[0]
					)
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
			<h1 className={`ayah ${size}`}>{segs[currentVerseIndex]}</h1>
		</AbsoluteFill>
	);
};

export default Verse;
