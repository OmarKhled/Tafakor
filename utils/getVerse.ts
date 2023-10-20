const getVerse = async () => {
	/** Getting Quran reflections */
	const res = await (
		await fetch(
			'https://quranreflect.com/posts.json?client_auth_token=tUqQpl4f87wIGnLRLzG61dGYe03nkBQj&q%5Bfilters_operation%5D=OR&q%5Btags_operation%5D=OR&page=1&tab=trending&lang=ar&feed=&verified=&student=&scholar=&approved=&exact_ayah=&within_range=&prioritize_ayah=&featured=true',
			{method: 'GET'}
		)
	).json();
	const postIndex = Math.ceil(Math.random() * res.posts.length);

	const post = res.posts[postIndex];

	console.log(post.body);
	console.log(post.filters[0].surah_number);
	console.log(post.filters[0].from);
	console.log(post.filters[0].to);

	return {
		from: post.filters[0].from,
		to: post.filters[0].to,
		surah: post.filters[0].surah_number,
	};
};

// getVerse();

export {getVerse};
