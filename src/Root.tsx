import {Composition} from 'remotion';
import {Quran} from './Quran';
import {getVerse} from './fetchVerse';
import {Videos, createClient} from 'pexels';

export const RemotionRoot: React.FC = () => {
	const FPS = 30;
	return (
		<>
			<Composition
				id="quran"
				component={Quran}
				durationInFrames={15 * FPS}
				fps={FPS}
				width={1000}
				height={1000}
				defaultProps={{
					url: '',
					from: 1,
					to: 2,
					videoUrl: '',
					verse: '',
					segments: [],
					surahNumber: '',
				}}
				calculateMetadata={async () => {
					const client = createClient(
						'nvPRX0Fsxoq9YJyb4F6UaqA9BkQWYTraTFosgXnFpxSxLJ9BqjPtNrM6'
					);
					const query = 'trees';
					const res = (await client.videos.search({
						query,
						per_page: 15,
					})) as Videos;

					console.log(res);

					const videoUrl = res.videos[
						Math.floor(Math.random() * 15)
					].video_files.find((video) => video.quality === 'hd')?.link;

					console.log('object1');
					const verse = await getVerse();
					console.log(verse);
					console.log('object');
					return {
						durationInFrames: Math.ceil(verse.durationInMins * FPS * 60),
						props: {
							videoUrl: videoUrl
								? videoUrl
								: 'https://player.vimeo.com/external/337026530.hd.mp4?s=f3a7a73d796fc248234666202804de2e3d075c91&profile_id=172&oauth2_token_id=57447761',
							url: verse.url,
							from: verse.start,
							to: verse.to,
							verse: verse.verse,
							segments: verse.segments,
							surahNumber: ('00' + verse.surahNumber).slice(-3),
						},
					};
				}}
			/>
		</>
	);
};
