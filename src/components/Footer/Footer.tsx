import {Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Tajawal';
import {MicrophoneSolid} from 'iconoir-react';
import './Footer.css';

loadFont();
interface props {
	frame: number;
	name: string;
	size: 'lg' | 'rg';
}

const micIconSizes = {
	rg: 35,
	lg: 50,
};

function ReciterName({frame, name, size = 'rg'}: props) {
	const MIC_SIZE = micIconSizes[size];
	return (
		<div
			className="wrapper end"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<div className="footer">
				<Img src={staticFile('logo.png')} className={`logo ${size}`} />
				<div className="reciter-container">
					<p className={`rectier ${size}`}>{`${name}`}</p>
					<MicrophoneSolid color="#fff" width={MIC_SIZE} height={MIC_SIZE} />
				</div>
			</div>
		</div>
	);
}

export default ReciterName;
