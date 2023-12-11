import {z} from 'zod';
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {getVideoMetadata} from '@remotion/media-utils';
import {loadFont} from '@remotion/google-fonts/Amiri';

import Recitation, {schema as mainSchema} from './Main';
import {getVerseData} from '../../../utils/getVerse';
import themes from '../../../constants/themes';

import {getStock} from '../../../pipe/stocks';

import {STOCKS} from '../../../constants/stocks';

// Load Amiri Font
loadFont();

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
});

const Composition: React.FC<z.infer<typeof schema>> = ({
	surah,
	ayat,
	footage = null,
	size,
	outputType,
}) => {
	const [handle] = useState(() => delayRender());
	const [props, setProps] = useState<z.infer<typeof mainSchema>>();

	useEffect(() => {
		(async () => {
			let footageUrl = footage;

			const verse = await getVerseData(surah, ayat);

			if (footageUrl == null || footageUrl.length == 0) {
				console.log('No Media');
				const query = themes[Math.floor(Math.random() * themes.length)];
				const stockVideosProvider =
					STOCKS[Math.floor(Math.random() * STOCKS.length)];
				footageUrl = (
					await getStock(query, verse.durationInMins * 60, stockVideosProvider)
				).url as string;
			}

			const footageMetadata = await getVideoMetadata(footageUrl);

			const dimension =
				footageMetadata.width > footageMetadata.height
					? {value: footageMetadata.height, type: 'height'}
					: {value: footageMetadata.width, type: 'width'};

			const scale = Math.ceil(
				size[dimension.type as 'width' | 'height'] / dimension.value
			);

			setProps({
				footageUrl: footageUrl as string,
				url: verse.url,
				from: verse.from,
				to: verse.to,
				verse: verse.verse,
				segments: verse.segments,
				surahNumber: ('00' + verse.surahNumber).slice(-3),
				active: true,
				reciter: verse.reciter,
				scale,
				outputType,
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
