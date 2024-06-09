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

			contentType = (await fetch(footageUrl)).headers
				.get('Content-Type')
				?.split('/')[0] as 'image' | 'video';

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

			// verse.segments = [
			// 	[0, 0.009666666388511658, 0.016999999682108562],
			// 	[1, 0.017999998728434243, 0.05299999713897705],
			// 	[2, 0.05333333015441895, 0.062333333492279056],
			// 	[3, 0.06266666650772094, 0.0853333314259847],
			// 	[4, 0.0856666644414266, 0.08933332761128744],
			// 	[5, 0.09333333174387613, 0.1056666612625122],
			// 	[6, 0.1066666603088379, 0.11999999682108561],
			// 	[7, 0.1203333298365275, 0.13733332951863605],
			// 	[8, 0.13766667048136394, 0.17799998919169108],
			// 	[9, 0.17833333015441893, 0.23333333333333334],
			// 	[10, 0.23366665840148926, 0.2413333257039388],
			// 	[11, 0.2456666628519694, 0.26833333969116213],
			// 	[12, 0.2686666488647461, 0.31499999364217124],
			// 	[13, 0.3153333346048991, 0.32133331298828127],
			// 	[14, 0.32566665013631185, 0.33533331553141277],
			// 	[15, 0.3356666564941406, 0.36666666666666664],
			// 	[16, 0.36700000762939455, 0.4149999936421712],
			// ];

			// verse.reciter = 'محمد ديبيروف';

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
