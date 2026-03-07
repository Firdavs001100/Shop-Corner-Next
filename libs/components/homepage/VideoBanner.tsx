import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

// ── Main Component ────────────────────────────────────────

export default function VideoBanner() {
	const device = useDeviceDetect();
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = true;
			videoRef.current.play().catch((err) => {
				console.warn('Autoplay prevented:', err);
			});
		}
	}, []);

	const bannerContent = (
		<Box className="video-banner">
			<video ref={videoRef} className="video-banner__video" src="/video/videoBanner.mp4" loop playsInline muted />
			<Box className="video-banner__overlay" />
			<Box className="video-banner__content">
				<h2 className="video-banner__title">Feel Pretty</h2>
				<p className="video-banner__desc">
					Dress for the version of yourself you're becoming. Every piece is crafted to make you feel as good as you
					look.
				</p>
			</Box>
		</Box>
	);

	if (device === 'mobile') {
		return bannerContent;
	} else {
		return bannerContent;
	}
}
