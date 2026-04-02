import React from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';

// ── Main Component ────────────────────────────────────────

export default function HomeShowcase() {
	const device = useDeviceDetect();
	const router = useRouter();

	const showcaseContent = (
		<Stack className="home-showcase">
			<div className="container">
				<Stack className="home-showcase__grid" direction={device === 'mobile' ? 'column' : 'row'}>
					{/* LEFT IMAGE BLOCK */}
					<Stack className="home-showcase__images">
						<Box className="home-showcase__img-1">
							<Box component="img" src="/img/banner/hw2.avif" alt="Fashion Look 1" />
						</Box>
						<Box className="home-showcase__img-2">
							<Box component="img" src="/img/banner/hw1.avif" alt="Fashion Look 2" />
						</Box>
					</Stack>

					{/* RIGHT TEXT BLOCK */}
					<Stack className="home-showcase__content">
						<Typography className="home-showcase__title">
							Elevate your <br /> beauty
						</Typography>
						<Typography className="home-showcase__desc">
							Whether you're shopping our latest seasonal drops or freshening up your wardrobe staples, our aim is to
							make the experience seamless and enjoyable with responsive customer service.
						</Typography>
						<Button className="home-showcase__btn" onClick={() => router.push('/product')}>
							<span className="home-showcase__btn-text">Shop Now</span>
						</Button>
					</Stack>
				</Stack>
			</div>
		</Stack>
	);

	if (device === 'mobile') {
		return showcaseContent;
	} else {
		return showcaseContent;
	}
}
