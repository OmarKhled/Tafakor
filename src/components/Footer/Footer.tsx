import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Cairo';
import {MicrophoneSolid} from 'iconoir-react';
import './Footer.css';

loadFont();
interface props {
	frame: number;
	name: string;
	size: 'lg' | 'rg';
}

function ReciterName({frame, name, size = 'rg'}: props) {
	return (
		<AbsoluteFill
			className="wrapper end"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<div className="footer">
				<Img src={staticFile('logo.png')} className={`logo ${size}`} />
				<div className="reciter-container">
					<p className={`rectier ${size}`}>{`${name}`}</p>
					<MicrophoneSolid color="#fff" width={50} height={50} />
				</div>
			</div>
		</AbsoluteFill>
	);
}

export default ReciterName;
