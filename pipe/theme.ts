import OpenAI from 'openai';
import themes from '../constants/themes';
import {ChatCompletion} from 'openai/resources';

/**
 * @description returns the theme of the video based on the verse context
 * @param verse - quranic verses
 */
const getTheme = async (verse: string): Promise<string> => {
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});
	let theme: ChatCompletion | undefined;
	while (!themes.includes(theme?.choices[0].message.content ?? '')) {
		await new Promise<any>((resolve, reject) => {
			setTimeout(async () => {
				theme = await openai.chat.completions.create({
					messages: [
						{
							role: 'system',
							content: `Analyze the context of the provided verse from the Holy Quran. Imagine this verse being played in a video, and your task is to select a single word that best represents the prevailing emotion or theme suitable for that background video from the following list: ${themes.join(
								', '
							)}
					
					YOUR RESPONSE SHOULD BE ONE WORD ONLY FROM THE ABOVE GIVEN LIST, WITHOUT ANY ADDITIONAL DESCRIPTION OR EXPLANATION.`,
						},
						{role: 'user', content: verse},
					],
					model: 'gpt-4o-mini',
					temperature: 1,
					max_tokens: 256,
					top_p: 1,
					frequency_penalty: 0,
					presence_penalty: 0,
				});
				resolve(null);
			}, 20000);
		});
	}

	return theme?.choices[0].message.content ?? 'NO THEME';
};

export {getTheme};
