import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Comment } from '../../libs/types/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { NEXT_PUBLIC_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { toastErrorHandling, toastSmallSuccess, toastLoginConfirm, toastConfirm } from '../../libs/toast';
import dynamic from 'next/dynamic';
const TiptapViewer = dynamic(() => import('../../libs/components/community/TiptapViewer'), { ssr: false });
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	QUESTION: <HelpOutlineIcon sx={{ fontSize: 14 }} />,
	REVIEW: <StarBorderIcon sx={{ fontSize: 14 }} />,
	DISCUSSION: <ForumOutlinedIcon sx={{ fontSize: 14 }} />,
	HELP: <SupportAgentOutlinedIcon sx={{ fontSize: 14 }} />,
	SHOWCASE: <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />,
};

const CATEGORY_LABELS: Record<string, string> = {
	QUESTION: 'Questions',
	REVIEW: 'Reviews',
	DISCUSSION: 'Discussion',
	HELP: 'Help',
	SHOWCASE: 'Showcase',
};

const formatDate = (date: Date) =>
	new Date(date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase();

const formatDateShort = (date: Date) =>
	new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { query } = router;
	const articleId = query?.id as string;

	const [boardArticle, setBoardArticle] = useState<BoardArticle | undefined>();
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({ ...initialInput });

	const [editingCommentId, setEditingCommentId] = useState<string>('');
	const [editingContent, setEditingContent] = useState<string>('');
	const [editingWordsCnt, setEditingWordsCnt] = useState<number>(0);

	/** APOLLO **/
	const { refetch: getBoardArticleRefetch } = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'cache-and-network',
		variables: { input: articleId },
		skip: !articleId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticle(data?.getBoardArticle);
		},
	});

	const { refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setComments(data?.getComments?.list ?? []);
			setTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const likeBoardArticleHandler = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			if (!user?._id) {
				const ok = await toastLoginConfirm('Please log in to like this post');
				if (ok)
					router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } }, undefined, {
						shallow: true,
					});
				return;
			}
			await likeTargetBoardArticle({ variables: { input: articleId } });
			const { data } = await getBoardArticleRefetch({ input: articleId });
			if (data?.getBoardArticle) setBoardArticle(data.getBoardArticle);
			toastSmallSuccess('Success', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const createCommentHandler = async () => {
		if (!comment.trim()) return;
		try {
			if (!user?._id) {
				const ok = await toastLoginConfirm('Please log in to comment');
				if (ok)
					router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } }, undefined, {
						shallow: true,
					});
				return;
			}
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment.trim(),
			};
			await createComment({ variables: { input: commentInput } });
			const { data } = await getCommentsRefetch({ input: searchFilter });
			if (data?.getComments?.list) setComments(data.getComments.list);
			setTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
			await getBoardArticleRefetch({ input: articleId });
			setComment('');
			setWordsCnt(0);
			toastSmallSuccess('Comment posted!', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const deleteCommentHandler = async (commentId: string) => {
		const ok = await toastConfirm('Delete this comment?');
		if (!ok) return;
		try {
			const updateData: CommentUpdate = { _id: commentId, commentStatus: CommentStatus.DELETE };
			await updateComment({ variables: { input: updateData } });
			const { data } = await getCommentsRefetch({ input: searchFilter });
			if (data?.getComments?.list) setComments(data.getComments.list);
			setTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
			toastSmallSuccess('Deleted', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const saveEditCommentHandler = async (commentId: string) => {
		if (!editingContent.trim()) return;
		const original = comments.find((c) => c._id === commentId)?.commentContent;
		if (editingContent.trim() === original) {
			setEditingCommentId('');
			return;
		}
		try {
			const updateData: CommentUpdate = { _id: commentId, commentContent: editingContent.trim() };
			await updateComment({ variables: { input: updateData } });
			const { data } = await getCommentsRefetch({ input: searchFilter });
			if (data?.getComments?.list) setComments(data.getComments.list);
			setEditingCommentId('');
			setEditingContent('');
			setEditingWordsCnt(0);
			toastSmallSuccess('Updated!', 800);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const startEditingComment = (c: Comment) => {
		setEditingCommentId(c._id);
		setEditingContent(c.commentContent);
		setEditingWordsCnt(c.commentContent.length);
	};

	const cancelEditingComment = () => {
		setEditingCommentId('');
		setEditingContent('');
		setEditingWordsCnt(0);
	};

	const goMemberPage = (memberId: string) => {
		if (memberId === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${memberId}`);
	};

	const paginationHandler = (_: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const CommentAvatar = ({ imageUrl, onClick }: { imageUrl?: string; onClick?: () => void }) =>
		imageUrl ? (
			<img
				src={`${NEXT_PUBLIC_API_URL}/${imageUrl}`}
				alt=""
				className="cd-comment__avatar"
				onClick={onClick}
				style={{ cursor: onClick ? 'pointer' : 'default' }}
			/>
		) : (
			<AccountCircleIcon
				onClick={onClick}
				sx={{ fontSize: 38, color: '#c0c8d4', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
			/>
		);

	const isLiked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="community-detail-page" className="community-detail--mobile">
				<div className="cd-mobile-header">
					<button className="cd-mobile-header__back" onClick={() => router.back()}>
						<ArrowBackIcon sx={{ fontSize: 20 }} />
					</button>
					{boardArticle && (
						<span className="cd-mobile-header__cat">
							{CATEGORY_ICONS[boardArticle.articleCategory]}
							{CATEGORY_LABELS[boardArticle.articleCategory] ?? boardArticle.articleCategory}
						</span>
					)}
				</div>

				<div className="cd-mobile-body">
					{boardArticle?.articleImage?.[0] && (
						<div className="cd-mobile-hero">
							<img src={`${NEXT_PUBLIC_API_URL}/${boardArticle.articleImage[0]}`} alt={boardArticle.articleTitle} />
						</div>
					)}

					<div className="cd-mobile-article">
						<h1 className="cd-mobile-article__title">{boardArticle?.articleTitle}</h1>

						<div className="cd-mobile-article__author">
							{boardArticle?.memberData?.memberImage ? (
								<img
									src={`${NEXT_PUBLIC_API_URL}/${boardArticle.memberData.memberImage}`}
									alt={boardArticle.memberData.memberNick}
									onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
								/>
							) : (
								<div
									className="cd-mobile-article__author-avatar"
									onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
								>
									{boardArticle?.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
								</div>
							)}
							<div className="cd-mobile-article__author-info">
								<span
									className="cd-mobile-article__author-nick"
									onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
								>
									{boardArticle?.memberData?.memberNick ?? 'Anonymous'}
								</span>
								<span className="cd-mobile-article__author-date">
									{boardArticle?.createdAt && formatDate(boardArticle.createdAt)}
								</span>
							</div>
						</div>

						<div className="cd-mobile-article__stats">
							<span>
								<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
								{boardArticle?.articleViews}
							</span>
							<span>
								<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
								{boardArticle?.articleComments}
							</span>
							<button className={`cd-mobile-article__like${isLiked ? ' liked' : ''}`} onClick={likeBoardArticleHandler}>
								{isLiked ? <FavoriteIcon sx={{ fontSize: 14 }} /> : <FavoriteBorderIcon sx={{ fontSize: 14 }} />}
								{boardArticle?.articleLikes}
							</button>
						</div>

						<div className="cd-mobile-article__content">
							<TiptapViewer markdown={boardArticle?.articleContent ?? ''} className="cd-viewer" />
						</div>
					</div>

					<div className="cd-mobile-comments">
						<h3 className="cd-mobile-comments__title">Comments ({total})</h3>

						<div className="cd-mobile-comments__input-row">
							{user?.memberImage ? (
								<img
									src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`}
									alt=""
									className="cd-mobile-comments__me-avatar"
								/>
							) : (
								<div className="cd-mobile-comments__me-avatar cd-mobile-comments__me-avatar--init">
									{user?.memberNick?.[0]?.toUpperCase() ?? '?'}
								</div>
							)}
							<div className="cd-mobile-comments__input-wrap">
								<input
									type="text"
									placeholder="Write a comment..."
									value={comment}
									maxLength={100}
									onChange={(e) => {
										setComment(e.target.value);
										setWordsCnt(e.target.value.length);
									}}
									onKeyDown={(e) => e.key === 'Enter' && createCommentHandler()}
								/>
								<button onClick={createCommentHandler} disabled={!comment.trim()}>
									<SendIcon sx={{ fontSize: 16 }} />
								</button>
							</div>
						</div>

						{comments.map((c) => (
							<div key={c._id} className="cd-mobile-comment">
								<CommentAvatar
									imageUrl={c.memberData?.memberImage}
									onClick={() => goMemberPage(c.memberData?._id as string)}
								/>
								<div className="cd-mobile-comment__body">
									<div className="cd-mobile-comment__header">
										<span className="cd-mobile-comment__nick" onClick={() => goMemberPage(c.memberData?._id as string)}>
											{c.memberData?.memberNick ?? 'Anonymous'}
										</span>
										<span className="cd-mobile-comment__date">{formatDateShort(c.createdAt)}</span>
										{c.memberId === user?._id && (
											<div className="cd-mobile-comment__actions">
												<button onClick={() => startEditingComment(c)}>
													<EditOutlinedIcon sx={{ fontSize: 14 }} />
												</button>
												<button onClick={() => deleteCommentHandler(c._id)}>
													<DeleteOutlineIcon sx={{ fontSize: 14 }} />
												</button>
											</div>
										)}
									</div>
									{editingCommentId === c._id ? (
										<div className="cd-mobile-comment__edit">
											<input
												autoFocus
												value={editingContent}
												maxLength={100}
												onChange={(e) => {
													setEditingContent(e.target.value);
													setEditingWordsCnt(e.target.value.length);
												}}
												onKeyDown={(e) => e.key === 'Enter' && saveEditCommentHandler(c._id)}
											/>
											<div className="cd-mobile-comment__edit-actions">
												<button onClick={() => saveEditCommentHandler(c._id)}>
													<CheckIcon sx={{ fontSize: 13 }} /> Save
												</button>
												<button onClick={cancelEditingComment}>
													<CloseIcon sx={{ fontSize: 13 }} /> Cancel
												</button>
											</div>
										</div>
									) : (
										<p className="cd-mobile-comment__content">{c.commentContent}</p>
									)}
								</div>
							</div>
						))}

						{total > searchFilter.limit && (
							<div className="cd-mobile-comments__pagination">
								<Pagination
									count={Math.ceil(total / searchFilter.limit)}
									page={searchFilter.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div id="community-detail-page">
			<div className="container">
				<div className="cd-layout">
					<main className="cd-main">
						<div className="cd-breadcrumb">
							<button className="cd-breadcrumb__back" onClick={() => router.back()}>
								<ArrowBackIcon sx={{ fontSize: 15 }} />
								Back to Community
							</button>
							{boardArticle && (
								<span className="cd-breadcrumb__cat">
									{CATEGORY_ICONS[boardArticle.articleCategory]}
									{CATEGORY_LABELS[boardArticle.articleCategory] ?? boardArticle.articleCategory}
								</span>
							)}
						</div>

						<div className="cd-article">
							{boardArticle?.articleImage?.[0] && (
								<div className="cd-article__hero">
									<img src={`${NEXT_PUBLIC_API_URL}/${boardArticle.articleImage[0]}`} alt={boardArticle.articleTitle} />
								</div>
							)}

							<div className="cd-article__body">
								<h1 className="cd-article__title">{boardArticle?.articleTitle}</h1>

								<div className="cd-article__meta">
									<div className="cd-article__author">
										{boardArticle?.memberData?.memberImage ? (
											<img
												src={`${NEXT_PUBLIC_API_URL}/${boardArticle.memberData.memberImage}`}
												alt={boardArticle.memberData.memberNick}
												className="cd-article__author-img"
												onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
											/>
										) : (
											<div
												className="cd-article__author-avatar"
												onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
											>
												{boardArticle?.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
											</div>
										)}
										<div className="cd-article__author-info">
											<span
												className="cd-article__author-nick"
												onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
											>
												{boardArticle?.memberData?.memberNick ?? 'Anonymous'}
											</span>
											<span className="cd-article__author-date">
												<CalendarTodayIcon sx={{ fontSize: 11 }} />
												{boardArticle?.createdAt && formatDate(boardArticle.createdAt)}
											</span>
										</div>
									</div>

									<div className="cd-article__stats">
										<span className="cd-article__stat">
											<RemoveRedEyeIcon sx={{ fontSize: 14 }} />
											{boardArticle?.articleViews}
										</span>
										<span className="cd-article__stat">
											<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />
											{boardArticle?.articleComments}
										</span>
										<button
											className={`cd-article__like-btn${isLiked ? ' liked' : ''}`}
											onClick={likeBoardArticleHandler}
										>
											<span className="cd-article__like-icon">
												{isLiked ? (
													<FavoriteIcon sx={{ fontSize: 18 }} />
												) : (
													<FavoriteBorderIcon sx={{ fontSize: 18 }} />
												)}
											</span>
											{boardArticle?.articleLikes}
										</button>
									</div>
								</div>

								<div className="cd-article__divider" />

								<div className="cd-article__content">
									<TiptapViewer markdown={boardArticle?.articleContent ?? ''} className="cd-viewer" />
								</div>
							</div>
						</div>

						<div className="cd-comments">
							<h2 className="cd-comments__title">
								Comments
								<span className="cd-comments__count">{total}</span>
							</h2>

							<div className="cd-comments__input-box">
								<div className="cd-comments__input-avatar">
									{user?.memberImage ? (
										<img src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`} alt="" />
									) : (
										<div className="cd-comments__input-avatar-init">{user?.memberNick?.[0]?.toUpperCase() ?? '?'}</div>
									)}
								</div>
								<div className="cd-comments__input-wrap">
									<input
										type="text"
										placeholder={user?._id ? 'Write a comment...' : 'Log in to leave a comment'}
										value={comment}
										maxLength={100}
										onChange={(e) => {
											setComment(e.target.value);
											setWordsCnt(e.target.value.length);
										}}
										onKeyDown={(e) => e.key === 'Enter' && createCommentHandler()}
									/>
									<div className="cd-comments__input-footer">
										<span className="cd-comments__char-count">{wordsCnt}/100</span>
										<button className="cd-comments__submit" onClick={createCommentHandler} disabled={!comment.trim()}>
											<SendIcon sx={{ fontSize: 15 }} />
											Post
										</button>
									</div>
								</div>
							</div>

							<div className="cd-comments__list">
								{comments.length > 0 ? (
									comments.map((c) => (
										<div key={c._id} className="cd-comment">
											<CommentAvatar
												imageUrl={c.memberData?.memberImage}
												onClick={() => goMemberPage(c.memberData?._id as string)}
											/>
											<div className="cd-comment__body">
												<div className="cd-comment__header">
													<div className="cd-comment__header-left">
														<span
															className="cd-comment__nick"
															onClick={() => goMemberPage(c.memberData?._id as string)}
														>
															{c.memberData?.memberNick ?? 'Anonymous'}
														</span>
														<span className="cd-comment__date">{formatDateShort(c.createdAt)}</span>
													</div>
													{c.memberId === user?._id && (
														<div className="cd-comment__actions">
															<button className="cd-comment__action-btn" onClick={() => startEditingComment(c)}>
																<EditOutlinedIcon sx={{ fontSize: 14 }} />
																Edit
															</button>
															<button
																className="cd-comment__action-btn cd-comment__action-btn--delete"
																onClick={() => deleteCommentHandler(c._id)}
															>
																<DeleteOutlineIcon sx={{ fontSize: 14 }} />
																Delete
															</button>
														</div>
													)}
												</div>
												{editingCommentId === c._id ? (
													<div className="cd-comment__edit">
														<input
															autoFocus
															value={editingContent}
															maxLength={100}
															onChange={(e) => {
																setEditingContent(e.target.value);
																setEditingWordsCnt(e.target.value.length);
															}}
															onKeyDown={(e) => e.key === 'Enter' && saveEditCommentHandler(c._id)}
														/>
														<div className="cd-comment__edit-footer">
															<span className="cd-comment__edit-count">{editingWordsCnt}/100</span>
															<div className="cd-comment__edit-actions">
																<button
																	className="cd-comment__edit-btn cd-comment__edit-btn--save"
																	onClick={() => saveEditCommentHandler(c._id)}
																>
																	<CheckIcon sx={{ fontSize: 13 }} />
																	Save
																</button>
																<button
																	className="cd-comment__edit-btn cd-comment__edit-btn--cancel"
																	onClick={cancelEditingComment}
																>
																	<CloseIcon sx={{ fontSize: 13 }} />
																	Cancel
																</button>
															</div>
														</div>
													</div>
												) : (
													<p className="cd-comment__content">{c.commentContent}</p>
												)}
											</div>
										</div>
									))
								) : (
									<div className="cd-comments__empty">
										<ChatBubbleOutlineIcon sx={{ fontSize: 32, color: '#c0c8d4' }} />
										<p>No comments yet. Be the first!</p>
									</div>
								)}
							</div>

							{total > searchFilter.limit && (
								<div className="cd-comments__pagination">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</div>
							)}
						</div>
					</main>

					<aside className="cd-sidebar">
						<div className="cd-sidebar__block">
							<div className="cd-sidebar__block-header">Author</div>
							<div className="cd-sidebar__author">
								{boardArticle?.memberData?.memberImage ? (
									<img
										src={`${NEXT_PUBLIC_API_URL}/${boardArticle.memberData.memberImage}`}
										alt={boardArticle.memberData.memberNick}
										className="cd-sidebar__author-img"
										onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
									/>
								) : (
									<div
										className="cd-sidebar__author-avatar"
										onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
									>
										{boardArticle?.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A'}
									</div>
								)}
								<span
									className="cd-sidebar__author-nick"
									onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
								>
									{boardArticle?.memberData?.memberNick ?? 'Anonymous'}
								</span>
								<button
									className="cd-sidebar__author-profile-btn"
									onClick={() => goMemberPage(boardArticle?.memberData?._id as string)}
								>
									View Profile
								</button>
							</div>
						</div>

						<div className="cd-sidebar__block">
							<div className="cd-sidebar__block-header">Article Info</div>
							<div className="cd-sidebar__info-list">
								<div className="cd-sidebar__info-item">
									<span className="cd-sidebar__info-label">Category</span>
									<span className="cd-sidebar__info-value cd-sidebar__info-value--cat">
										{boardArticle && CATEGORY_ICONS[boardArticle.articleCategory]}
										{boardArticle && (CATEGORY_LABELS[boardArticle.articleCategory] ?? boardArticle.articleCategory)}
									</span>
								</div>
								<div className="cd-sidebar__info-item">
									<span className="cd-sidebar__info-label">Published</span>
									<span className="cd-sidebar__info-value">
										{boardArticle?.createdAt && formatDateShort(boardArticle.createdAt)}
									</span>
								</div>
								<div className="cd-sidebar__info-item">
									<span className="cd-sidebar__info-label">Views</span>
									<span className="cd-sidebar__info-value">{boardArticle?.articleViews ?? 0}</span>
								</div>
								<div className="cd-sidebar__info-item">
									<span className="cd-sidebar__info-label">Likes</span>
									<span className="cd-sidebar__info-value">{boardArticle?.articleLikes ?? 0}</span>
								</div>
								<div className="cd-sidebar__info-item">
									<span className="cd-sidebar__info-label">Comments</span>
									<span className="cd-sidebar__info-value">{boardArticle?.articleComments ?? 0}</span>
								</div>
							</div>
						</div>

						<button
							className="cd-sidebar__back-btn"
							onClick={() =>
								router.push({
									pathname: '/community',
									query: { articleCategory: boardArticle?.articleCategory ?? BoardArticleCategory.QUESTION },
								})
							}
						>
							← Back to Community
						</button>
					</aside>
				</div>
			</div>
		</div>
	);
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
