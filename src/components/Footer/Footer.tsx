import {AbsoluteFill, Img, staticFile} from 'remotion';

import './Footer.css';

interface props {
	frame: number;
	name: string;
}

function ReciterName({frame, name}: props) {
	return (
		<AbsoluteFill
			className="wrapper end"
			style={{
				opacity: Math.min(1, frame / 50),
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '1rem',
					width: '100%',
					justifyContent: 'space-between',
					padding: '0 2rem',
				}}
			>
				<Img src={staticFile('logo.png')} style={{height: '50px'}} />
				<p className="rectier">{`القارئ: ${name}`}</p>
			</div>
		</AbsoluteFill>
	);
}

export default ReciterName;
