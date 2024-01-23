(async () => {
	const res = (
		await fetch(
			'https://cdn.pixabay.com/vimeo/887078786/trees-189813.mp4?width=3840&hash=f925344ec97df1581060b89c673d3cbbcacc7b9a',
			{
				// redirect: 'follow',
			}
		)
	).url;

	console.log(res);
})();
