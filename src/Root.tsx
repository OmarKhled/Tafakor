import {Composition} from 'remotion';

import Main, {schema} from './compositions/Main';

import {getVerseData} from '../utils/getVerse';
import {getVerse} from '../utils/getVerse';
import {SIZES} from '../constants/sizes';

import './styles/styles.css';

declare module 'react' {
	interface CSSProperties {
		[key: `--${string}`]: string | number;
	}
}

const DEFAULT_OUT = 'reel';

export const RemotionRoot: React.FC = () => {
	const FPS = 30;

	return (
		<>
			<Composition
				id="quran"
				component={Main}
				fps={FPS}
				width={1080}
				height={1920}
				schema={schema}
				durationInFrames={341}
				defaultProps={{
					surah: 26,
					ayat: [41, 42, 43, 44, 45, 46, 47],
					footage: '',
					random: true,
					outputType: DEFAULT_OUT,
					size: SIZES[DEFAULT_OUT],
				}}
				calculateMetadata={async ({props}) => {
					if (props.random) {
						const verse = await getVerse({});
						props.footage = verse.video ?? '';
						props.surah = verse.surah;
						props.ayat = [...Array(verse.to - verse.from + 1)].map(
							(e, i) => verse.from + i
						);
					}

					// const {durationInMins} = await getVerseData(
					// 	props.surah,
					// 	props.ayat,
					// 	props.reciterId
					// );

					const durationInMins = 35.8 / 60;

					props.size = SIZES[props.outputType];

					return {
						durationInFrames: Math.ceil(durationInMins * FPS * 60),
						width: props.size.width,
						height: props.size.height,
						props,
					};
				}}
			/>
		</>
	);
};
