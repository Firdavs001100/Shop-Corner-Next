import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Typography, Pagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { NEXT_PUBLIC_API_URL } from '../../libs/config';
import { toastErrorHandling, toastSmallSuccess, toastLoginConfirm } from '../../libs/toast';
import { LIKE_TARGET_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArticleCard from '../../libs/components/community/ArticleCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORIES = [
	{ value: 'ALL', label: 'All' },
	{ value: BoardArticleCategory.QUESTION, label: 'Questions' },
	{ value: BoardArticleCategory.REVIEW, label: 'Reviews' },
	{ value: BoardArticleCategory.DISCUSSION, label: 'Discussion' },
	{ value: BoardArticleCategory.HELP, label: 'Help' },
	{ value: BoardArticleCategory.SHOWCASE, label: 'Showcase' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	ALL: <GridViewIcon sx={{ fontSize: 16 }} />,
	QUESTION: <HelpOutlineIcon sx={{ fontSize: 16 }} />,
	REVIEW: <StarBorderIcon sx={{ fontSize: 16 }} />,
	DISCUSSION: <ForumOutlinedIcon sx={{ fontSize: 16 }} />,
	HELP: <SupportAgentOutlinedIcon sx={{ fontSize: 16 }} />,
	SHOWCASE: <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />,
};

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const articleCategory = query?.articleCategory as string;

	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		...initialInput,
		search:
			articleCategory && articleCategory !== 'ALL' ? { articleCategory: articleCategory as BoardArticleCategory } : {},
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');
	const [recentArticles, setRecentArticles] = useState<BoardArticle[]>([]);

	if (articleCategory) initialInput.search.articleCategory = articleCategory as BoardArticleCategory;

	/** APOLLO **/
	const { refetch: getBoardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total ?? 0);
		},
	});

	useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: 'createdAt',
				direction: 'DESC',
				search: { articleCategory: searchCommunity.search.articleCategory },
			},
		},
		onCompleted: (data: T) => {
			setRecentArticles(data?.getBoardArticles?.list ?? []);
		},
	});

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_ARTICLE);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory) {
			router.push(
				{ pathname: router.pathname, query: { articleCategory: BoardArticleCategory.QUESTION } },
				router.pathname,
				{ shallow: true },
			);
		}
	}, []);

	/** HANDLERS **/
	const likeArticleHandler = async (e: React.MouseEvent, articleId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) {
				const ok = await toastLoginConfirm('Please log in to like this post');
				if (ok) await router.push('/account/join');
				return;
			}
			await likeTargetBoardArticle({ variables: { input: articleId } });
			await getBoardArticlesRefetch({ input: searchCommunity });
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const categoryChangeHandler = async (value: string) => {
		setBoardArticles([]);
		setTotalCount(0);
		setSearchCommunity({
			...searchCommunity,
			page: 1,
			search: value === 'ALL' ? {} : { articleCategory: value as BoardArticleCategory },
		});
		await router.push({ pathname: '/community', query: { articleCategory: value } }, router.pathname, {
			shallow: true,
		});
	};

	const paginationHandler = (_: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const searchHandler = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			getBoardArticlesRefetch({ input: searchCommunity });
		}
	};

	const formatDate = (date: Date) =>
		new Date(date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase();

	const isActive = (value: string) => {
		if (value === 'ALL') return !searchCommunity.search.articleCategory;
		return searchCommunity.search.articleCategory === value;
	};

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="community-list-page" className="community--mobile">
				{/* Header */}
				<div className="com-mobile-header">
					<div className="com-mobile-header__top">
						<div>
							<span className="com-mobile-header__eyebrow">Our Community</span>
							<h1 className="com-mobile-header__title">Stories & Updates</h1>
						</div>
						<button
							className="com-mobile-header__write-btn"
							onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
						>
							+ Write
						</button>
					</div>
					<div className="com-mobile-tabs">
						{CATEGORIES.map((cat) => (
							<button
								key={cat.value}
								className={`com-mobile-tab${isActive(cat.value) ? ' active' : ''}`}
								onClick={() => categoryChangeHandler(cat.value)}
							>
								<span className="com-mobile-tab__icon">{CATEGORY_ICONS[cat.value]}</span>
								{cat.label}
							</button>
						))}
					</div>
				</div>

				{/* Article list */}
				<div className="com-mobile-list">
					{boardArticles.length > 0 ? (
						boardArticles.map((article) => {
							const isLiked = Boolean(article.meLiked?.[0]?.myFavorite);
							return (
								<div key={article._id} className="com-mobile-card">
									{/* Image with category badge */}
									{article.articleImage?.[0] && (
										<div
											className="com-mobile-card__img-wrap"
											onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id } })}
										>
											<img
												src={`${NEXT_PUBLIC_API_URL}/${article.articleImage[0]}`}
												alt={article.articleTitle}
												className="com-mobile-card__img"
											/>
											<span className="com-mobile-card__cat-badge">
												<span className="com-mobile-card__cat-icon">{CATEGORY_ICONS[article.articleCategory]}</span>
												{article.articleCategory}
											</span>
										</div>
									)}

									{/* Body */}
									<div className="com-mobile-card__body">
										{/* Title + like */}
										<div className="com-mobile-card__title-row">
											<h3
												className="com-mobile-card__title"
												onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id } })}
											>
												{article.articleTitle}
											</h3>
											<button
												className={`com-mobile-card__like-btn${isLiked ? ' liked' : ''}`}
												onClick={(e) => likeArticleHandler(e, article._id)}
											>
												{isLiked ? (
													<FavoriteIcon sx={{ fontSize: 16 }} />
												) : (
													<FavoriteBorderIcon sx={{ fontSize: 16 }} />
												)}
												<span>{article.articleLikes}</span>
											</button>
										</div>

										{/* Author row */}
										<div className="com-mobile-card__author">
											{article.memberData?.memberImage ? (
												<img
													src={`${NEXT_PUBLIC_API_URL}/${article.memberData.memberImage}`}
													alt={article.memberData?.memberNick}
												/>
											) : (
												<div className="com-mobile-card__author-avatar">
													{article.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
												</div>
											)}
											<span className="com-mobile-card__author-nick">
												{article.memberData?.memberNick ?? 'Anonymous'}
											</span>
											<span className="com-mobile-card__author-sep">·</span>
											<CalendarTodayIcon sx={{ fontSize: 10, color: '#8a94a6' }} />
											<span className="com-mobile-card__date">{formatDate(article.createdAt)}</span>
										</div>

										{/* Excerpt */}
										<p className="com-mobile-card__excerpt">
											{article.articleContent.length > 140
												? `${article.articleContent.slice(0, 140)}...`
												: article.articleContent}
										</p>

										{/* Footer: stats + read more */}
										<div className="com-mobile-card__footer">
											<div className="com-mobile-card__stats">
												<span>
													<ChatBubbleOutlineIcon sx={{ fontSize: 12 }} />
													{article.articleComments} comments
												</span>
												<span>
													<RemoveRedEyeIcon sx={{ fontSize: 12 }} />
													{article.articleViews}
												</span>
											</div>
											<button
												className="com-mobile-card__read-btn"
												onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id } })}
											>
												Read More
											</button>
										</div>
									</div>
								</div>
							);
						})
					) : (
						<div className="com-mobile-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No articles found in this category yet.</p>
							<button
								className="com-mobile-empty__write-btn"
								onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
							>
								Be the first to write
							</button>
						</div>
					)}
				</div>

				{/* Pagination */}
				{totalCount > 0 && (
					<div className="com-mobile-pagination">
						<Pagination
							count={Math.ceil(totalCount / searchCommunity.limit)}
							page={searchCommunity.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<p className="com-mobile-pagination__total">
							{totalCount} article{totalCount > 1 ? 's' : ''}
						</p>
					</div>
				)}
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div id="community-list-page">
			<div className="container">
				{/* Page header */}
				<div className="com-header">
					<div className="com-header__left">
						<span className="com-header__eyebrow">Our Community</span>
						<h1 className="com-header__title">Stories & Updates</h1>
					</div>
					<button
						className="com-header__write-btn"
						onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
					>
						+ Write Article
					</button>
				</div>

				<div className="com-layout">
					{/* ── SIDEBAR ── */}
					<aside className="com-sidebar">
						{/* Categories */}
						<div className="com-sidebar__block">
							<div className="com-sidebar__block-header">
								<TuneIcon sx={{ fontSize: 16 }} />
								<span>CATEGORIES</span>
							</div>
							<ul className="com-sidebar__cat-list">
								{CATEGORIES.map((cat) => (
									<li
										key={cat.value}
										className={`com-sidebar__cat-item${isActive(cat.value) ? ' active' : ''}`}
										onClick={() => categoryChangeHandler(cat.value)}
									>
										<span className="com-sidebar__cat-icon">{CATEGORY_ICONS[cat.value]}</span>
										{cat.label}
									</li>
								))}
							</ul>
						</div>

						{/* Search */}
						<div className="com-sidebar__block">
							<div className="com-sidebar__search">
								<input
									type="text"
									placeholder="Search articles..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									onKeyDown={searchHandler}
								/>
								<button onClick={() => getBoardArticlesRefetch({ input: searchCommunity })}>
									<SearchIcon sx={{ fontSize: 17 }} />
								</button>
							</div>
						</div>

						{/* Recent Posts */}
						<div className="com-sidebar__block">
							<h3 className="com-sidebar__section-title">RECENT POST</h3>
							<div className="com-sidebar__recent-list">
								{recentArticles.map((article) => (
									<div
										key={article._id}
										className="com-sidebar__recent-item"
										onClick={() => router.push({ pathname: '/community/detail', query: { id: article._id } })}
									>
										{article.articleImage?.[0] ? (
											<img
												src={`${NEXT_PUBLIC_API_URL}/${article.articleImage[0]}`}
												alt={article.articleTitle}
												className="com-sidebar__recent-img"
											/>
										) : (
											<div className="com-sidebar__recent-img com-sidebar__recent-img--placeholder">
												{CATEGORY_ICONS[article.articleCategory]}
											</div>
										)}
										<div className="com-sidebar__recent-info">
											<p className="com-sidebar__recent-title">{article.articleTitle}</p>
											<span className="com-sidebar__recent-date">{formatDate(article.createdAt)}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</aside>

					{/* ── MAIN ── */}
					<main className="com-main">
						{boardArticles.length > 0 ? (
							boardArticles.map((article: BoardArticle) => (
								<ArticleCard key={article._id} article={article} onLike={likeArticleHandler} />
							))
						) : (
							<div className="com-empty">
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No articles found in this category yet.</p>
								<button
									className="com-empty__write-btn"
									onClick={() => router.push({ pathname: '/mypage', query: { category: 'writeArticle' } })}
								>
									Be the first to write
								</button>
							</div>
						)}

						{/* Pagination */}
						{totalCount > 0 && (
							<div className="com-pagination">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
								<Typography className="com-pagination__total">
									Total {totalCount} article{totalCount > 1 ? 's' : ''}
								</Typography>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { articleCategory: BoardArticleCategory.QUESTION },
	},
};

export default withLayoutBasic(Community);
