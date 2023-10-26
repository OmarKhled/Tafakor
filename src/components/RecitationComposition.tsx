import {z} from 'zod';
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

import {createClient, Videos} from 'pexels';

import {getVerseData} from '../../utils/getVerse';

import recitationDefaultProps from '../../constants/recitationDefaultProps';
import themes from '../../constants/themes';

import {Recitation} from './Recitation';

export const schema = z.object({
	surah: z.number(),
	ayat: z.array(z.number()),
	footage: z.string(),
	random: z.boolean(),
	footageType: z.union([z.literal('video'), z.literal('image')]),
});

const Composition: React.FC<z.infer<typeof schema>> = ({
	surah,
	ayat,
	footage = null,
	footageType,
}) => {
	const [handle] = useState(() => delayRender());
	const [props, setProps] = useState(recitationDefaultProps);

	useEffect(() => {
		(async () => {
			const query = themes[Math.floor(Math.random() * themes.length)];

			const res = (await createClient(
				'nvPRX0Fsxoq9YJyb4F6UaqA9BkQWYTraTFosgXnFpxSxLJ9BqjPtNrM6'
			).videos.search({
				query,
				per_page: 80,
			})) as Videos;

			const footageUrl = res.videos[
				Math.floor(Math.random() * res.videos.length)
			].video_files.find((video) => video.quality === 'hd')?.link;

			const verse = await getVerseData(surah, ayat);

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
				reciter: verse.reciter,
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

export default Composition;
