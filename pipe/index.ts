import path from 'path';
import fs from 'fs/promises';
import {bundle} from '@remotion/bundler';
import {S3Client, PutObjectCommand, ObjectCannedACL} from '@aws-sdk/client-s3';
import {getVerse} from '../utils/getVerse';
import {getStock} from './stocks';
import {renderVideo} from './render';
import {getTheme} from './theme';
import {publishToFB} from './publish';

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
		entryPoint: path.join(__dirname, '../src/index.ts'),
		webpackOverride: (config) => config,
	});

	// fetching a verse
	const verse = await getVerse();

	// verse data extraction
	const surah = verse.surah;
	const verses = [...Array(verse.to - verse.from + 1)].map(
		(e, i) => verse.to + i
	);

	console.log(
		`Verse Picked: Surah ${surah}, from ${verses[0]} to ${
			verses[verses.length - 1]
		}`
	);

	// choosing theme for the video
	const theme = await getTheme(verse.verse);
	console.log('Chosen theme:', theme);

	let valid = false;
	do {
		const {url} = await getStock(theme, verse.duration);

		if (url) {
			const fileName = await renderVideo(bundleLocation, surah, verses, url);

			console.log('Video Rendering Done');

			const file = await fs.readFile(
				path.join(__dirname, '../out/' + fileName)
			);

			const params = {
				Bucket: 'tafakor',
				Key: 'videos' + '/' + fileName,
				Body: file,
				ACL: ObjectCannedACL.public_read,
			};

			// Push To S3
			await s3.send(new PutObjectCommand(params));

			// Publish to FB
			const publishStatus = await publishToFB(
				`https://tafakor.s3.eu-north-1.amazonaws.com/videos/${fileName}`
			);
			if (publishStatus) {
				console.log('Video Published to FB');
			} else {
				console.log('Publishing Failed');
			}

			valid = true;
			process.exit();
		} else {
			continue;
		}
	} while (!valid);
})();
