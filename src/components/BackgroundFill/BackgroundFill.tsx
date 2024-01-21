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
	Img,
} from 'remotion';

import './BackgroundFill.css';

interface props {
	footageUrl: string;
	scale: number;
	footageType: string;
}

function BackgroundFill({footageUrl, scale, footageType}: props) {
	const [duration, setDuration] = useState<number | null>(null);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	useEffect(() => {
		console.log({footageType});
		if (footageType === 'video') {
			getVideoMetadata(footageUrl)
				.then(({durationInSeconds}) => {
					setDuration(durationInSeconds);
					continueRender(handle);
				})
				.catch((err) => {
					cancelRender(handle);
				});
		} else {
			continueRender(handle);
		}
	}, [handle]);

	if (duration === null && footageType === 'video') {
		return null;
	}

	return (
		<>
			{footageType === 'video' ? (
				<div className="videoContainer">
					{/* @ts-ignore */}
					<Loop durationInFrames={Math.floor(fps * duration)}>
						<OffthreadVideo
							src={footageUrl}
							className="video"
							style={{transform: `scale(${scale})`}}
							muted
						></OffthreadVideo>
					</Loop>
				</div>
			) : (
				<Img
					src={footageUrl}
					className="image"
					style={{transform: `scale(${1.02})`}}
				/>
			)}

			<AbsoluteFill className="backdrop"></AbsoluteFill>
		</>
	);
}

export default BackgroundFill;
