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
				[0, 0.0033333333333333335, 0.013333333333333334],
				[1, 0.015333333333333334, 0.035333333333333335],
				[2, 0.03666666666666667, 0.051333333333333335],
				[3, 0.05333333333333334, 0.060000000000000005],
				[4, 0.06333333333333332, 0.07066666666666666],
				[5, 0.08, 0.08466666666666667],
				[6, 0.08600000000000001, 0.11000000000000001],
				[7, 0.11733333333333333, 0.12466666666666666],
				[8, 0.12733333333333333, 0.13866666666666666],
				[9, 0.14066666666666666, 0.15333333333333332],
				[10, 0.156, 0.16],
				[11, 0.16133333333333333, 0.172],
				[12, 0.174, 0.188],
				[13, 0.19933333333333333, 0.20866666666666667],
				[14, 0.21, 0.2713333333333333],
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
				reciter: 'هزاع البلوشى',
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
