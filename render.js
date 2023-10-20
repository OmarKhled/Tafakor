import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';

const getVerse = async () => {
	const res = await (
		await fetch(
			'https://quranreflect.com/posts.json?client_auth_token=tUqQpl4f87wIGnLRLzG61dGYe03nkBQj&q%5Bfilters_operation%5D=OR&q%5Btags_operation%5D=OR&page=1&tab=trending&lang=ar&feed=&verified=&student=&scholar=&approved=&exact_ayah=&within_range=&prioritize_ayah=&featured=true',
			{method: 'GET'}
		)
	).json();
	const postIndex = Math.ceil(Math.random() * res.posts.length);

	const post = res.posts[postIndex];

	return {
		from: post.filters[0].from,
		to: post.filters[0].to,
		surah: post.filters[0].surah_number,
	};
};

(async () => {
	const compositionId = 'quran';
	const bundleLocation = await bundle({
		entryPoint: path.resolve('./src/index.ts'),
		webpackOverride: (config) => config,
	});

	const verse = await getVerse();
	const surah = verse.surah;
	const ayat = [...Array(verse.to - verse.from + 1)].map(
		(e, i) => verse.to + i
	);

	const inputProps = {
		surah,
		ayat: ayat,
		footage:
			'https://vod-progressive.akamaized.net/exp=1697838152~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F4242%2F8%2F221214113%2F771216517.mp4~hmac=06eb5d3cbf6f94ca3d3dace7e32cb4219f72ecc3fee2121388318daf92ca9a0d/vimeo-prod-skyfire-std-us/01/4242/8/221214113/771216517.mp4#t=0,19.2',
		random: false,
		footageType: 'video',
	};

	const composition = await selectComposition({
		serveUrl: bundleLocation,
		id: compositionId,
		inputProps,
	});

	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: 'h264',
		enforceAudioTrack: true,
		outputLocation: `out/${compositionId}9090.mp4`,
		inputProps,
	});

	console.log('Render done!');
})();
