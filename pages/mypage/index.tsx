import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import MyOrders from '../../libs/components/mypage/MyOrders';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NEXT_PUBLIC_API_URL } from '../../libs/config';
import { MemberType } from '../../libs/enums/member.enum';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MENU_ITEMS = [
	{
		group: 'Account',
		items: [
			{ key: 'myProfile', label: 'My Profile', icon: <PersonOutlineIcon /> },
			{ key: 'myOrders', label: 'My Orders', icon: <ReceiptLongOutlinedIcon /> },
		],
	},
	{
		group: 'Content',
		items: [
			{ key: 'myArticles', label: 'My Articles', icon: <ArticleOutlinedIcon /> },
			{ key: 'writeArticle', label: 'Write Article', icon: <EditNoteOutlinedIcon /> },
		],
	},
	{
		group: 'Library',
		items: [
			{ key: 'myFavorites', label: 'Favorites', icon: <FavoriteBorderIcon /> },
			{ key: 'recentlyVisited', label: 'Recently Visited', icon: <HistoryOutlinedIcon /> },
		],
	},
	{
		group: 'Network',
		items: [
			{ key: 'followers', label: 'Followers', icon: <PeopleAltOutlinedIcon /> },
			{ key: 'followings', label: 'Followings', icon: <PersonAddAltOutlinedIcon /> },
		],
	},
];

const FLAT_MENU = MENU_ITEMS.flatMap((g) => g.items);

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category = (router.query?.category as string) ?? 'myProfile';
	const isAdmin = user?.memberType === MemberType.ADMIN;

	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	const navigate = (key: string) => {
		router.push({ pathname: '/mypage', query: { category: key } }, undefined, { shallow: true });
	};

	const renderContent = () => (
		<>
			{category === 'myProfile' && <MyProfile />}
			{category === 'myOrders' && <MyOrders />}
			{category === 'myArticles' && <MyArticles />}
			{category === 'writeArticle' && <WriteArticle />}
			{category === 'myFavorites' && <MyFavorites />}
			{category === 'recentlyVisited' && <RecentlyVisited />}
			{category === 'followers' && <MemberFollowers />}
			{category === 'followings' && <MemberFollowings />}
		</>
	);

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div id="my-page">
				{/* Profile header */}
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
						<span className="mp-mob-header__nick">{user?.memberNick ?? 'Member'}</span>
						<span className="mp-mob-header__email">{user?.memberEmail ?? ''}</span>
						{isAdmin && (
							<button className="mp-mob-header__admin-btn" onClick={() => router.push('/_admin')}>
								<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 14 }} />
								Admin Panel
							</button>
						)}
					</div>
				</div>

				{/* Horizontal tab nav */}
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

				{/* Page content */}
				<div className="mp-mob-content">{renderContent()}</div>
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div id="my-page">
			<div className="container">
				<div className="mp-layout">
					{/* ── SIDEBAR ── */}
					<aside className="mp-sidebar">
						{/* Profile card */}
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
								<span className="mp-sidebar__nick">{user?.memberNick ?? 'Member'}</span>
								<span className="mp-sidebar__email">{user?.memberEmail ?? ''}</span>
								{isAdmin && <span className="mp-sidebar__admin-badge">Administrator</span>}
							</div>
						</div>

						<div className="mp-sidebar__divider" />

						{/* Nav */}
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

						{/* Admin panel link */}
						{isAdmin && (
							<>
								<div className="mp-sidebar__divider" />
								<button className="mp-sidebar__admin-btn" onClick={() => router.push('/_admin')}>
									<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />
									<span>Admin Panel</span>
								</button>
							</>
						)}
					</aside>

					{/* ── MAIN ── */}
					<main className="mp-main">{renderContent()}</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
