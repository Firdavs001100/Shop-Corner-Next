import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const SLIDES = [
	'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
	'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=700&q=80',
	'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=700&q=80',
];

const NewsletterSection = () => {
	const device = useDeviceDetect();
	const [email, setEmail] = useState('');
	const [current, setCurrent] = useState<number>(0);

	const prev = () => setCurrent((i) => (i - 1 + SLIDES.length) % SLIDES.length);
	const next = () => setCurrent((i) => (i + 1) % SLIDES.length);

	const handleSubmit = () => {
		console.log('Submitted:', email);
		setEmail('');
	};

	const leftContent = (
		<Box className="newsletter__left">
			<img src={SLIDES[current]} alt="Newsletter" className="newsletter__img" />
			<IconButton onClick={prev} className="newsletter__nav newsletter__nav--prev" aria-label="Previous">
				<ChevronLeftIcon />
			</IconButton>
			<IconButton onClick={next} className="newsletter__nav newsletter__nav--next" aria-label="Next">
				<ChevronRightIcon />
			</IconButton>
		</Box>
	);

	const rightContent = (
		<Box className="newsletter__right">
			<Typography className="newsletter__eyebrow">NEWSLETTER</Typography>
			<Typography className="newsletter__title">Monthly Fashion News</Typography>
			<Typography className="newsletter__desc">
				Celebrating the Visionary Creativity and Innovative Spirit Shaping the World of Fashion
			</Typography>
			<Box className="newsletter__form">
				<input
					className="newsletter__input"
					type="email"
					placeholder="Enter Your Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<button className="newsletter__btn" onClick={handleSubmit}>
					Submit
				</button>
			</Box>
		</Box>
	);

	if (device === 'mobile') {
		return (
			<Box className="newsletter">
				<div className="container">
					<Box className="newsletter__inner">
						{leftContent}
						{rightContent}
					</Box>
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="newsletter">
				<div className="container">
					<Box className="newsletter__inner">
						{leftContent}
						{rightContent}
					</Box>
				</div>
			</Box>
		);
	}
};

export default NewsletterSection;
