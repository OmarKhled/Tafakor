import {renderMedia, selectComposition} from '@remotion/renderer';
import {v4} from 'uuid';
import {ProgressBar} from '@opentf/cli-pbar';
import {outputType} from './pipe';
import {spawn} from 'child_process';
import path from 'path';

const SIZES = {
	reel: {
		width: 1080,
		height: 1920,
	},
	post: {
		width: 1000,
		height: 1000,
	},
};

/**
 * @description renders comp
 * @param bundleLocation - remotion bundle location
 * @param surah - surah number
 * @param verses - verses
 * @param footage - footage url
 */
const renderVideo = async (
	bundleLocation: string,
	surah: number,
	verses: number[],
	footage: string,
	outputType: outputType
) => {
	try {
		const ID = v4(); // unique video id
		const compositionId = 'quran';

		// Composition props
		const inputProps = {
			surah,
			ayat: verses,
			footage,
			random: false,
			size: SIZES[outputType],
			outputType,
		};

		// Composition
		const composition = await selectComposition({
			serveUrl: bundleLocation,
			id: compositionId,
			inputProps,
			logLevel: 'verbose',
		});

		// Rendering progress bar init
		const multiBar = new ProgressBar();
		multiBar.start();
		const renderingProgresss = multiBar.add({total: 100, color: 'blue'});

		// Rendering Composition (mostly takes a while)
		await renderMedia({
			composition,
			serveUrl: bundleLocation,
			codec: 'h264',
			enforceAudioTrack: true,
			outputLocation: `out/${compositionId}-${ID}.mp4`,
			inputProps,
			timeoutInMilliseconds: 300000,
			onBrowserLog: (log) => {
				console.log(log);
			},
			logLevel: 'verbose',
			// concurrency: 8,
			onProgress: ({progress}) => {
				// renderingProgresss?.update({value: progress * 100});
				console.log('Rendering Porgress:', progress * 100);
			},
			onDownload: (src) => {
				console.log(`\nDownloading ${src} ...`);
				// const downloadProgress = multiBar.add({total: 100});
				return ({percent, downloaded, totalSize}) => {
					if (percent !== null) {
						console.log('Downloading Porgress:', percent * 100);
						// downloadProgress?.update({value: percent * 100});

						// const query = spawn('ls', [path.join(__dirname, '../out')]);
						// query.stdout.on('data', (data: {toString: () => string}) => {
						// 	console.log(data.toString());
						// });
					}
				};
			},
		});

		return `${compositionId}-${ID}.mp4`;
	} catch (error) {
		console.log(error);
		throw new Error('Video Rendering Error');
	}
};

export {renderVideo};
