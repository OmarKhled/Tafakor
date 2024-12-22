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

			console.log({footageUrl});

			console.log({verse});

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

			let contentType = 'video';

			contentType =
				((await fetch(footageUrl)).headers
					.get('Content-Type')
					?.split('/')[0] as 'image' | 'video') || contentType;

			console.log('Content Type', {contentType});

			if (!['video', 'image'].includes(contentType)) {
				throw new Error('Content Type is neither image or video');
			}

			let footageMetadata: {width: number; height: number};

			if (contentType == 'video') {
				footageMetadata = await getVideoMetadata(footageUrl);
			} else {
				footageMetadata = await getImageMetaData(footageUrl);
			}

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

			const segments = [
				[0, 0.008, 0.019333333333333334],
				[1, 0.022000000000000002, 0.036000000000000004],
				[2, 0.03933333333333333, 0.056],
				[3, 0.058, 0.08733333333333333],
				[4, 0.09066666666666667, 0.09866666666666667],
				[5, 0.10066666666666667, 0.12133333333333333],
				[6, 0.12333333333333334, 0.13466666666666666],
				[7, 0.13533333333333333, 0.1553333333333333],
				[8, 0.158, 0.18000000000000002],
				[9, 0.19733333333333333, 0.21733333333333332],
				[10, 0.22, 0.23399999999999999],
				[11, 0.23733333333333334, 0.24933333333333335],
				[12, 0.25133333333333335, 0.262],
				[13, 0.26799999999999996, 0.2826666666666666],
				[14, 0.29533333333333334, 0.3],
				[15, 0.302, 0.3486666666666667],
				[17, 0.35866666666666663, 0.37133333333333335],
				[18, 0.37466666666666665, 0.39133333333333337],
				[19, 0.39466666666666667, 0.4093333333333333],
				[20, 0.43333333333333335, 0.4553333333333333],
			];

			// verse.reciter =

			setProps({
				footageUrl: footageUrl as string,
				url: verse.url,
				from: verse.from,
				to: verse.to,
				verse: verse.verse,
				segments: segments,
				englishWords: verse.englishWords,
				surahNumber: ('00' + verse.surahNumber).slice(-3),
				active: true,
				reciter: 'محمد هشام',
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
				// continueRender(handle);
				throw new Error(`Error fetching metadata: ${err}`);
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
