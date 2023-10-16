import {createClient, Videos} from 'pexels';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import recitationDefaultProps from '../constants/recitationDefaultProps';
import stocksTypes from '../constants/stocksTypes';
import {getVerse} from '../utils/fetchByVerseNumber';
import {Recitation} from './Recitation';

export const schema = z.object({
	surah: z.number(),
	ayat: z.array(z.number()),
});

const Quran: React.FC<z.infer<typeof schema>> = ({surah, ayat}) => {
	// const [handle] = useState(() => delayRender());
	const [props, setProps] = useState(recitationDefaultProps);

	// useEffect(() => {
	// 	(async () => {
	// 		// console.log({surah, ayat});
	// 		// const types = stocksTypes;
	// 		// const query = types[Math.floor(Math.random() * types.length)];
	// 		// // const query = 'alpine';

	// 		// const res = (await createClient(
	// 		// 	'nvPRX0Fsxoq9YJyb4F6UaqA9BkQWYTraTFosgXnFpxSxLJ9BqjPtNrM6'
	// 		// ).videos.search({
	// 		// 	query,
	// 		// 	per_page: 30,
	// 		// })) as Videos;

	// 		// const videoUrl = res.videos[
	// 		// 	Math.floor(Math.random() * res.videos.length)
	// 		// ].video_files.find((video) => video.quality === 'hd')?.link;

	// 		// const verse = await getVerse(surah, ayat);

	// 		// console.log(verse);

	// 		// setProps({
	// 		// 	videoUrl: videoUrl as string,
	// 		// 	url: verse.url,
	// 		// 	from: verse.start,
	// 		// 	to: verse.to,
	// 		// 	verse: verse.verse,
	// 		// 	segments: verse.segments,
	// 		// 	surahNumber: ('00' + verse.surahNumber).slice(-3),
	// 		// 	active: true,
	// 		// });
	// 		return 0;
	// 	})()
	// 		.then(() => {
	// 			continueRender(handle);
	// 		})
	// 		.catch((err) => {
	// 			console.log(`Error fetching metadata: ${err}`);
	// 		});
	// }, [handle]);

	return (
		<>
			<Recitation {...props} />
		</>
	);
};

export default Quran;
