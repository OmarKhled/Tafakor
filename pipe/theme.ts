import {spawn} from 'child_process';
import path from 'path';

/**
 * @description returns the theme of the video based on the verse context
 * @param verse - quranic verses
 */
const getTheme = (verse: string): Promise<string> => {
	return new Promise<string>((resolve) => {
		const query = spawn('python', [
			path.join(process.cwd(), 'pipe', 'verseTheme.py'),
			verse,
		]);
		console.log(query);
		query.stdout.on('data', (data: {toString: () => string}) => {
			console.log(data.toString());
			resolve(
				data.toString().split('\n')[
					data
						.toString()
						.split('\n')
						.findIndex((q) => q.includes('Theme: '))
				].split(' ')[1]
			);
		});
	});
};

export {getTheme};
