import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { useRouter } from 'next/router';

const BlogCard = ({ post }: { post: BoardArticle }) => {
	const router = useRouter();
	const image = post.articleImage?.[0] ?? '/img/banner/default-blog.jpg';
	const date = new Date(post.createdAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

	const handleNavigate = () => router.push({ pathname: '/community/detail', query: { id: post._id } });

	return (
		<Box className="blog__card">
			<Box className="blog__image-wrap" onClick={handleNavigate} sx={{ cursor: 'pointer' }}>
				<img src={image} alt={post.articleTitle} className="blog__image" />
			</Box>
			<Box className="blog__info">
				<Typography className="blog__meta">
					{date} <span className="blog__meta-sep">–</span> {post.memberData?.memberNick ?? 'Admin'}
				</Typography>
				<Typography className="blog__title" onClick={handleNavigate} sx={{ cursor: 'pointer' }}>
					{post.articleTitle}
				</Typography>
				<Typography className="blog__excerpt">{post.articleContent}</Typography>
				<Box className="blog__read-more" onClick={handleNavigate}>
					Read More <ArrowForwardIcon className="blog__arrow" />
				</Box>
			</Box>
		</Box>
	);
};

export default function BlogSection() {
	const device = useDeviceDetect();

	const { data, loading } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					articleCategory: BoardArticleCategory.SHOWCASE,
				},
			},
		},
	});

	const articles: BoardArticle[] = (data?.getBoardArticles?.list ?? [])
		.filter((article: BoardArticle) => article.memberData?.memberType === 'ADMIN')
		.slice(0, 2);

	if (loading || !articles.length) return null;

	const content = (
		<Box className="blog__wrap">
			<Box className="blog__header">
				<Typography className="blog__eyebrow">COMMUNITY SHOWCASE</Typography>
				<Typography className="blog__heading">Style Highlights</Typography>
			</Box>
			<Box className="blog__grid">
				{articles.map((article) => (
					<BlogCard key={article._id} post={article} />
				))}
			</Box>
		</Box>
	);

	if (device === 'mobile') {
		return (
			<Box className="blog">
				<div className="container">{content}</div>
			</Box>
		);
	}

	return (
		<Box className="blog">
			<div className="container">{content}</div>
		</Box>
	);
}
