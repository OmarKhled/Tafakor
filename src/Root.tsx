import {Composition} from 'remotion';

import {getVerseData} from '../utils/getVerse';
import {getVerse} from '../utils/getVerse';

import './styles/styles.css';
import RecitationComposition, {
	schema,
} from './components/RecitationComposition';

const SIZES = {
	reel: {
		width: 1080,
		height: 1920,
	},
	post: {
		width: 1000,
		height: 1000,
	},
};

export const RemotionRoot: React.FC = () => {
	const FPS = 30;
	const SIZE = 1000;

	return (
		<>
			<Composition
				id="quran"
				component={RecitationComposition}
				fps={FPS}
				width={1080}
				height={1920}
				schema={schema}
				durationInFrames={1}
				defaultProps={{
					surah: 33,
					ayat: [4],
					footage: '',
					random: true,
					footageType: 'video',
					outputType: 'reel',
					size: SIZES.reel,
				}}
				calculateMetadata={async ({props}) => {
					if (props.random) {
						const verse = await getVerse({});
						console.log(verse);
						props.surah = verse.surah;
						props.ayat = [...Array(verse.to - verse.from + 1)].map(
							(e, i) => verse.from + i
						);
					}
					const {durationInMins} = await getVerseData(props.surah, props.ayat);

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
