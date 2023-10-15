import {Composition} from 'remotion';
import {quranSchema, Recitation} from './components/Recitation';
import {getVerse} from '../utils/fetchByVerseNumber';

import './styles/styles.css';
import Quran, {schema} from './components/Quran';

export const RemotionRoot: React.FC = () => {
	const FPS = 30;
	const SIZE = 1000;

	return (
		<>
			<Composition
				id="quran"
				component={Quran}
				fps={FPS}
				width={SIZE}
				height={SIZE}
				schema={schema}
				durationInFrames={1}
				defaultProps={{
					surah: 3,
					ayat: [2],
				}}
				calculateMetadata={async ({props}) => {
					console.log('hellllllo', props);
					const {durationInMins} = await getVerse(props.surah, props.ayat);

					return {
						durationInFrames: Math.ceil(durationInMins * FPS * 60),
						props,
					};
				}}
			/>
		</>
	);
};
