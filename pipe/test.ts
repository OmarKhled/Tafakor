import path from 'path';
import {bundle} from '@remotion/bundler';
import {getVerse} from '../utils/getVerse';
import {getStock} from './stocks';
import {renderVideo} from './render';
import {getTheme} from './theme';
import {Verse} from '../utils/types';
import {outputType, stockProvider} from './pipe';

let props: {[key: string]: string} = {};

try {
	props = require('../input-props.json');
	if (Object.keys(props).length > 0) {
		console.log('Input Props Detected', props);
	}
} catch (error) {}

(async () => {
	// remotion bundle location
	const bundleLocation = await bundle({
		entryPoint: path.join(__dirname, '../src/index.ts'),
		webpackOverride: (config) => config,
	});

	// fetching a verse
	const verse: Verse = await getVerse({
		surah: props.surah ? Number(props.surah) : undefined,
		from: props.from ? Number(props.from) : undefined,
		to: props.to ? Number(props.to) : undefined,
	});

	// verse data extraction
	const surah = verse.surah;
	const verses = [...Array(verse.to - verse.from + 1)].map(
		(e, i) => verse.from + i
	);

	console.log(
		`Verse Picked: Surah ${surah}, from ${verses[0]} to ${
			verses[verses.length - 1]
		}, duration: ${verse.duration}`
	);

	// choosing theme for the video
	let theme = '';
	if (!props.video) {
		theme = await getTheme(verse.verse);
	}
	console.log('Chosen theme:', theme);

	let valid = false;
	do {
		const stockVideosProvider: stockProvider = 'PIXABAY';
		let url = '';
		if (props.video) {
			url = props.video;
			console.log(`Prop Video: ${url}`);
		} else {
			url = (await getStock(theme, verse.duration, stockVideosProvider)).url;
			console.log(`${stockVideosProvider} Video: ${url}`);
		}

		if (url) {
			const outputType = (props.outputType as outputType) || 'reel';
			console.log('renderVideo');
			await renderVideo(bundleLocation, surah, verses, url, outputType);

			console.log('Video Rendering Done');

			valid = true;
			process.exit();
		} else {
			continue;
		}
	} while (!valid);
})();
