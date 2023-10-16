import {
	AbsoluteFill,
	Video,
	Audio,
	useCurrentFrame,
	staticFile,
	continueRender,
	delayRender,
} from 'remotion';
import {z} from 'zod';

import {loadFont} from '@remotion/google-fonts/Amiri';
import {useEffect, useState} from 'react';
import Verse from './Verse';

// Amiri Font
const {fontFamily: Amiri} = loadFont();

// Sura Font
const waitForFont = delayRender();
const suraName = new FontFace(
	`sura`,
	`url('${staticFile('sura_names.woff2')}') format('woff2')`
);
suraName
	.load()
	.then(() => {
		document.fonts.add(suraName);
		continueRender(waitForFont);
	})
	.catch((err) => console.log('Error loading font', err));

const quranSchema = z.object({
	from: z.number(),
	to: z.number(),
	url: z.string(),
	videoUrl: z.string(),
	verse: z.string(),
	segments: z.array(z.array(z.number())),
	surahNumber: z.string(),
});

export const Recitation: React.FC<z.infer<typeof quranSchema>> = ({
	from,
	to,
	url,
	videoUrl,
	verse,
	segments,
	surahNumber,
}) => {
	const frame = useCurrentFrame();
	const min = frame / 30 / 60;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);

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

	useEffect(() => {
		console.log({url, to, from, segments, verse});
	}, []);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Video
				src={
					'https://player.vimeo.com/external/221214113.sd.mp4?s=2519b65070b6e2ea98b219a6c0fbd9d6e53a7242&profile_id=165&oauth2_token_id=57447761#t=0,19.2'
					// videoUrl
				}
				style={{scale: '2', width: '1000px', height: '1000px'}}
				loop
				muted
			></Video>

			<AbsoluteFill
				style={{backgroundColor: '#000', opacity: 0.4}}
			></AbsoluteFill>

			<AbsoluteFill
				className="wrapper start"
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				{' '}
				<p className="sura-name">{surahNumber}</p>
			</AbsoluteFill>

			<AbsoluteFill
				className="wrapper center"
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				<h1
					className="ayah"
					style={{
						fontFamily: Amiri,
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

			<AbsoluteFill
				className="wrapper end"
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				{' '}
				<p className="rectier">{'القارئ: مشارى راشد العفاسي'}</p>
			</AbsoluteFill>

			<Audio src={url} startFrom={30 * 60 * from} endAt={30 * 60 * to}></Audio>
		</AbsoluteFill>
	);
};
