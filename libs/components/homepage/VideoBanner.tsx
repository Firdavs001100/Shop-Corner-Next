import React, { useEffect, useRef } from 'react';

const VideoBanner = () => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = true;
			videoRef.current.play().catch((err) => {
				console.warn('Autoplay prevented:', err);
			});
		}
	}, []);

	return (
		<div className="video-banner">
			<video ref={videoRef} className="video-banner__video" src="/video/videoBanner.mp4" loop playsInline />
			<div className="video-banner__overlay" />
			<div className="video-banner__content">
				<h2 className="video-banner__title">Feel Pretty</h2>
				<p className="video-banner__desc">
					Pair text with an image to focus on your chosen product, collection, or blog post. Add details on
					availability, style, or even provide a review.
				</p>
			</div>
		</div>
	);
};

export default VideoBanner;
