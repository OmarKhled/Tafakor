const USER_ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;
const TAFAKOR_ID = process.env.TAFAKOR_ID;
const USER_ID = process.env.USER_ID;

const publishToFB = async (fileUrl: string) => {
	try {
		const accounts: {data: {id: string; access_token: string}[]} = await (
			await fetch(
				`https://graph.facebook.com/v18.0/${USER_ID}/accounts?access_token=${USER_ACCESS_TOKEN}`
			)
		).json();

		const TAFAKOR_TOKEN = accounts.data.find(
			(p) => p.id === '145347105330809'
		)?.access_token;

		console.log('Takafor access token acquired');

		const form = new FormData();
		form.append('access_token', TAFAKOR_TOKEN as string);
		form.append('file_url', fileUrl);

		await (
			await fetch(
				`https://graph-video.facebook.com/v18.0/${TAFAKOR_ID}/videos`,
				{
					method: 'POST',
					body: form,
				}
			)
		).json();

		return true;
	} catch (error) {
		return false;
	}
};

export {publishToFB};
