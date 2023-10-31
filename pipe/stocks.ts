import {createClient, Videos, Video} from 'pexels';

const PEXELS_KEY = process.env.PEXELS_KEY as string;

/**
 *
 * @param query - Videos search query
 * @param duration - Video duration
 * @returns
 */
const getStock = async (query: string, duration: number) => {
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

export {getStock};
