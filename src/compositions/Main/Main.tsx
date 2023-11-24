import {AbsoluteFill, Audio, useCurrentFrame} from 'remotion';
import {z} from 'zod';

import Verse from '../../components/Verse';
import BackgroundFill from '../../components/BackgroundFill';
import Surah from '../../components/Surah';
import ReciterName from '../../components/Footer';

const schema = z.object({
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
});

const Recitation: React.FC<z.infer<typeof schema>> = ({
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
				<Surah frame={frame} surahNumber={surahNumber} />

				{/* Verse(s) text */}
				<Verse min={min} frame={frame} verse={verse} segments={segments} />

				{/* Reciter Name */}
				<ReciterName name={reciter} frame={frame} />

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

export default Recitation;
