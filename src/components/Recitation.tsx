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

const quranSchema = z.object({
	from: z.number(),
	to: z.number(),
	url: z.string(),
	footageUrl: z.string(),
	verse: z.string(),
	segments: z.array(z.array(z.number())),
	surahNumber: z.string(),
	active: z.boolean(),
	footageType: z.union([z.literal('video'), z.literal('image')]).optional(),
});

export const Recitation: React.FC<z.infer<typeof quranSchema>> = ({
	from,
	to,
	url,
	footageUrl,
	verse,
	segments,
	surahNumber,
	active,
	footageType = 'video',
}) => {
	const frame = useCurrentFrame();
	const min = frame / 30 / 60;
	const [currentVerseIndex, setCurrentVerseIndex] = useState(1);

	useEffect(() => {
		console.log({url, to, from, segments, verse});
	}, []);

	if (active) {
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{footageType == 'video' ? (
					<>
						<Video
							src={
								// 'https://player.vimeo.com/external/221214113.sd.mp4?s=2519b65070b6e2ea98b219a6c0fbd9d6e53a7242&profile_id=165&oauth2_token_id=57447761#t=0,19.2'
								footageUrl
							}
							style={{scale: '2', width: '1000px', height: '1000px'}}
							loop
							muted
						></Video>
					</>
				) : (
					footageType == 'image' && (
						<>
							<Img
								src={
									// 'https://player.vimeo.com/external/221214113.sd.mp4?s=2519b65070b6e2ea98b219a6c0fbd9d6e53a7242&profile_id=165&oauth2_token_id=57447761#t=0,19.2'
									footageUrl
								}
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

				<AbsoluteFill
					style={{
						// backgroundColor: '#000',
						// opacity: 0.4,
						backdropFilter: 'blur(4px) brightness(60%)',
					}}
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
					frame={frame}
					verse={verse}
					segments={segments}
					setCurrentVerseIndex={setCurrentVerseIndex}
					currentVerseIndex={currentVerseIndex}
					font={Amiri}
				/>

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
						<p className="rectier">{'القارئ: مشارى راشد العفاسي'}</p>
					</div>{' '}
				</AbsoluteFill>

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
