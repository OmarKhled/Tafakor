import path from 'path';
import dotenv from 'dotenv';
import {readFileSync} from 'fs';
import {readFile} from 'fs/promises';
import {bundle} from '@remotion/bundler';
import {S3Client, PutObjectCommand, ObjectCannedACL} from '@aws-sdk/client-s3';
import {getVerse} from '../utils/getVerse';
import {renderVideo} from './render';
import {getTheme} from './theme';
import {submitPosting} from './publish';
import {getStock} from './stocks';
import {Verse} from '../utils/types';
import {outputType, stockProvider} from './pipe';

dotenv.config();

let props: {[key: string]: string} = {};

try {
	props = JSON.parse(readFileSync('input-props.json', 'utf-8'));
	if (Object.keys(props).length > 0) {
		console.log('Input Props Detected', props);
	}
} catch (error) {}

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY as string;

const s3 = new S3Client({
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY,
	},
	region: 'eu-north-1',
});

(async () => {
	// remotion bundle location
	const bundleLocation = await bundle({
		entryPoint: path.join(process.cwd(), 'src/index.ts'),
		webpackOverride: (config) => config,
	});

	// fetching a verse
	const verse: Verse = await getVerse({
		surah: props.surah ? Number(props.surah) : undefined,
		from: props.from ? Number(props.from) : undefined,
		to: props.to ? Number(props.to) : undefined,
	});

	console.log(verse.duration);

	// verse data extraction
	const {surah} = verse;
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

	const stockVideosProvider: stockProvider = 'PIXABAY';
	let url = '';
	let videoId = '';
	if (props.video) {
		url = props.video;
		console.log(`Prop Video: ${url}`);
	} else {
		const video = await getStock(theme, verse.duration, stockVideosProvider);
		url = video.url;
		videoId = video.id;
		console.log(`${stockVideosProvider} Video: ${url}, videoId ${videoId}`);
	}

	let valid = false;
	do {
		if (url) {
			const outputType = (props.outputType as outputType) || 'reel';
			console.log('renderVideo');
			const fileName = await renderVideo(
				bundleLocation,
				surah,
				verses,
				url,
				outputType
			);

			console.log('Video Rendering Done');

			const file = await readFile(path.join(process.cwd(), '/out/' + fileName));

			const params = {
				Bucket: 'tafakor',
				Key: 'videos' + '/' + fileName,
				Body: file,
				ACL: ObjectCannedACL.public_read,
				ContentType: 'video/mp4',
			};

			// Push To S3
			await s3.send(new PutObjectCommand(params));

			const fileUrl = `${process.env.S3_ENDPOINT}${fileName}`;
			console.log(`Uploaded to S3: ${fileUrl}`);

			// Publish to FB
			console.log('Submitting Publishment...');

			console.log({
				outputType,
				fileUrl,
				verseId: String(verse.id),
				stockId: String(videoId),
				stockVideosProvider,
			});

			const publishStatus = await submitPosting(
				outputType,
				fileUrl,
				String(verse.id),
				String(videoId),
				stockVideosProvider
			);
			if (publishStatus) {
				console.log('Submitted');
			} else {
				throw new Error('Publishing Failed');
			}

			valid = true;
			process.exit();
		} else {
			continue;
		}
	} while (!valid);
})();
