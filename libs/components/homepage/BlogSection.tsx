import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Direction } from '../../enums/common.enum';
import { BoardArticle } from '../../types/board-article/board-article';
import { useRouter } from 'next/router';

// ─── Fake articles shown when the backend returns nothing ────────────────────
const FAKE_ARTICLES: BoardArticle[] = [
	{
		_id: 'fake-1',
		articleTitle: 'How to Style Minimalist Outfits for Every Season',
		articleContent:
			"Minimalism in fashion is more than a trend — it's a lifestyle. Discover how to build a capsule wardrobe that transitions seamlessly through every season with just a handful of versatile, high-quality pieces.",
		articleImage: [],
		createdAt: new Date('2025-02-14').toISOString(),
		memberData: { memberNick: 'Admin', memberType: 'ADMIN' },
		articleCategory: BoardArticleCategory.SHOWCASE,
	} as unknown as BoardArticle,
	{
		_id: 'fake-2',
		articleTitle: 'Behind the Craft: Our Spring Collection',
		articleContent:
			'Step inside the studio where our spring collection came to life. From initial sketches to finished garments, we share the creative process, material sourcing, and the artisans who make it all possible.',
		articleImage: [],
		createdAt: new Date('2025-03-01').toISOString(),
		memberData: { memberNick: 'Admin', memberType: 'ADMIN' },
		articleCategory: BoardArticleCategory.SHOWCASE,
	} as unknown as BoardArticle,
];

const FAKE_IMAGES: Record<string, string> = {
	'fake-1': '/img/story/bI2.jpg',
	'fake-2': '/img/story/bI1.jpg',
};
// ─────────────────────────────────────────────────────────────────────────────

const BlogCard = ({ post, isFake = false }: { post: BoardArticle; isFake?: boolean }) => {
	const router = useRouter();

	const image = isFake
		? FAKE_IMAGES[post._id] ?? '/img/banner/default-blog.jpg'
		: post.articleImage?.[0]
		? `${process.env.NEXT_PUBLIC_API_URL}/${post.articleImage[0]}`
		: '/img/banner/default-blog.jpg';

	const date = new Date(post.createdAt).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});

	const handleNavigate = () => {
		if (!isFake) router.push({ pathname: '/community/detail', query: { id: post._id } });
	};

	return (
		<Box className="blog__card">
			<Box className="blog__image-wrap" onClick={handleNavigate} sx={{ cursor: isFake ? 'default' : 'pointer' }}>
				<img src={image} alt={post.articleTitle} className="blog__image" />
			</Box>
			<Box className="blog__info">
				<Typography className="blog__meta">
					{date} <span className="blog__meta-sep">–</span> {post.memberData?.memberNick ?? 'Admin'}
				</Typography>
				<Typography className="blog__title" onClick={handleNavigate} sx={{ cursor: isFake ? 'default' : 'pointer' }}>
					{post.articleTitle}
				</Typography>
				<Typography className="blog__excerpt" dangerouslySetInnerHTML={{ __html: post.articleContent }} />
				{!isFake && (
					<Box className="blog__read-more" onClick={handleNavigate}>
						Read More <ArrowForwardIcon className="blog__arrow" />
					</Box>
				)}
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

	const fetched: BoardArticle[] = (data?.getBoardArticles?.list ?? [])
		.filter((article: BoardArticle) => article.memberData?.memberType === 'ADMIN')
		.slice(0, 2);

	// Use real data when available, fall back to fake articles
	const articles = fetched.length > 0 ? fetched : FAKE_ARTICLES;
	const isFake = fetched.length === 0;

	if (loading) return null;

	const content = (
		<Box className="blog__wrap">
			<Box className="blog__header">
				<Typography className="blog__eyebrow">COMMUNITY SHOWCASE</Typography>
				<Typography className="blog__heading">Style Highlights</Typography>
			</Box>
			<Box className="blog__grid">
				{articles.map((article) => (
					<BlogCard key={article._id} post={article} isFake={isFake} />
				))}
			</Box>
		</Box>
	);

	return (
		<Box className="blog">
			<div className="container">{content}</div>
		</Box>
	);
}
