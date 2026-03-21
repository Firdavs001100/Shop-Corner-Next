import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { userVar } from '../../apollo/store';
import { GET_MEMBER, GET_BOARD_ARTICLES, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER, LIKE_TARGET_ARTICLE } from '../../apollo/user/mutation';
import { NEXT_PUBLIC_API_URL, Messages } from '../../libs/config';
import { toastErrorHandling, toastSmallSuccess } from '../../libs/toast';
import { Member } from '../../libs/types/member/member';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Follower, Following } from '../../libs/types/follow/follow';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ArticleCard from '../../libs/components/community/ArticleCard';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

type Tab = 'articles' | 'followers' | 'followings';

const MemberPage: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = router.query?.memberId as string;

	const [member, setMember] = useState<Member | null>(null);
	const [activeTab, setActiveTab] = useState<Tab>('articles');
	const [articlesTotal, setArticlesTotal] = useState(0);
	const [articlesPage, setArticlesPage] = useState(1);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [followersTotal, setFollowersTotal] = useState(0);
	const [followingsTotal, setFollowingsTotal] = useState(0);
	const [followings, setFollowings] = useState<Following[]>([]);
	const [isFollowing, setIsFollowing] = useState(false);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_ARTICLE);

	// ─── MEMBER ─────────────────────────────────────

	const { data: memberData } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
	});

	useEffect(() => {
		if (!memberData) return;
		const m = memberData?.getMember;
		setMember(m);
		if (m?.meFollowed?.[0]?.myFollowing !== undefined) {
			setIsFollowing(!!m.meFollowed[0].myFollowing);
		}
	}, [memberData]);

	// ─── ARTICLES ───────────────────────────────────

	const { data: articlesData, refetch: refetchArticles } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: articlesPage, limit: 5, sort: 'createdAt', direction: 'DESC', search: { memberId } },
		},
		skip: !memberId,
	});

	useEffect(() => {
		if (!articlesData) return;
		setArticles(articlesData?.getBoardArticles?.list ?? []);
		setArticlesTotal(articlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
	}, [articlesData]);

	useEffect(() => {
		if (articlesPage && memberId) {
			refetchArticles({
				input: { page: articlesPage, limit: 5, sort: 'createdAt', direction: 'DESC', search: { memberId } },
			});
		}
	}, [articlesPage, memberId]);

	// ─── FOLLOWERS ──────────────────────────────────

	const { data: followersData } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 10, search: { followingId: memberId } } },
		skip: !memberId,
	});

	useEffect(() => {
		if (!followersData) return;
		setFollowersTotal(followersData?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0);
	}, [followersData]);

	// ─── FOLLOWINGS ─────────────────────────────────

	const { data: followingsData } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 10, search: { followerId: memberId } } },
		skip: !memberId,
	});

	useEffect(() => {
		if (!followingsData) return;
		setFollowings(followingsData?.getMemberFollowings?.list ?? []);
		setFollowingsTotal(followingsData?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0);
	}, [followingsData]);

	// ─── HERO HANDLERS ──────────────────────────────

	const subscribeHeroHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({
				variables: { input: memberId },
				refetchQueries: [
					{ query: GET_MEMBER, variables: { input: memberId } },
					{
						query: GET_MEMBER_FOLLOWERS,
						variables: { input: { page: 1, limit: 10, search: { followingId: memberId } } },
					},
					{
						query: GET_MEMBER_FOLLOWINGS,
						variables: { input: { page: 1, limit: 10, search: { followerId: memberId } } },
					},
				],
				awaitRefetchQueries: true,
			});
			setIsFollowing(true);
			toastSmallSuccess('Subscribed!', 800);
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const unsubscribeHeroHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({
				variables: { input: memberId },
				refetchQueries: [
					{ query: GET_MEMBER, variables: { input: memberId } },
					{
						query: GET_MEMBER_FOLLOWERS,
						variables: { input: { page: 1, limit: 10, search: { followingId: memberId } } },
					},
					{
						query: GET_MEMBER_FOLLOWINGS,
						variables: { input: { page: 1, limit: 10, search: { followerId: memberId } } },
					},
				],
				awaitRefetchQueries: true,
			});
			setIsFollowing(false);
			toastSmallSuccess('Unsubscribed!', 800);
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const likeHeroHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({
				variables: { input: memberId },
				refetchQueries: [{ query: GET_MEMBER, variables: { input: memberId } }],
				awaitRefetchQueries: true,
			});
			toastSmallSuccess('Success', 800);
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const likeArticleHandler = async (e: React.MouseEvent, articleId: string) => {
		try {
			e.stopPropagation();
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: articleId } });
			toastSmallSuccess('Success', 800);
			await refetchArticles({
				input: { page: articlesPage, limit: 5, sort: 'createdAt', direction: 'DESC', search: { memberId } },
			});
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	// ─── CARD HANDLERS (passed to child components) ──
	// These are plain mutations with no refetchQueries so they don't
	// interfere with the hero's isFollowing state

	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error2);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			toastSmallSuccess('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error2);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			toastSmallSuccess('Unsubscribed!', 800);
			await refetch({ input: query });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			toastSmallSuccess('Success', 800);
			await refetch({ input: query });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const redirectToMemberPageHandler = async (id: string) => {
		try {
			if (!id) return;
			if (id === user?._id) await router.push(`/mypage?memberId=${id}`);
			else await router.push(`/member?memberId=${id}`);
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

	const isMe = user?._id === memberId;
	const avatarSrc = member?.memberImage ? `${NEXT_PUBLIC_API_URL}/${member.memberImage}` : null;
	const isLiked = member?.meLiked?.[0]?.myFavorite;

	const STATS = [
		{ icon: <ArticleOutlinedIcon />, label: 'Articles', value: articlesTotal ?? 0 },
		{ icon: <FavoriteBorderIcon />, label: 'Likes', value: member?.memberLikes ?? 0 },
		{ icon: <RemoveRedEyeOutlinedIcon />, label: 'Views', value: member?.memberViews ?? 0 },
		{ icon: <EmojiEventsOutlinedIcon />, label: 'Points', value: member?.memberPoints ?? 0 },
	];

	const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
		{ key: 'articles', label: 'Articles', icon: <ArticleOutlinedIcon />, count: articlesTotal },
		{ key: 'followers', label: 'Followers', icon: <PeopleAltOutlinedIcon />, count: followersTotal },
		{ key: 'followings', label: 'Followings', icon: <PersonAddAltOutlinedIcon />, count: followingsTotal },
	];

	const childProps = {
		subscribeHandler,
		unsubscribeHandler,
		likeMemberHandler,
		redirectToMemberPageHandler,
	};

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="member-page" className="member-page--mobile">
				<div className="mem-mob-hero">
					<div className="mem-mob-hero__identity">
						<div className="mem-mob-hero__avatar-wrap">
							{avatarSrc ? (
								<img src={avatarSrc} alt={member?.memberNick} className="mem-mob-hero__avatar" />
							) : (
								<AccountCircleIcon className="mem-mob-hero__avatar-icon" />
							)}
						</div>
						<div className="mem-mob-hero__info">
							<h2 className="mem-mob-hero__nick">{member?.memberNick ?? '—'}</h2>
							{member?.memberAddress && (
								<span className="mem-mob-hero__location">
									<LocationOnOutlinedIcon sx={{ fontSize: 13 }} />
									{member.memberAddress}
								</span>
							)}
							<span className="mem-mob-hero__joined">
								<CalendarTodayOutlinedIcon sx={{ fontSize: 11 }} />
								Joined {member?.createdAt ? formatDate(member.createdAt) : '—'}
							</span>
						</div>
					</div>

					{member?.memberDesc && <p className="mem-mob-hero__desc">{member.memberDesc}</p>}

					<div className="mem-mob-hero__stats">
						{STATS.map((s) => (
							<div key={s.label} className="mem-mob-hero__stat">
								<span className="mem-mob-hero__stat-value">{s.value}</span>
								<span className="mem-mob-hero__stat-label">{s.label}</span>
							</div>
						))}
					</div>

					{!isMe && (
						<div className="mem-mob-hero__actions">
							{isFollowing ? (
								<button className="mem-mob-hero__unfollow-btn" onClick={unsubscribeHeroHandler}>
									Unfollow
								</button>
							) : (
								<button className="mem-mob-hero__follow-btn" onClick={subscribeHeroHandler}>
									<PersonAddAltOutlinedIcon sx={{ fontSize: 15 }} /> Follow
								</button>
							)}
							<button className={`mem-mob-hero__like-btn${isLiked ? ' liked' : ''}`} onClick={likeHeroHandler}>
								{isLiked ? (
									<FavoriteIcon sx={{ fontSize: 15, color: '#e53935' }} />
								) : (
									<FavoriteBorderIcon sx={{ fontSize: 15 }} />
								)}
								{member?.memberLikes ?? 0}
							</button>
						</div>
					)}
				</div>

				<div className="mem-mob-tabs">
					{TABS.map((tab) => (
						<button
							key={tab.key}
							className={`mem-mob-tab${activeTab === tab.key ? ' active' : ''}`}
							onClick={() => setActiveTab(tab.key)}
						>
							{tab.label}
							<span className="mem-mob-tab__count">{tab.count}</span>
						</button>
					))}
				</div>

				<div className="mem-mob-content">
					{activeTab === 'articles' && (
						<div className="mem-mob-articles">
							{articles.length === 0 ? (
								<div className="mem-mob-empty">
									<ArticleOutlinedIcon />
									<p>No articles yet</p>
								</div>
							) : (
								<>
									{articles.map((article) => (
										<ArticleCard key={article._id} article={article} onLike={likeArticleHandler} />
									))}
									{articlesTotal > 5 && (
										<Pagination
											page={articlesPage}
											count={Math.ceil(articlesTotal / 5)}
											onChange={(_, v) => setArticlesPage(v)}
											shape="rounded"
											size="small"
										/>
									)}
								</>
							)}
						</div>
					)}
					{activeTab === 'followers' && (
						<MemberFollowers key={followersTotal} memberNick={member?.memberNick} {...childProps} />
					)}
					{activeTab === 'followings' && (
						<MemberFollowings key={followingsTotal} memberNick={member?.memberNick} {...childProps} />
					)}
				</div>
			</div>
		);
	}

	// ── DESKTOP ──────────────────────────────────────────────────────────────

	return (
		<div id="member-page">
			<div className="container">
				{/* ── HERO ── */}
				<div className="mem-hero">
					<div className="mem-hero__cover" />

					<div className="mem-hero__body">
						<div className="mem-hero__left">
							<div className="mem-hero__avatar-wrap">
								{avatarSrc ? (
									<img src={avatarSrc} alt={member?.memberNick} className="mem-hero__avatar" />
								) : (
									<AccountCircleIcon className="mem-hero__avatar-icon" />
								)}
							</div>
							<div className="mem-hero__identity">
								<h1 className="mem-hero__nick">{member?.memberNick ?? '—'}</h1>
								<div className="mem-hero__meta">
									{member?.memberFullName && <span className="mem-hero__meta-item">{member.memberFullName}</span>}
									{member?.memberAddress && (
										<span className="mem-hero__meta-item">
											<LocationOnOutlinedIcon sx={{ fontSize: 13 }} />
											{member.memberAddress}
										</span>
									)}
									<span className="mem-hero__meta-item">
										<CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
										Joined {member?.createdAt ? formatDate(member.createdAt) : '—'}
									</span>
								</div>
								{member?.memberDesc && <p className="mem-hero__desc">{member.memberDesc}</p>}
							</div>
						</div>

						<div className="mem-hero__right">
							<div className="mem-hero__stats">
								{STATS.map((s) => (
									<div key={s.label} className="mem-hero__stat">
										<span className="mem-hero__stat-value">{s.value}</span>
										<span className="mem-hero__stat-label">{s.label}</span>
									</div>
								))}
							</div>

							{!isMe && (
								<div className="mem-hero__actions">
									{isFollowing ? (
										<button className="mem-hero__unfollow-btn" onClick={unsubscribeHeroHandler}>
											Unfollow
										</button>
									) : (
										<button className="mem-hero__follow-btn" onClick={subscribeHeroHandler}>
											<PersonAddAltOutlinedIcon sx={{ fontSize: 15 }} /> Follow
										</button>
									)}
									<button className={`mem-hero__like-btn${isLiked ? ' liked' : ''}`} onClick={likeHeroHandler}>
										{isLiked ? (
											<FavoriteIcon sx={{ fontSize: 15, color: '#e53935' }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 15 }} />
										)}
										{member?.memberLikes ?? 0}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ── TABS ── */}
				<div className="mem-tabs">
					{TABS.map((tab) => (
						<button
							key={tab.key}
							className={`mem-tab${activeTab === tab.key ? ' active' : ''}`}
							onClick={() => setActiveTab(tab.key)}
						>
							<span className="mem-tab__icon">{tab.icon}</span>
							{tab.label}
							<span className="mem-tab__count">{tab.count}</span>
						</button>
					))}
				</div>

				{/* ── CONTENT ── */}
				<div className="mem-content">
					{activeTab === 'articles' && (
						<div className="mem-articles">
							{articles.length === 0 ? (
								<div className="mem-empty">
									<ArticleOutlinedIcon sx={{ fontSize: 40 }} />
									<p>No articles yet</p>
								</div>
							) : (
								<>
									{articles.map((article) => (
										<ArticleCard key={article._id} article={article} onLike={likeArticleHandler} />
									))}
									{articlesTotal > 5 && (
										<div className="mem-pagination">
											<Pagination
												page={articlesPage}
												count={Math.ceil(articlesTotal / 5)}
												onChange={(_, v) => setArticlesPage(v)}
												shape="rounded"
												color="primary"
											/>
										</div>
									)}
								</>
							)}
						</div>
					)}
					{activeTab === 'followers' && (
						<MemberFollowers key={followersTotal} memberNick={member?.memberNick} {...childProps} />
					)}
					{activeTab === 'followings' && (
						<MemberFollowings key={followingsTotal} memberNick={member?.memberNick} {...childProps} />
					)}
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MemberPage);
