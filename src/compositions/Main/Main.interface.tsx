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
				[0, 0.0, 0.014666666666666666],
				[1, 0.017333333333333333, 0.028666666666666667],
				[2, 0.03133333333333333, 0.04733333333333333],
				[3, 0.04933333333333333, 0.07],
				[4, 0.08666666666666667, 0.10666666666666667],
				[5, 0.11066666666666666, 0.12066666666666666],
				[6, 0.12266666666666667, 0.13266666666666668],
				[7, 0.136, 0.15000000000000002],
				[8, 0.15933333333333335, 0.1806666666666667],
				[9, 0.18266666666666667, 0.19466666666666668],
				[10, 0.19666666666666668, 0.2026666666666667],
				[11, 0.20400000000000001, 0.21466666666666667],
				[8, 0.254, 0.27666666666666667],
				[9, 0.2786666666666667, 0.2906666666666667],
				[10, 0.29266666666666663, 0.298],
				[11, 0.29933333333333334, 0.3086666666666667],
				[12, 0.312, 0.334],
				[13, 0.35133333333333333, 0.368],
				[14, 0.37133333333333335, 0.3746666666666667],
				[15, 0.3766666666666667, 0.396],
				[16, 0.39799999999999996, 0.4086666666666666],
				[17, 0.4106666666666667, 0.42133333333333334],
				[18, 0.42400000000000004, 0.43733333333333335],
				[19, 0.43866666666666665, 0.45199999999999996],
				[20, 0.45399999999999996, 0.46399999999999997],
				[21, 0.4653333333333334, 0.4866666666666667],
				[22, 0.5046666666666667, 0.522],
				[23, 0.524, 0.5313333333333333],
				[24, 0.5366666666666667, 0.5506666666666667],
				[25, 0.5519999999999999, 0.5706666666666667],
				[26, 0.5726666666666667, 0.5866666666666667],
				[27, 0.588, 0.5926666666666667],
				[28, 0.594, 0.6086666666666667],
				[29, 0.6646666666666667, 0.6766666666666667],
				[30, 0.6799999999999999, 0.694],
				[31, 0.706, 0.7293333333333333],
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
