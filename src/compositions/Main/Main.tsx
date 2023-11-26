import {
	AbsoluteFill,
	Audio,
	useCurrentFrame,
	continueRender,
	delayRender,
	staticFile,
} from 'remotion';
import {z} from 'zod';

import Verse from '../../components/Verse';
import BackgroundFill from '../../components/BackgroundFill';
import Surah from '../../components/Surah';
import Footer from '../../components/Footer';

import {loadFont} from '@remotion/google-fonts/Amiri';

// Load Amiri Font
loadFont();

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

export const schema = z.object({
	from: z.number(),
	to: z.number(),
	url: z.string(),
	footageUrl: z.string(),
	verse: z.string(),
	segments: z.array(z.array(z.number())),
	surahNumber: z.string(),
	active: z.boolean(),
	reciter: z.string(),
	scale: z.number(),
	outputType: z.union([z.literal('reel'), z.literal('post')]),
});

const Main: React.FC<z.infer<typeof schema>> = ({
	from,
	to,
	url,
	footageUrl,
	verse,
	segments,
	surahNumber,
	active,
	reciter,
	scale,
	outputType,
}) => {
	const frame = useCurrentFrame();
	const min = frame / 30 / 60;

	if (active) {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: 'white',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* BackgroundFill (Video) */}
				<BackgroundFill footageUrl={footageUrl} scale={scale} />

				{/* Surah Name */}
				<Surah
					frame={frame}
					surahNumber={surahNumber}
					size={outputType === 'post' ? 'rg' : 'lg'}
				/>

				{/* Verse(s) text */}
				<Verse
					min={min}
					frame={frame}
					verse={verse}
					segments={segments}
					size={outputType === 'post' ? 'rg' : 'lg'}
				/>

				{/* Reciter Name */}
				<Footer
					name={reciter}
					frame={frame}
					size={outputType === 'post' ? 'rg' : 'lg'}
				/>

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

export default Main;
