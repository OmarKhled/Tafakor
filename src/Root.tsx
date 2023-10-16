import {Composition} from 'remotion';
import {getVerse} from '../utils/fetchByVerseNumber';

import '../styles/styles.css';
import {Recitation} from '../components/Recitation';
import recitationDefaultProps from '../constants/recitationDefaultProps';
import stocksTypes from '../constants/stocksTypes';
import {createClient, Videos} from 'pexels';

export const RemotionRoot: React.FC = () => {
	const FPS = 30;
	const SIZE = 1000;

	return (
		<>
			<Composition
				id="quran2"
				component={Recitation}
				fps={FPS}
				width={SIZE}
				height={SIZE}
				durationInFrames={1}
				defaultProps={recitationDefaultProps}
				calculateMetadata={async ({props}) => {
					const types = stocksTypes;
					const query = types[Math.floor(Math.random() * types.length)];
					// const query = 'alpine';

					const res = (await createClient(
						'nvPRX0Fsxoq9YJyb4F6UaqA9BkQWYTraTFosgXnFpxSxLJ9BqjPtNrM6'
					).videos.search({
						query,
						per_page: 30,
					})) as Videos;

					const videoUrl = res.videos[
						Math.floor(Math.random() * res.videos.length)
					].video_files.find((video) => video.quality === 'hd')?.link;

					const verse = await getVerse(3, [2]);

					console.log(verse);

					return {
						durationInFrames: Math.ceil(verse.durationInMins * FPS * 60),
						props: {
							videoUrl: videoUrl as string,
							url: verse.url,
							from: verse.start,
							to: verse.to,
							verse: verse.verse,
							segments: verse.segments,
							surahNumber: ('00' + verse.surahNumber).slice(-3),
							active: true,
						},
					};
				}}
			/>

			{/* <Composition
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
					const {durationInMins} = await getVerse(props.surah, props.ayat);

					return {
						durationInFrames: Math.ceil(durationInMins * FPS * 60),
						props,
					};
				}}
			/> */}
		</>
	);
};
