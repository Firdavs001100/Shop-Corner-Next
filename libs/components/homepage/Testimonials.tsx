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

	const comments: Comment[] = data?.getComments?.list ?? [];

	const prev = () => setCurrent((prev) => (prev === 0 ? comments.length - 1 : prev - 1));
	const next = () => setCurrent((prev) => (prev === comments.length - 1 ? 0 : prev + 1));

	if (loading) {
		return (
			<Box className="testimonials" display="flex" justifyContent="center" alignItems="center" minHeight={300}>
				<CircularProgress />
			</Box>
		);
	}

	if (!comments.length) return null;

	const { memberData, commentContent, commentRating } = comments[current];

	const leftContent = (
		<Box className="testimonials__left">
			<Typography className="testimonials__eyebrow">TESTIMONIALS</Typography>
			<Typography className="testimonials__heading">From The People</Typography>

			<Avatar
				src={memberData?.memberImage ?? ''}
				alt={memberData?.memberNick ?? 'User'}
				className="testimonials__avatar"
			/>

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
