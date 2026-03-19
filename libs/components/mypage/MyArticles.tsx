import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { useRouter } from 'next/router';
import ArticleCard from '../community/ArticleCard';

// MUI Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const CATEGORIES = [
	{ key: 'ALL', label: 'All', icon: <GridViewIcon sx={{ fontSize: 15 }} /> },
	{ key: BoardArticleCategory.QUESTION, label: 'Question', icon: <HelpOutlineIcon sx={{ fontSize: 15 }} /> },
	{ key: BoardArticleCategory.REVIEW, label: 'Review', icon: <StarBorderIcon sx={{ fontSize: 15 }} /> },
	{ key: BoardArticleCategory.DISCUSSION, label: 'Discussion', icon: <ForumOutlinedIcon sx={{ fontSize: 15 }} /> },
	{ key: BoardArticleCategory.HELP, label: 'Help', icon: <SupportAgentOutlinedIcon sx={{ fontSize: 15 }} /> },
	{ key: BoardArticleCategory.SHOWCASE, label: 'Showcase', icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} /> },
];

const PAGE_SIZE = 6;

const stripHtml = (html: string): string => {
	if (typeof window === 'undefined')
		return html
			.replace(/<[^>]*>/g, '')
			.replace(/&[a-z]+;/gi, ' ')
			.trim();
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent ?? div.innerText ?? '';
};

const formatDate = (date: Date) =>
	new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const MyArticles = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [activeCategory, setActiveCategory] = useState<string>('ALL');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);

	const query: BoardArticlesInquiry = {
		page,
		limit: PAGE_SIZE,
		search: {
			memberId: user?._id,
			...(activeCategory !== 'ALL' && { articleCategory: activeCategory as BoardArticleCategory }),
			...(search.trim() && { text: search.trim() }),
		},
	};

	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: query },
		skip: !user?._id,
	});

	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const total: number = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);

	const [likeArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const [deleteArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	const likeHandler = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error('Please log in first.');
			await likeArticle({ variables: { input: articleId } });
			toastSmallSuccess('Updated!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const deleteHandler = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		if (!confirm('Are you sure you want to delete this article?')) return;
		try {
			await deleteArticle({ variables: { input: articleId } });
			toastSmallSuccess('Article deleted.', 800);
			await refetch({ input: query });
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const editHandler = (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		router.push({ pathname: '/mypage', query: { category: 'writeArticle', id: articleId } });
	};

	const handleCategoryChange = (key: string) => {
		setActiveCategory(key);
		setPage(1);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		refetch({ input: query });
	};

	return (
		<div className="mp-my-articles">
			{/* Page Bar */}
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Community</span>
					<h2 className="mp-page-bar__title">My Articles</h2>
					<p className="mp-page-bar__sub">Manage and track all your published content</p>
				</div>
				<button
					className="mp-my-articles__write-btn"
					onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
				>
					<AddCircleOutlineIcon sx={{ fontSize: 18 }} />
					Write Article
				</button>
			</div>

			{/* Filters */}
			<div className="mp-my-articles__filters">
				<div className="mp-my-articles__categories">
					{CATEGORIES.map((cat) => (
						<button
							key={cat.key}
							className={`mp-my-articles__cat-btn${activeCategory === cat.key ? ' active' : ''}`}
							onClick={() => handleCategoryChange(cat.key)}
						>
							{cat.icon}
							{cat.label}
						</button>
					))}
				</div>

				<form className="mp-my-articles__search" onSubmit={handleSearch}>
					<SearchIcon sx={{ fontSize: 17 }} />
					<input
						type="text"
						placeholder="Search your articlesu2026"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</form>
			</div>

			{/* Stats Bar */}
			<div className="mp-my-articles__stats">
				<span className="mp-my-articles__stats-count">
					{total} article{total !== 1 ? 's' : ''}
					{activeCategory !== 'ALL' && ` in ${activeCategory}`}
				</span>
			</div>

			{/* Content */}
			{loading ? (
				<div className="mp-my-articles__empty">
					<div className="mp-my-articles__spinner" />
				</div>
			) : articles.length === 0 ? (
				<div className="mp-my-articles__empty">
					<ArticleOutlinedIcon sx={{ fontSize: 52 }} />
					<p>No articles yet.</p>
					<button
						className="mp-my-articles__write-btn"
						onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
					>
						<AddCircleOutlineIcon sx={{ fontSize: 18 }} />
						Write your first article
					</button>
				</div>
			) : (
				<div className="mp-my-articles__grid">
					{articles.map((article) => {
						const plain = stripHtml(article.articleContent);
						const isLiked = Boolean(article.meLiked?.[0]?.myFavorite);

						return (
							<article
								key={article._id}
								className="mp-my-articles__card"
								onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id } })}
							>
								{/* Thumbnail */}
								{article.articleImage?.[0] ? (
									<div className="mp-my-articles__card-thumb">
										<img src={`${NEXT_PUBLIC_API_URL}/${article.articleImage[0]}`} alt={article.articleTitle} />
										<span className="mp-my-articles__card-cat">{article.articleCategory}</span>
									</div>
								) : (
									<div className="mp-my-articles__card-thumb mp-my-articles__card-thumb--placeholder">
										<ArticleOutlinedIcon sx={{ fontSize: 36 }} />
										<span className="mp-my-articles__card-cat">{article.articleCategory}</span>
									</div>
								)}

								{/* Body */}
								<div className="mp-my-articles__card-body">
									<h3 className="mp-my-articles__card-title">{article.articleTitle}</h3>
									<p className="mp-my-articles__card-excerpt">
										{plain.length > 110 ? `${plain.slice(0, 110)}u2026` : plain}
									</p>

									{/* Meta */}
									<div className="mp-my-articles__card-meta">
										<span>
											<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
											{article.articleViews}
										</span>
										<span>
											<FavoriteBorderIcon sx={{ fontSize: 13 }} />
											{article.articleLikes}
										</span>
										<span>
											<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
											{article.articleComments}
										</span>
										<span className="mp-my-articles__card-date">{formatDate(article.createdAt)}</span>
									</div>
								</div>

								{/* Actions */}
								<div className="mp-my-articles__card-actions">
									<button
										className="mp-my-articles__action-btn mp-my-articles__action-btn--edit"
										title="Edit"
										onClick={(e) => editHandler(e, article._id)}
									>
										<EditOutlinedIcon sx={{ fontSize: 17 }} />
									</button>
									<button
										className="mp-my-articles__action-btn mp-my-articles__action-btn--delete"
										title="Delete"
										onClick={(e) => deleteHandler(e, article._id)}
									>
										<DeleteOutlineIcon sx={{ fontSize: 17 }} />
									</button>
								</div>
							</article>
						);
					})}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mp-my-articles__pagination">
					<button className="mp-my-articles__page-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
						u2039 Prev
					</button>
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
						<button
							key={p}
							className={`mp-my-articles__page-btn${page === p ? ' active' : ''}`}
							onClick={() => setPage(p)}
						>
							{p}
						</button>
					))}
					<button
						className="mp-my-articles__page-btn"
						disabled={page === totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next u203a
					</button>
				</div>
			)}
		</div>
	);
};

export default MyArticles;
