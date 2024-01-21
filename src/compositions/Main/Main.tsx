import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';

import Verse from '../../components/Verse';
import BackgroundFill from '../../components/BackgroundFill';
import Surah from '../../components/Surah';
import Footer from '../../components/Footer';

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
	englishWords: z.array(z.string()),
	footageType: z.string(),
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
	englishWords,
	footageType,
}) => {
	const frame = useCurrentFrame();
	const min = frame / 30 / 60;

	if (active) {
		return (
			<AbsoluteFill>
				{/* BackgroundFill (Video) */}
				<BackgroundFill
					footageType={footageType}
					footageUrl={footageUrl}
					scale={scale}
				/>

				<AbsoluteFill
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: outputType === 'post' ? '1rem 1.5rem' : '2rem',
					}}
				>
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
						englishWords={englishWords}
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
			</AbsoluteFill>
		);
	} else {
		return <div className="strips">waiting</div>;
	}
};

export default Main;
