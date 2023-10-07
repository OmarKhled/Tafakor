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

const {fontFamily} = loadFont();

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

export const myCompSchema = z.object({
	from: z.number(),
	to: z.number(),
	url: z.string(),
	videoUrl: z.string(),
	verse: z.string(),
	segments: z.array(z.array(z.number())),
	surahNumber: z.string(),
});

export const Quran: React.FC<z.infer<typeof myCompSchema>> = ({
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
	const NUM_OF_WORDS = 7;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);

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

			console.log(
				(segments.find((segment) => min < segment[2]) as number[])[0],
				segments.find((segment) => min < segment[2]),
				min,
				null
			);
		} catch (error) {
			console.log(error);
		}
	}, [min]);

	useEffect(() => {
		console.log({url, to, from, segments, verse});
	}, []);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{/* https://player.vimeo.com/external/326025148.hd.mp4?s=dad6e981b07b5ebfdd5a347a72b0091daabda03c&profile_id=172&oauth2_token_id=57447761#t=0.2,52.83 */}

			{/*https://player.vimeo.com/external/291047369.hd.mp4?s=f4a88b605b1c7124338c0599467bc702ca2c4c38&profile_id=170&oauth2_token_id=57447761#t=0.2,23.83  */}

			{/* https://player.vimeo.com/external/291648067.hd.mp4?s=94998971682c6a3267e4cbd19d16a7b6c720f345&profile_id=175&oauth2_token_id=57447761#t=0.2,31.63 */}
			<Video
				src={
					// staticFile('output.webm')
					'https://vod-progressive.akamaized.net/exp=1696727035~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F1439%2F14%2F357195613%2F1458022594.mp4~hmac=020512d1d053ca96b1c03a2c50320415f1c23a6240bbab8eba01b1544c188041/vimeo-prod-skyfire-std-us/01/1439/14/357195613/1458022594.mp4'
					// videoUrl
				}
				// startFrom={6}
				style={{scale: '2', width: '1000px', height: '1000px'}}
				loop
			></Video>
			<AbsoluteFill
				style={{backgroundColor: '#000', opacity: 0.4}}
			></AbsoluteFill>

			<AbsoluteFill
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start',
					opacity: Math.min(1, frame / 50),
					paddingTop: '2rem',
				}}
			>
				{' '}
				<p
					style={{
						fontFamily: 'sura',
						color: '#fff',
						fontSize: '60px',
						margin: 0,
					}}
				>
					{surahNumber}
				</p>
			</AbsoluteFill>

			<AbsoluteFill
				style={{
					backgroundColor: '#0000000',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: Math.min(1, frame / 50),
				}}
			>
				<h1
					style={{
						fontFamily,
						color: '#fff',
						fontSize: '52px',
						marginTop: '7rem',
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
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-end',
					opacity: Math.min(1, frame / 50),
					paddingBottom: '2rem',
				}}
			>
				{' '}
				<p
					style={{
						fontFamily: fontFamily,
						color: '#fff',
						fontSize: '24px',
						margin: 0,
					}}
				>
					{'القارئ: مشارى راشد العفاسي'}
				</p>
			</AbsoluteFill>

			<Audio src={url} startFrom={30 * 60 * from} endAt={30 * 60 * to}></Audio>
		</AbsoluteFill>
	);
};
