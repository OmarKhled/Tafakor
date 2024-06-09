import {getVideoMetadata} from '@remotion/media-utils';
import {useEffect, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	AbsoluteFill,
	OffthreadVideo,
	useVideoConfig,
} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

import {Fragment} from 'react';

import './BackgroundFill.css';

interface props {
	footageUrl: string;
	scale: number;
	footageType: string;
}

function BackgroundFill({footageUrl, scale, footageType}: props) {
	const [duration, setDuration] = useState<number | null>(null);
	const [loops, setLoops] = useState<number>(0);
	const [handle] = useState(() => delayRender());
	const {fps, durationInFrames} = useVideoConfig();

	useEffect(() => {
		console.log({footageType});
		if (footageType === 'video') {
			getVideoMetadata(footageUrl)
				.then(({durationInSeconds}) => {
					setDuration(durationInSeconds);
					setLoops(Math.ceil(durationInFrames / fps / durationInSeconds) + 1);

					console.log(Math.ceil(durationInFrames / fps / durationInSeconds));
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
				<>
					{/* @ts-ignore */}
					<TransitionSeries>
						{Array(loops)
							.fill(0)
							.map((_, i) => (
								<Fragment key={i}>
									<TransitionSeries.Sequence
										key={i + 'seq'}
										durationInFrames={(duration as number) * fps}
									>
										<div className="videoContainer">
											<OffthreadVideo
												src={footageUrl}
												className="video"
												style={{transform: `scale(${scale})`}}
												muted
											></OffthreadVideo>
										</div>
									</TransitionSeries.Sequence>
									<TransitionSeries.Transition
										presentation={fade()}
										key={i + 'trans'}
										timing={linearTiming({durationInFrames: 30})}
									/>
								</Fragment>
							))}
					</TransitionSeries>
				</>
			) : (
				<>
					<div
						style={{
							'--url': 'url(' + footageUrl + ')',
						}}
						className="image"
					></div>
				</>
			)}

			<AbsoluteFill className="backdrop"></AbsoluteFill>
		</>
	);
}

export default BackgroundFill;
