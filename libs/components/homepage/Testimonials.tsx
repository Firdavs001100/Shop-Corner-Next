import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Typography, Avatar, IconButton, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CommentGroup } from '../../enums/comment.enum';
import { Comment } from '../../types/comment/comment';

// ─── Fake reviews shown when the backend returns nothing ─────────────────────
const FAKE_REVIEWS: Comment[] = [
	{
		commentContent:
			'Absolutely love the quality. Every detail is thoughtfully crafted and the experience exceeded my expectations completely.',
		commentRating: 5,
		memberData: {
			memberNick: 'Sarah Mitchell',
			memberImage: 'https://i.pravatar.cc/150?img=47',
		},
	} as Comment,
	{
		commentContent:
			"Incredible service and beautiful products. I've recommended this to all my friends — they were blown away too.",
		commentRating: 5,
		memberData: {
			memberNick: 'James Ortega',
			memberImage: 'https://i.pravatar.cc/150?img=12',
		},
	} as Comment,
	{
		commentContent:
			'Fast shipping, flawless packaging, and even better in person. Will definitely be a returning customer.',
		commentRating: 4,
		memberData: {
			memberNick: 'Yuna Choi',
			memberImage: 'https://i.pravatar.cc/150?img=32',
		},
	} as Comment,
];
// ─────────────────────────────────────────────────────────────────────────────

export default function Testimonials() {
	const device = useDeviceDetect();
	const [current, setCurrent] = useState<number>(0);

	const { data, loading } = useQuery(GET_COMMENTS, {
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: {
					commentRefId: '',
					commentGroup: CommentGroup.PRODUCT,
					commentRating: 4,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const fetched: Comment[] = data?.getComments?.list ?? [];
	// Use real data when available, fall back to fake reviews
	const comments: Comment[] = fetched.length > 0 ? fetched : FAKE_REVIEWS;

	const prev = () => setCurrent((prev) => (prev === 0 ? comments.length - 1 : prev - 1));
	const next = () => setCurrent((prev) => (prev === comments.length - 1 ? 0 : prev + 1));

	if (loading) {
		return (
			<Box className="testimonials" display="flex" justifyContent="center" alignItems="center" minHeight={300}>
				<CircularProgress />
			</Box>
		);
	}

	const { memberData, commentContent, commentRating } = comments[current];

	const avatarSrc = memberData?.memberImage?.trim()
		? `${process.env.NEXT_PUBLIC_API_URL}/${memberData.memberImage}`
		: `https://i.pravatar.cc/150?u=${encodeURIComponent(memberData?.memberNick ?? 'anon')}`;

	const leftContent = (
		<Box className="testimonials__left">
			<Typography className="testimonials__eyebrow">TESTIMONIALS</Typography>
			<Typography className="testimonials__heading">From The People</Typography>

			{/* Member image — uses memberData.memberImage when present */}
			<Avatar src={avatarSrc} alt={memberData?.memberNick ?? 'User'} className="testimonials__avatar" />

			<Box className="testimonials__stars">
				{Array.from({ length: 5 }).map((_, i) =>
					i < (commentRating ?? 0) ? (
						<StarIcon key={i} className="star filled" />
					) : (
						<StarBorderIcon key={i} className="star" />
					),
				)}
			</Box>

			<Typography className="testimonials__review">"{commentContent}"</Typography>
			<Typography className="testimonials__name">{memberData?.memberNick ?? 'Anonymous'}</Typography>
			<Typography className="testimonials__from">VERIFIED BUYER</Typography>

			{comments.length > 1 && (
				<Box className="testimonials__controls">
					<IconButton onClick={prev} className="arrow-btn">
						<ArrowBackIosNewIcon />
					</IconButton>
					<IconButton onClick={next} className="arrow-btn">
						<ArrowForwardIosIcon />
					</IconButton>
				</Box>
			)}
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
								<img src="/img/banner/ts1.jpg" alt="Testimonial" className="testimonials__img" />
							</Box>
						</Box>
					</Box>
				</div>
			</Box>
		);
	}

	return (
		<Box className="testimonials">
			<div className="container">
				<Box className="testimonials__wrap">
					<Box className="testimonials__inner">
						{leftContent}
						<Box className="testimonials__right">
							<img src="/img/banner/ts1.jpg" alt="Testimonial" className="testimonials__img" />
						</Box>
					</Box>
				</Box>
			</div>
		</Box>
	);
}
