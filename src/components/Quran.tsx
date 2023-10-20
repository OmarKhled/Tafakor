import {createClient, Videos} from 'pexels';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import recitationDefaultProps from '../../constants/recitationDefaultProps';
import stocksTypes from '../../constants/stocksTypes';
import {getVerseData} from '../../utils/getVerseData';
import {Recitation} from './Recitation';

export const schema = z.object({
	surah: z.number(),
	ayat: z.array(z.number()),
	footage: z.string(),
	random: z.boolean(),
	footageType: z.union([z.literal('video'), z.literal('image')]),
});

const Quran: React.FC<z.infer<typeof schema>> = ({
	surah,
	ayat,
	footage = null,
	random,
	footageType,
}) => {
	const [handle] = useState(() => delayRender());

	const [props, setProps] = useState(recitationDefaultProps);

	useEffect(() => {
		(async () => {
			console.log({surah, ayat});
			const types = stocksTypes;
			const query = types[Math.floor(Math.random() * types.length)];
			// const query = 'alpine';

			const res = (await createClient(
				'nvPRX0Fsxoq9YJyb4F6UaqA9BkQWYTraTFosgXnFpxSxLJ9BqjPtNrM6'
			).videos.search({
				query,
				per_page: 30,
			})) as Videos;

			const footageUrl = res.videos[
				Math.floor(Math.random() * res.videos.length)
			].video_files.find((video) => video.quality === 'hd')?.link;

			const verse = await getVerseData(surah, ayat);

			console.log(verse);

			console.log('video', footage);

			setProps({
				footageUrl:
					footage !== null && footage.length > 0
						? footage
						: (footageUrl as string),
				url: verse.url,
				from: verse.start,
				to: verse.to,
				verse: verse.verse,
				segments: verse.segments,
				surahNumber: ('00' + verse.surahNumber).slice(-3),
				active: true,
				footageType: footageType as 'video' | 'image',
			});
			return 0;
		})()
			.then(() => {
				continueRender(handle);
			})
			.catch((err) => {
				console.log(`Error fetching metadata: ${err}`);
			});
	}, [handle]);

	return (
		<>
			<Recitation {...props} />
		</>
	);
};

export default Quran;
