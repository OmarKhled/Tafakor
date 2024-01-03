import {getVideoMetadata} from '@remotion/media-utils';
import {useEffect, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	Loop,
	AbsoluteFill,
	OffthreadVideo,
	useVideoConfig,
} from 'remotion';

import './BackgroundFill.css';

interface props {
	footageUrl: string;
	scale: number;
}

function BackgroundFill({footageUrl, scale}: props) {
	const [duration, setDuration] = useState<null | number>(null);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	useEffect(() => {
		getVideoMetadata(footageUrl)
			.then(({durationInSeconds}) => {
				setDuration(durationInSeconds);
				continueRender(handle);
			})
			.catch((err) => {
				cancelRender(handle);
			});
	}, [handle]);

	if (duration === null) {
		return null;
	}

	return (
		<>
			<Loop durationInFrames={Math.floor(fps * duration)}>
				<OffthreadVideo
					src={footageUrl}
					className="video"
					style={{transform: `scale(${scale})`}}
					muted
				></OffthreadVideo>
			</Loop>

			<AbsoluteFill className="backdrop"></AbsoluteFill>
		</>
	);
}

export default BackgroundFill;
