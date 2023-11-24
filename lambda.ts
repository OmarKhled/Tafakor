import {getFunctions} from '@remotion/lambda';
import {getRenderProgress, getSites} from '@remotion/lambda/client';
import {renderMediaOnLambda} from '@remotion/lambda/client';
import {SIZES} from './constants/sizes';

const [{functionName}] = await getFunctions({
	region: 'us-east-1',
	compatibleOnly: true,
});

console.log(functionName);

const verse = {
	surah: 26,
	from: 41,
	to: 47,
	video:
		'https://vod-progressive.akamaized.net/exp=1700869732~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F4971%2F8%2F224857514%2F788303918.mp4~hmac=81f614b9c62483866af6993a96426c675029b6b477efd16df8f16711df98913a/vimeo-prod-skyfire-std-us/01/4971/8/224857514/788303918.mp4?filename=file.mp4#t=0,111.53',
};

const verses = [...Array(verse.to - verse.from + 1)].map(
	(e, i) => verse.from + i
);

const render = await renderMediaOnLambda({
	functionName,
	inputProps: {
		ayat: verses,
		footage:
			'https://vod-progressive.akamaized.net/exp=1700869732~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F4971%2F8%2F224857514%2F788303918.mp4~hmac=81f614b9c62483866af6993a96426c675029b6b477efd16df8f16711df98913a/vimeo-prod-skyfire-std-us/01/4971/8/224857514/788303918.mp4?filename=file.mp4#t=0,111.53',
		random: false,
		size: SIZES['reel'],
		outputType: 'reel',
	},
	region: 'us-east-1',
	serveUrl: 'tafakor',
	composition: 'quran',
	codec: 'h264',
	framesPerLambda: 265,
});

console.log(render);

while (true) {
	const progress = await getRenderProgress({
		renderId: render.renderId,
		bucketName: render.bucketName,
		functionName: functionName,
		region: 'us-east-1',
	});

	if (progress.done) {
		console.log(progress.outputFile);
		break;
	} else {
		console.log(progress.overallProgress);
	}

	await new Promise((resolve) => {
		setTimeout(resolve, 100);
	});
}
