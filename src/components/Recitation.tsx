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

import {Img} from 'remotion';
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

const schema = z.object({
	from: z.number(),
	to: z.number(),
	url: z.string(),
	footageUrl: z.string(),
	verse: z.string(),
	segments: z.array(z.array(z.number())),
	surahNumber: z.string(),
	active: z.boolean(),
	footageType: z.union([z.literal('video'), z.literal('image')]).optional(),
	reciter: z.string(),
});

export const Recitation: React.FC<z.infer<typeof schema>> = ({
	from,
	to,
	url,
	footageUrl,
	verse,
	segments,
	surahNumber,
	active,
	footageType = 'video',
	reciter,
}) => {
	const frame = useCurrentFrame();
	const min = frame / 30 / 60;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);

	useEffect(() => {
		console.log({url, to, from, segments, verse});
	}, [verse]);

	if (active) {
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{footageType == 'video' ? (
					<>
						<Video
							src={footageUrl}
							style={{scale: '2', width: '1000px', height: '1000px'}}
							loop
							muted
						></Video>
					</>
				) : (
					footageType == 'image' && (
						<>
							<Img
								src={footageUrl}
								style={{
									scale: '1',
									width: '1000px',
									bottom: '-200px',
									position: 'absolute',
								}}
							></Img>
						</>
					)
				)}

				{/* Darken Backdrop */}
				<AbsoluteFill
					style={{
						backdropFilter: 'blur(1px) brightness(60%)',
					}}
				></AbsoluteFill>

				{/* Surah Name */}
				<AbsoluteFill
					className="wrapper start"
					style={{
						opacity: Math.min(1, frame / 50),
					}}
				>
					{' '}
					<p className="sura-name">{surahNumber}</p>
				</AbsoluteFill>

				{/* Verse(s) text */}
				<Verse
					min={min}
					frame={frame}
					verse={verse}
					segments={segments}
					setCurrentVerseIndex={setCurrentVerseIndex}
					currentVerseIndex={currentVerseIndex}
					font={Amiri}
				/>

				{/* Reciter Name */}
				<AbsoluteFill
					className="wrapper end"
					style={{
						opacity: Math.min(1, frame / 50),
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '1rem',
							width: '100%',
							justifyContent: 'space-between',
							padding: '0 2rem',
						}}
					>
						<Img src={staticFile('logo.png')} style={{height: '50px'}} />
						<p className="rectier">{`القارئ: ${reciter}`}</p>
					</div>
				</AbsoluteFill>

				{/* Recitation Audio */}
				<Audio
					src={url}
					startFrom={30 * 60 * from}
					endAt={30 * 60 * to}
				></Audio>
			</AbsoluteFill>
		);
	} else {
		return <>waiting</>;
	}
};
