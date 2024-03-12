import path from 'path';
import dotenv from 'dotenv';
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
import {STOCKS} from '../constants/stocks';

dotenv.config();

let props: {[key: string]: string | undefined} = {};

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY as string;
const S3_REGION = process.env.S3_REGION as string;
const S3_BUCKET = process.env.S3_BUCKET as string;

const s3 = new S3Client({
	credentials: {
		accessKeyId: S3_ACCESS_KEY_ID,
		secretAccessKey: S3_SECRET_ACCESS_KEY,
	},
	region: S3_REGION,
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

	// If manual video provided, proceed with it
	props.video = verse.video;

	console.log('Expected Duration:', verse.duration);

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

	let stockVideosProvider: stockProvider = STOCKS[0];
	let url = '';
	let videoId = '';
	if (props.video !== undefined) {
		console.log('Video passed, skipping theme selection');

		url = props.video;
		videoId = 'M' + verse.id;
		stockVideosProvider = 'MANUAL';
	} else {
		const theme = await getTheme(verse.verse);
		console.log('Chosen theme:', theme);

		const video = await getStock(
			theme,
			verse.duration,
			stockVideosProvider,
			verse.id
		);
		console.log(video);
		url = video.url;
		videoId = video.id;
		console.log(`${stockVideosProvider} Video: ${url}, videoId ${videoId}`);
	}

	let valid = false;
	do {
		if (url) {
			const postType = ['reel', 'post'];
			const uploadsMetaData = {
				post: '',
				reel: '',
			};

			for (let index = 0; index < postType.length; index++) {
				const outputType = postType[index] as outputType;
				console.log(`Rendering ${outputType}`);

				const fileName = (await renderVideo(
					bundleLocation,
					surah,
					verses,
					url,
					outputType,
					verse.reciterId
				)) as string;

				console.log(`============================`);
				console.log(`${outputType} Rendering Done`);
				console.log(`============================`);
				console.log(`Uploading ${outputType} to S3`);

				const file = await readFile(
					path.join(process.cwd(), '/out/' + fileName)
				);

				const params = {
					Bucket: S3_BUCKET,
					Key: 'videos' + '/' + fileName,
					Body: file,
					ACL: ObjectCannedACL.public_read,
					ContentType: 'video/mp4',
				};

				// Push To S3
				await s3.send(new PutObjectCommand(params));

				const fileUrl = `${process.env.S3_ENDPOINT}${fileName}`;

				console.log(`============================`);
				console.log(`Uploaded to S3: ${fileUrl}`);
				console.log(`============================`);

				uploadsMetaData[outputType] = fileUrl;
			}

			// Publish to FB
			console.log('Submitting Publishment...');

			const publishStatus = await submitPosting(
				uploadsMetaData['reel'], // reelUrl
				uploadsMetaData['post'], // postUrl
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
