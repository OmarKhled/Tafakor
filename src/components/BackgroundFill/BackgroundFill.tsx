import {AbsoluteFill, OffthreadVideo} from 'remotion';

import './BackgroundFill.css';

interface props {
	footageUrl: string;
	scale: number;
}

function BackgroundFill({footageUrl, scale}: props) {
	return (
		<>
			{/* <OffthreadVideo
				src={footageUrl}
				style={{transform: `scale(${scale})`}}
				muted
			></OffthreadVideo> */}

			<AbsoluteFill className="backdrop"></AbsoluteFill>
		</>
	);
}

export default BackgroundFill;
