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

export const quranSchema = z.object({
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

	useEffect(() => {
		console.log({url, to, from, segments, verse});
	}, []);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<Video
				src={
					// staticFile('123.mp4')
					// 'https://player.vimeo.com/external/221214113.sd.mp4?s=2519b65070b6e2ea98b219a6c0fbd9d6e53a7242&profile_id=165&oauth2_token_id=57447761#t=0,19.2'
					videoUrl
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

			<Verse
				min={min}
				currentVerseIndex={currentVerseIndex}
				setCurrentVerseIndex={setCurrentVerseIndex}
				font={Amiri}
				frame={frame}
				verse={verse}
				segments={segments}
			/>

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
