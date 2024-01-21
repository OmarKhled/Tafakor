import {z} from 'zod';
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';

import Recitation, {schema as mainSchema} from './Main';
import {getVerseData} from '../../../utils/getVerse';
import themes from '../../../constants/themes';

import {getStock} from '../../../pipe/stocks';

// Sura Font
const waitForFont = delayRender();
const suraName = new FontFace(
	`sura`,
	`url('${staticFile('sura_names.woff2')}') format('woff2')`
);
suraName
	.load()
	.then(() => {
		document.fonts.add(suraName);
		continueRender(waitForFont);
	})
	.catch((err) => console.log('Error loading font', err));

export const schema = z.object({
	surah: z.number(),
	ayat: z.array(z.number()),
	footage: z.string(),
	random: z.boolean(),
	outputType: z.union([z.literal('reel'), z.literal('post')]),
	size: z.object({width: z.number(), height: z.number()}),
	reciterId: z.union([z.number(), z.undefined()]),
});

const getImageMetaData = (src: string) =>
	new Promise<{width: number; height: number}>((resolve, reject) => {
		const img = new Image();

		img.src = src;

		img.onload = () => resolve({width: img.width, height: img.height});
		img.onerror = (err) => reject(err);
	});

const Composition: React.FC<z.infer<typeof schema>> = ({
	surah,
	ayat,
	footage = null,
	size,
	outputType,
	reciterId,
}) => {
	const [handle] = useState(() => delayRender());
	const [props, setProps] = useState<z.infer<typeof mainSchema>>();

	useEffect(() => {
		(async () => {
			let footageUrl = footage;

			const verse = await getVerseData(surah, ayat, reciterId);

			if (footageUrl == null || footageUrl.length == 0) {
				console.log('No Media');
				const query = themes[Math.floor(Math.random() * themes.length)];
				const stockVideosProvider = 'PEXELS';
				footageUrl = (
					await getStock(
						query,
						verse.durationInMins * 60,
						stockVideosProvider,
						'null'
					)
				).url as string;
			}

			let contentType = '';

			contentType = (await fetch(footageUrl)).headers
				.get('Content-Type')
				?.split('/')[0] as 'image' | 'video';

			if (!['video', 'image'].includes(contentType)) {
				throw new Error('Content Type is neither image or video');
			} else {
				console.log('Content Type', contentType);
			}

			let footageMetadata: {width: number; height: number};

			if (contentType == 'video') {
				footageMetadata = await getVideoMetadata(footageUrl);
			} else {
				footageMetadata = await getImageMetaData(footageUrl);
				console.log({footageMetadata, contentType});
			}

			console.log({footageMetadata});

			console.log({footageMetadata});

			const dimension =
				footageMetadata.width >= footageMetadata.height
					? {value: footageMetadata.height, type: 'height'}
					: {value: footageMetadata.width, type: 'width'};

			console.log({
				dimension,
				size: size[dimension.type as 'width' | 'height'],
			});
			const scale =
				size[dimension.type as 'width' | 'height'] / dimension.value + 0.04;

			console.log({scale});

			verse.segments = [
				[1, 0.0016666665673255921, 0.013666666547457377],
				[2, 0.014666666587193808, 0.054999999205271405],
				[3, 0.055999998251597086, 0.06833333174387614],
				[4, 0.06866666475931803, 0.075],
				[5, 0.07566666603088379, 0.08899999459584554],
				[6, 0.09033333460489909, 0.10733333428700766],
				[7, 0.11433332761128744, 0.1463333288828532],
			];

			verse.reciter = 'إسلام صبحى';

			setProps({
				footageUrl: footageUrl as string,
				url: verse.url,
				from: verse.from,
				to: verse.to,
				verse: verse.verse,
				segments: verse.segments,
				englishWords: verse.englishWords,
				surahNumber: ('00' + verse.surahNumber).slice(-3),
				active: true,
				reciter: verse.reciter,
				scale,
				outputType,
				footageType: contentType,
			});
			return 0;
		})()
			.then(() => {
				continueRender(handle);
			})
			.catch((err) => {
				continueRender(handle);
				console.log(`Error fetching metadata: ${err}`);
			});
	}, [handle]);

	return (
		<>
			{/* @ts-ignore */}
			<Recitation {...props} />
		</>
	);
};

export default Composition;
