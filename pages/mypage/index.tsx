import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyArticles from '../../libs/components/mypage/MyArticles';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { toastErrorHandling, toastSmallSuccess } from '../../libs/toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages, NEXT_PUBLIC_API_URL } from '../../libs/config';
import { MemberType } from '../../libs/enums/member.enum';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const getMenuItems = (t: any) => [
	{
		group: t('account'),
		items: [
			{ key: 'myProfile', label: t('myProfile'), icon: <PersonOutlineIcon /> },
			{ key: 'myOrders', label: t('myOrders'), icon: <ShoppingBagOutlinedIcon /> },
		],
	},
	{
		group: t('content'),
		items: [
			{ key: 'myArticles', label: t('myArticles'), icon: <ArticleOutlinedIcon /> },
			{ key: 'writeArticle', label: t('writeArticle'), icon: <EditNoteOutlinedIcon /> },
		],
	},
	{
		group: t('library'),
		items: [
			{ key: 'myFavorites', label: t('favorites'), icon: <FavoriteBorderIcon /> },
			{ key: 'recentlyVisited', label: t('recentlyVisited'), icon: <HistoryOutlinedIcon /> },
		],
	},
	{
		group: t('network'),
		items: [
			{ key: 'followers', label: t('followers'), icon: <PeopleAltOutlinedIcon /> },
			{ key: 'followings', label: t('followings'), icon: <PersonAddAltOutlinedIcon /> },
		],
	},
];

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const category: string = (router.query?.category as string) ?? 'myProfile';

	const MENU_ITEMS = getMenuItems(t);
	const FLAT_MENU = MENU_ITEMS.flatMap((g) => g.items);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const [mounted, setMounted] = useState(false);

	const isAdmin = user?.memberType === MemberType.ADMIN;

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		if (!user?._id) router.replace('/');
	}, [mounted, user]);

	const navigate = (key: string) => {
		router.push({ pathname: '/mypage', query: { category: key } }, undefined, { shallow: true });
	};

	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			toastSmallSuccess('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			toastSmallSuccess('Unsubscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
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
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (err: any) {
			toastErrorHandling(err);
		}
	};

	const childProps = {
		subscribeHandler,
		unsubscribeHandler,
		likeMemberHandler,
		redirectToMemberPageHandler,
	};

	const renderContent = () => (
		<>
			{category === 'myProfile' && <MyProfile />}
			{category === 'myOrders' && <MyOrders />}
			{category === 'myArticles' && <MyArticles />}
			{category === 'writeArticle' && <WriteArticle />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'recentlyVisited' && <RecentlyVisited />}
			{category === 'followers' && <MemberFollowers {...childProps} />}
			{category === 'followings' && <MemberFollowings {...childProps} />}
		</>
	);

	// ── MOBILE ────────────────────────────────────────────────────────────────
	if (device === 'mobile') {
		return (
			<div id="my-page">
				<div className="mp-mob-header">
					<div className="mp-mob-header__avatar-wrap">
						{user?.memberImage ? (
							<img
								src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`}
								alt={user.memberNick}
								className="mp-mob-header__avatar"
							/>
						) : (
							<AccountCircleIcon className="mp-mob-header__avatar-icon" />
						)}
						<span className="mp-mob-header__online-dot" />
					</div>
					<div className="mp-mob-header__info">
						<span className="mp-mob-header__nick">{user?.memberNick ?? t('member')}</span>
						<span className="mp-mob-header__email">{user?.memberEmail ?? ''}</span>
					</div>
					{isAdmin && (
						<button className="mp-mob-header__admin-btn" onClick={() => router.push('/_admin')}>
							<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 14 }} />
							{t('adminPanel')}
						</button>
					)}
				</div>

				<nav className="mp-mob-nav">
					{FLAT_MENU.map((item) => (
						<button
							key={item.key}
							className={`mp-mob-nav__item${category === item.key ? ' active' : ''}`}
							onClick={() => navigate(item.key)}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</nav>

				<div className="mp-mob-content">{renderContent()}</div>
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────
	return (
		<div id="my-page">
			<div className="container">
				<div className="mp-layout">
					<aside className="mp-sidebar">
						<div className="mp-sidebar__profile">
							<div className="mp-sidebar__avatar-wrap">
								{user?.memberImage ? (
									<img
										src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`}
										alt={user.memberNick}
										className="mp-sidebar__avatar"
									/>
								) : (
									<AccountCircleIcon className="mp-sidebar__avatar-icon" />
								)}
								<span className="mp-sidebar__online-dot" />
							</div>
							<div className="mp-sidebar__user-info">
								<span className="mp-sidebar__nick">{user?.memberNick ?? t('member')}</span>
								<span className="mp-sidebar__email">{user?.memberEmail ?? ''}</span>
								{isAdmin && <span className="mp-sidebar__admin-badge">{t('administrator')}</span>}
							</div>
						</div>

						<div className="mp-sidebar__divider" />

						<nav className="mp-sidebar__nav">
							{MENU_ITEMS.map((group) => (
								<React.Fragment key={group.group}>
									<span className="mp-sidebar__nav-group">{group.group}</span>
									{group.items.map((item) => (
										<button
											key={item.key}
											className={`mp-sidebar__nav-item${category === item.key ? ' active' : ''}`}
											onClick={() => navigate(item.key)}
										>
											<span className="mp-sidebar__nav-icon">{item.icon}</span>
											<span className="mp-sidebar__nav-label">{item.label}</span>
										</button>
									))}
								</React.Fragment>
							))}
						</nav>

						{isAdmin && (
							<>
								<div className="mp-sidebar__divider" />
								<button className="mp-sidebar__admin-btn" onClick={() => router.push('/_admin')}>
									<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />
									<span> {t('adminPanel')} </span>
								</button>
							</>
						)}
					</aside>

					<main className="mp-main">{renderContent()}</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
