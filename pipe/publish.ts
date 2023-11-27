import {outputType} from './pipe';
import dotenv from 'dotenv';

dotenv.config();

const USER_ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;
const TAFAKOR_ID = process.env.TAFAKOR_ID;
const USER_ID = process.env.USER_ID;

const publishToFB = async (fileUrl: string, type: outputType) => {
	try {
		const accounts: {data: {id: string; access_token: string}[]} = await (
			await fetch(
				`https://graph.facebook.com/v18.0/${USER_ID}/accounts?access_token=${USER_ACCESS_TOKEN}`
			)
		).json();

		console.log(accounts);

		const TAFAKOR_TOKEN = accounts.data.find(
			(p) => p.id === TAFAKOR_ID
		)?.access_token;

		console.log('Takafor access token acquired');

		switch (type) {
			case 'reel':
				const sessionInit = await (
					await fetch(
						`https://graph.facebook.com/v18.0/${TAFAKOR_ID}/video_reels`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								upload_phase: 'start',
								access_token: TAFAKOR_TOKEN,
							}),
						}
					)
				).json();

				console.log(sessionInit);

				const videoId = sessionInit.video_id;

				await (
					await fetch(
						`https://rupload.facebook.com/video-upload/v18.0/${videoId}`,
						{
							method: 'POST',
							headers: {
								Authorization: `OAuth ${TAFAKOR_TOKEN}`,
								file_url: fileUrl,
							},
						}
					)
				).json();

				const reelPublish = await (
					await fetch(
						`https://graph.facebook.com/v18.0/${TAFAKOR_ID}/video_reels?access_token=${TAFAKOR_TOKEN}&video_id=${videoId}&upload_phase=finish&video_state=PUBLISHED`,
						{
							method: 'POST',
						}
					)
				).json();
				console.log(reelPublish);
				return reelPublish.success;

			case 'post':
				const form = new FormData();
				form.append('access_token', TAFAKOR_TOKEN as string);
				form.append('file_url', fileUrl);

				const postPublish = await (
					await fetch(
						`https://graph-video.facebook.com/v18.0/${TAFAKOR_ID}/videos`,
						{
							method: 'POST',
							body: form,
						}
					)
				).json();
				console.log(postPublish);
				return postPublish.success;
		}
	} catch (error) {
		console.log(error);
		return false;
	}
};

export {publishToFB};
