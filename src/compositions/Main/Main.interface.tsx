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
				[0, 0.005333333333333333, 0.016],
				[1, 0.01933333333333333, 0.03533333333333333],
				[2, 0.06733333333333333, 0.09466666666666666],
				[3, 0.09733333333333333, 0.11066666666666666],
				[4, 0.11266666666666666, 0.12333333333333334],
				[5, 0.12533333333333332, 0.13666666666666666],
				[6, 0.13933333333333334, 0.154],
				[7, 0.18266666666666667, 0.18866666666666668],
				[4, 0.19133333333333333, 0.20133333333333334],
				[9, 0.2033333333333333, 0.21866666666666665],
				[10, 0.22866666666666668, 0.23733333333333334],
				[11, 0.24000000000000002, 0.24333333333333335],
				[12, 0.24733333333333332, 0.2713333333333333],
				[13, 0.2786666666666667, 0.3046666666666667],
				[14, 0.312, 0.3446666666666667],
				[15, 0.3626666666666667, 0.378],
				[16, 0.382, 0.39466666666666667],
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
				reciter: 'شريف مصطفى',
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
