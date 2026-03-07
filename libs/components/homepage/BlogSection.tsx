import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface BlogPost {
	date: string;
	author: string;
	title: string;
	excerpt: string;
	image: string;
	href: string;
}

const posts: BlogPost[] = [
	{
		date: 'Jan 13, 2026',
		author: 'Vinova Theme',
		title: 'Everyday Fashion Notes',
		excerpt:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus venenatis ex, et ultricies nunc molestie ...',
		image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
		href: '#',
	},
	{
		date: 'Jan 13, 2026',
		author: 'Vinova Theme',
		title: 'Modern Style Edit',
		excerpt:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus venenatis ex, et ultricies nunc molestie ...',
		image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=700&q=80',
		href: '#',
	},
];

const BlogCard = ({ post }: { post: BlogPost }) => (
	<Box className="blog__card">
		<Box className="blog__image-wrap">
			<img src={post.image} alt={post.title} className="blog__image" />
		</Box>
		<Box className="blog__info">
			<Typography className="blog__meta">
				{post.date} <span className="blog__meta-sep">–</span> {post.author}
			</Typography>
			<Typography className="blog__title">{post.title}</Typography>
			<Typography className="blog__excerpt">{post.excerpt}</Typography>
			<a href={post.href} className="blog__read-more">
				Read More <ArrowForwardIcon className="blog__arrow" />
			</a>
		</Box>
	</Box>
);

export default function BlogSection() {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Box className="blog">
				<div className="container">
					<Box className="blog__wrap">
						<Box className="blog__header">
							<Typography className="blog__eyebrow">LATEST NEWS</Typography>
							<Typography className="blog__heading">Our Blog</Typography>
						</Box>
						<Box className="blog__grid">
							{posts.map((post, i) => (
								<BlogCard key={i} post={post} />
							))}
						</Box>
					</Box>
				</div>
			</Box>
		);
	} else {
		return (
			<Box className="blog">
				<div className="container">
					<Box className="blog__wrap">
						<Box className="blog__header">
							<Typography className="blog__eyebrow">LATEST NEWS</Typography>
							<Typography className="blog__heading">Our Blog</Typography>
						</Box>
						<Box className="blog__grid">
							{posts.map((post, i) => (
								<BlogCard key={i} post={post} />
							))}
						</Box>
					</Box>
				</div>
			</Box>
		);
	}
}
