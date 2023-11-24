import {AbsoluteFill} from 'remotion';

interface props {
	frame: number;
	surahNumber: string;
}

function Surah({frame, surahNumber}: props) {
	return (
		<>
			<AbsoluteFill
				className="wrapper start"
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				<p className="sura-name">{surahNumber}</p>
			</AbsoluteFill>
		</>
	);
}

export default Surah;
