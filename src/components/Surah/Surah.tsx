import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';

import './Surah.css';

interface props {
	frame: number;
	surahNumber: string;
	size: 'lg' | 'rg';
}

// Sura Font
const waitForFont = delayRender();
const suraName = new FontFace(
	`sura`,
	`url('${staticFile('sura_names.woff2')}') format('woff2')`
);
suraName
	.load()
	.then(() => {
		document.fonts.add(suraName);
		continueRender(waitForFont);
	})
	.catch((err) => console.log('Error loading font', err));

function Surah({frame, surahNumber, size = 'rg'}: props) {
	return (
		<>
			<AbsoluteFill
				className="wrapper start"
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				<p className={`sura-name ${size}`}>{surahNumber}</p>
			</AbsoluteFill>
		</>
	);
}

export default Surah;
