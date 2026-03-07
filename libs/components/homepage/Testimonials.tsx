import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface Testimonial {
	name: string;
	from: string;
	avatar: string;
	rating: number;
	review: string;
	image: string;
}

const testimonials: Testimonial[] = [
	{
		name: 'Emma Johnson',
		from: 'VERIFIED BUYER',
		avatar: 'https://i.pravatar.cc/150?img=47',
		rating: 5,
		review:
			'"An elevated essential for any wardrobe. Thoughtful details, flawless fit, and exceptional quality. Designed to feel polished in every moment."',
		image: 'https://nov-milana.myshopify.com/cdn/shop/files/img-6-12.jpg?v=1768279188&width=768',
	},
	{
		name: 'James Carter',
		from: 'LOYAL CUSTOMER',
		avatar: 'https://i.pravatar.cc/150?img=12',
		rating: 5,
		review:
			'"Absolutely stunning craftsmanship. The attention to detail is unmatched and the fit is perfect. I get compliments every time I wear it."',
		image: 'https://nov-milana.myshopify.com/cdn/shop/files/img-6-12.jpg?v=1768279188&width=768',
	},
	{
		name: 'Sofia Rossi',
		from: 'VERIFIED BUYER',
		avatar: 'https://i.pravatar.cc/150?img=32',
		rating: 4,
		review:
			'"This piece has become a staple in my wardrobe. Versatile, elegant, and incredibly comfortable. Worth every penny."',
		image: 'https://nov-milana.myshopify.com/cdn/shop/files/img-6-12.jpg?v=1768279188&width=768',
	},
];

export default function Testimonials() {
	const device = useDeviceDetect();
	const [current, setCurrent] = useState<number>(0);

	const prev = () => {
		const prevIndex = current === 0 ? testimonials.length - 1 : current - 1;
		setCurrent(prevIndex);
	};

	const next = () => {
		const nextIndex = current === testimonials.length - 1 ? 0 : current + 1;
		setCurrent(nextIndex);
	};

	const { name, from, avatar, rating, review } = testimonials[current];

	const leftContent = (
		<Box className="testimonials__left">
			<Typography className="testimonials__eyebrow">TESTIMONIALS</Typography>
			<Typography className="testimonials__heading">From The People</Typography>

			<Avatar src={avatar} alt={name} className="testimonials__avatar" />

			<Box className="testimonials__stars">
				{Array.from({ length: 5 }).map((_, i) => (
					<StarIcon key={i} className={i < rating ? 'star filled' : 'star'} />
				))}
			</Box>

			<Typography className="testimonials__review">{review}</Typography>

			<Typography className="testimonials__name">{name}</Typography>
			<Typography className="testimonials__from">{from}</Typography>

			<Box className="testimonials__controls">
				<IconButton onClick={prev} className="arrow-btn">
					<ArrowBackIosNewIcon />
				</IconButton>
				<IconButton onClick={next} className="arrow-btn">
					<ArrowForwardIosIcon />
				</IconButton>
			</Box>
		</Box>
	);

	if (device === 'mobile') {
		return (
			<Box className="testimonials">
				<div className="container">
					<Box className="testimonials__wrap">
						<Box className="testimonials__inner">
							{leftContent}

							<Box className="testimonials__right">
								<img src={testimonials[0].image} alt="Testimonial" className="testimonials__img" />
							</Box>
						</Box>
					</Box>
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="testimonials">
				<div className="container">
					<Box className="testimonials__wrap">
						<Box className="testimonials__inner">
							{leftContent}

							<Box className="testimonials__right">
								<img src={testimonials[0].image} alt="Testimonial" className="testimonials__img" />
							</Box>
						</Box>
					</Box>
				</div>
			</Box>
		);
	}
}
