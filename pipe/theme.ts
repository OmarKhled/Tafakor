import {spawn} from 'child_process';
import path from 'path';

/**
 * @description returns the theme of the video based on the verse context
 * @param verse - quranic verses
 */
const getTheme = (verse: string): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		console.log([
			'python',
			[path.join(process.cwd(), 'pipe', 'verseTheme.py'), verse],
		]);

		resolve('nature');
		// const query = spawn('python', [
		// 	path.join(process.cwd(), 'pipe', 'verseTheme.py'),
		// 	verse,
		// ]);
		// query.stdout.on('error', (data: {toString: () => string}) => {
		// 	console.log(data.toString());
		// 	reject();
		// });
		// query.stdout.on('data', (data: {toString: () => string}) => {
		// 	console.log(data.toString());
		// 	resolve(
		// 		data.toString().split('\n')[
		// 			data
		// 				.toString()
		// 				.split('\n')
		// 				.findIndex((q) => q.includes('Selected Theme:'))
		// 		].split(' ')[2]
		// 	);
		// });
	});
};

export {getTheme};
