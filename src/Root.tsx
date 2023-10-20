import {Composition} from 'remotion';

import {getVerseData} from '../utils/getVerseData';
import {getVerse} from '../utils/getVerse';

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
					surah: 33,
					ayat: [4],
					footage: '',
					random: true,
					footageType: 'video',
				}}
				calculateMetadata={async ({props}) => {
					if (props.random) {
						const verse = await getVerse();
						console.log(verse);
						props.surah = verse.surah;
						props.ayat = [...Array(verse.to - verse.from + 1)].map(
							(e, i) => verse.to + i
						);
					}
					const {durationInMins} = await getVerseData(props.surah, props.ayat);

					return {
						durationInFrames: Math.ceil(durationInMins * FPS * 60),
						props,
					};
				}}
			/>
		</>
	);
};
