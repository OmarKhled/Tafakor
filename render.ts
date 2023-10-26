import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createClient, Videos, Video} from 'pexels';
import path from 'path';
import {spawn} from 'child_process';
import {v4} from 'uuid';
import {fileFromSync} from 'node-fetch';
import {getVerse} from './utils/getVerse.js';

const USER_ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;
const TAFAKOR_ID = process.env.TAFAKOR_ID;
const USER_ID = process.env.USER_ID;

const PEXELS_KEY = process.env.PEXELS_KEY as string;

console.log({
	USER_ACCESS_TOKEN,
	TAFAKOR_ID,
	USER_ID,
	PEXELS_KEY,
});

/**
 *
 * @param query - Videos search query
 * @param duration - Video duration
 * @returns
 */
const getVideo = async (query: string, duration: number) => {
	const res: Videos = (await createClient(PEXELS_KEY).videos.search({
		query,
		per_page: 80,
	})) as Videos;

	let video: Video | undefined = undefined;

	const videosCorrelations = res.videos.map((video, index) => ({
		video,
		correlation: video.duration - duration,
	}));

	try {
		video = videosCorrelations
			.filter((duration) => duration.correlation > 0)
			.sort((a, b) => a.correlation - b.correlation)[0].video;
	} catch (error) {
		console.log('Long Videos not availabe: falling back to shorter videos');
		video = videosCorrelations
			.filter((duration) => duration.correlation < 0)
			.sort((a, b) => b.correlation - a.correlation)[0].video;
	}

	// Video URL
	const videoUrl = video.video_files.find(
		(video) => video.quality === 'hd'
	)?.link;

	return {
		url: videoUrl,
		duration: video.duration,
	};
};

(async () => {
	// unique id for video
	const ID = v4();

	// remotion composition id
	const compositionId = 'quran';

	// remotion bundle location
	const bundleLocation = await bundle({
		entryPoint: path.resolve('./src/index.ts'),
		webpackOverride: (config) => config,
	});

	// fetching a verse
	const verse = await getVerse();

	console.log(verse);

	// verse data extraction
	const surah = verse.surah;
	const ayat = [...Array(verse.to - verse.from + 1)].map(
		(e, i) => verse.to + i
	);

	// choosing a theme for the video
	const query = spawn('python', ['verseTopic.py', verse.verse]);

	//
	query.stdout.on('data', async (query: {toString: () => string}) => {
		const theme = query.toString().split('\n')[
			query
				.toString()
				.split('\n')
				.findIndex((q) => q.includes('Topic:'))
		].split(' ')[1];

		console.log('Chosen theme: ', theme);

		const {url} = await getVideo(theme, verse.duration);

		// Composition props
		const inputProps = {
			surah,
			ayat: ayat,
			footage: url,
			random: false,
			footageType: 'video',
		};

		// Composition
		const composition = await selectComposition({
			serveUrl: bundleLocation,
			id: compositionId,
			inputProps,
		});

		// rendering Composition (mostly takes a while)
		await renderMedia({
			composition,
			serveUrl: bundleLocation,
			codec: 'h264',
			enforceAudioTrack: true,
			outputLocation: `out/${compositionId}-${ID}.mp4`,
			inputProps,
			timeoutInMilliseconds: 300000,
		});

		console.log('Video Rendering Done');

		const accounts: {data: {id: string; access_token: string}[]} = await (
			await fetch(
				`https://graph.facebook.com/v18.0/${USER_ID}/accounts?access_token=${USER_ACCESS_TOKEN}`
			)
		).json();

		const TAFAKOR_TOKEN = accounts.data.find(
			(p) => p.id === '145347105330809'
		)?.access_token;

		console.log('Takafor access token acquired');

		const form = new FormData();
		form.append('access_token', TAFAKOR_TOKEN as string);
		form.append('source', fileFromSync('./out/quran-' + ID + '.mp4'));

		console.log(
			await (
				await fetch(
					`https://graph-video.facebook.com/v18.0/${TAFAKOR_ID}/videos`,
					{
						method: 'POST',
						body: form,
					}
				)
			).json()
		);

		console.log('Publish done!');
		process.exit();
	});
})();
