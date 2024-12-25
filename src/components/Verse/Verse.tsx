import {useMemo} from 'react';
import {loadFont} from '@remotion/fonts';
import {Sequence, staticFile} from 'remotion';
import {loadFont as loadPoppinsFont} from '@remotion/google-fonts/Poppins';

import {getVerseSegments} from './utils';
import './Verse.css';

interface props {
	min: number;
	frame: number;
	verse: string;
	segments: number[][];
	size: 'lg' | 'rg';
	englishWords: string[];
}

const fontFamily = 'Maidan';

loadFont({
	family: fontFamily,
	url: staticFile('maidan.ttf'),
	weight: '500',
}).then(() => {
	console.log('Font loaded!');
});

loadPoppinsFont();

const Verse = ({
	min,
	frame,
	verse,
	segments: timeSegments,
	size = 'rg',
	englishWords,
}: props) => {
	const NUM_OF_WORDS = size === 'rg' ? 3 : 3;

	const timeStamppedTranscription = useMemo(
		() =>
			getVerseSegments(
				verse,
				timeSegments as [number, number, number][],
				englishWords,
				[NUM_OF_WORDS]
			)[NUM_OF_WORDS],
		[verse, timeSegments, englishWords, NUM_OF_WORDS]
	);

	return (
		<>
			{timeStamppedTranscription.map((segment) => (
				<Sequence
					from={segment.start * 30 * 60}
					durationInFrames={(segment.end - segment.start) * 30 * 60}
					className="center ayah-container"
				>
					<h1 className={`ayah ${size}`}>{segment.tokens.join(' ')}</h1>
					<h2 className={`translation ${size}`}>
						{segment.englishTokens.join(' ')}
					</h2>
				</Sequence>
			))}
		</>
	);
};

export default Verse;
