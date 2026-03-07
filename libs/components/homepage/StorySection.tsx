import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';

const SLIDES = ['/img/story/st2.avif', '/img/story/st3.avif', '/img/story/st1.avif'];

const StorySection = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [current, setCurrent] = useState<number>(0);

	/** HANDLERS **/

	const pushAllProductsHandler = async () => {
		await router.push({ pathname: '/product' });
	};

	/** COMPONENTS **/
	const prev = () => setCurrent((i) => (i - 1 + SLIDES.length) % SLIDES.length);

	const next = () => setCurrent((i) => (i + 1) % SLIDES.length);

	const leftContent = (
		<Box className="story-section__left">
			<Typography className="story-section__eyebrow">STORY</Typography>
			<Typography className="story-section__title">We Will Give You The Best</Typography>
			<Typography className="story-section__desc">
				Exceptional Products Meticulously Crafted with Unparalleled Expertise and Care
			</Typography>
			<button className="story-section__cta" onClick={() => pushAllProductsHandler()}>
				Shop Now
			</button>
		</Box>
	);

	const rightContent = (
		<Box className="story-section__right">
			<Box className="story-section__img-wrap">
				<img src={SLIDES[current]} alt="Story" className="story-section__img" />
			</Box>
			<IconButton onClick={prev} className="story-section__nav story-section__nav--prev" aria-label="Previous">
				<ChevronLeftIcon />
			</IconButton>
			<IconButton onClick={next} className="story-section__nav story-section__nav--next" aria-label="Next">
				<ChevronRightIcon />
			</IconButton>
		</Box>
	);

	if (device === 'mobile') {
		return (
			<Box className="story-section">
				<div className="container">
					{leftContent}
					{rightContent}
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="story-section">
				<div className="container">
					{leftContent}
					{rightContent}
				</div>
			</Box>
		);
	}
};

export default StorySection;
