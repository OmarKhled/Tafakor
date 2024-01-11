import './Surah.css';

interface props {
	frame: number;
	surahNumber: string;
	size: 'lg' | 'rg';
}

function Surah({frame, surahNumber, size = 'rg'}: props) {
	return (
		<>
			<div
				style={{
					opacity: Math.min(1, frame / 50),
				}}
			>
				<p className={`sura-name ${size}`}>{surahNumber}</p>
			</div>
		</>
	);
}

export default Surah;
