import {AbsoluteFill, Video} from 'remotion';

import './BackgroundFill.css';

interface props {
	footageUrl: string;
	scale: number;
}

function BackgroundFill({footageUrl, scale}: props) {
	return (
		<>
			<Video
				src={footageUrl}
				style={{transform: `scale(${scale})`}}
				loop
				muted
			></Video>

			<AbsoluteFill className="backdrop"></AbsoluteFill>
		</>
	);
}

export default BackgroundFill;
