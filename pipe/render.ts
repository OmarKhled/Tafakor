import {renderMedia, selectComposition} from '@remotion/renderer';
import {v4} from 'uuid';
import {outputType} from './pipe';

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
	outputType: outputType,
	reciterId: number | undefined
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
			reciterId,
		};

		// Composition
		const composition = await selectComposition({
			serveUrl: bundleLocation,
			id: compositionId,
			inputProps,
			logLevel: 'verbose',
		});

		// Rendering Composition (mostly takes a while)
		await renderMedia({
			composition,
			serveUrl: bundleLocation,
			codec: 'h264',
			enforceAudioTrack: true,
			outputLocation: `out/${compositionId}-${ID}.mp4`,
			inputProps,
			timeoutInMilliseconds: 300000,
			logLevel: 'info',
			// concurrency: 8,
			onProgress: ({progress, encodedFrames, renderedFrames}) => {
				console.log(
					'Rendering Porgress:',
					renderedFrames,
					encodedFrames,
					progress * 100
				);
			},
		});

		return `${compositionId}-${ID}.mp4`;
	} catch (error) {
		console.log(error);
		throw new Error('Video Rendering Error');
	}
};

export {renderVideo};
