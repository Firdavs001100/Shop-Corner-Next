import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import React, { useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { cartVar, userVar, wishlistCountVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import Basket from './Basket';
import { SearchIcon } from './icons/SearchIcon';
import { CartIcon } from './icons/CartIcon';
import { WishlistIcon } from './icons/WishlistIcon';
import { NEXT_PUBLIC_API_URL } from '../config';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Menu, MenuItem } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { MenuProps } from '@mui/material/Menu';
import { Logout } from '@mui/icons-material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { GET_FAVORITES, GET_NOTIFICATIONS } from '../../apollo/user/query';
import { MARK_NOTIFICATION_AS_READ, MARK_ALL_NOTIFICATIONS_AS_READ } from '../../apollo/user/mutation';
import { Notification } from '../types/notification/notification';
import { NotificationStatus } from '../enums/notification.enum';
import { toastLoginConfirm } from '../toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IconButtonProps {
	label: string;
	children: ReactNode;
	count?: number;
	onClick?: () => void;
}

// ─── Styled Menu ──────────────────────────────────────────────────────────────

const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		transformOrigin={{ vertical: 'top', horizontal: 'right' }}
		{...props}
	/>
))(({ theme }) => ({
	'& .MuiPaper-root': {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 160,
		color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
		boxShadow:
			'rgb(255,255,255) 0px 0px 0px 0px, rgba(0,0,0,0.05) 0px 0px 0px 1px, rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.05) 0px 4px 6px -2px',
		'& .MuiMenu-list': { padding: '4px 0' },
		'& .MuiMenuItem-root': {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			fontSize: '14px',
			'& img': {
				width: '20px',
				height: '14px',
				objectFit: 'cover',
				borderRadius: '2px',
				flexShrink: 0,
			},
			'&:active': {
				backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
			},
		},
	},
}));

// ─── Sub-components ───────────────────────────────────────────────────────────

const IconButton: React.FC<IconButtonProps> = ({ label, children, count, onClick }) => (
	<button className="toolbar__btn" aria-label={label} onClick={onClick}>
		{children}
		{count !== undefined && count > 0 && <span className="toolbar__badge">{count}</span>}
	</button>
);

const formatTime = (date: Date, t: any) => {
	const now = new Date();
	const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

	if (diff < 60) return t('justNow');
	if (diff < 3600) return t('minutesAgo', { count: Math.floor(diff / 60) });
	if (diff < 86400) return t('hoursAgo', { count: Math.floor(diff / 3600) });

	return t('daysAgo', { count: Math.floor(diff / 86400) });
};

const typeIcon = (type: string) => {
	switch (type) {
		case 'LIKE':
			return (
				<svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444" stroke="none">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
				</svg>
			);
		case 'COMMENT':
			return (
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#6366f1"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
			);
		case 'ORDER':
			return (
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#f59e0b"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<path d="M16 10a4 4 0 01-8 0" />
				</svg>
			);
		default:
			return (
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#94a3b8"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			);
	}
};

// ─── Notification Dropdown ────────────────────────────────────────────────────

interface NotifDropdownProps {
	t: any;
	notifications: Notification[];
	unreadCount: number;
	onMarkRead: (id: string) => void;
	onMarkAll: () => void;
	onClose: () => void;
}

const NotifDropdown: React.FC<NotifDropdownProps> = ({
	t,
	notifications,
	unreadCount,
	onMarkRead,
	onMarkAll,
	onClose,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) onClose();
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [onClose]);

	const handleItemClick = (n: Notification) => {
		if (n.notificationStatus === NotificationStatus.UNREAD) onMarkRead(n._id);
		setExpandedId((prev) => (prev === n._id ? null : n._id));
	};

	return (
		<div className="notif-dropdown" ref={ref}>
			<div className="notif-dropdown__header">
				<span className="notif-dropdown__title">
					{t('notifications')}
					{unreadCount > 0 && <span className="notif-dropdown__count">{unreadCount}</span>}
				</span>
				{unreadCount > 0 && (
					<button className="notif-dropdown__mark-all" onClick={onMarkAll}>
						{t('markAllRead')}
					</button>
				)}
			</div>

			<div className="notif-dropdown__list">
				{notifications.length === 0 ? (
					<div className="notif-dropdown__empty">
						<svg
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#cbd5e1"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
							<path d="M13.73 21a2 2 0 0 1-3.46 0" />
						</svg>
						<p>{t('noNotifications')}</p>
					</div>
				) : (
					notifications.map((n) => {
						const isExpanded = expandedId === n._id;
						return (
							<div
								key={n._id}
								className={`notif-item${
									n.notificationStatus === NotificationStatus.UNREAD ? ' notif-item--unread' : ''
								}`}
								onClick={() => handleItemClick(n)}
							>
								<div className="notif-item__icon-wrap">{typeIcon(n.notificationType)}</div>
								<div className="notif-item__body">
									<p className="notif-item__title">{n.notificationTitle}</p>
									{!isExpanded && n.notificationDesc && <p className="notif-item__desc">{n.notificationDesc}</p>}
									{isExpanded && <p className="notif-item__full-desc">{n.notificationDesc ?? t('noDetails')}</p>}
									<div className="notif-item__footer">
										<span className="notif-item__time">{formatTime(n.createdAt, t)}</span>
										{n.notificationDesc && (
											<span className="notif-item__expand">
												{isExpanded ? t('showLess') : t('showMore')}
												<svg
													className={`notif-item__chevron${isExpanded ? ' notif-item__chevron--open' : ''}`}
													width="10"
													height="10"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<polyline points="6 9 12 15 18 9" />
												</svg>
											</span>
										)}
									</div>
								</div>
								{n.notificationStatus === NotificationStatus.UNREAD && <span className="notif-item__dot" />}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header() {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');

	const cart = useReactiveVar(cartVar);
	const user = useReactiveVar(userVar);
	const wishlistCount = useReactiveVar(wishlistCountVar);

	const [isBasketOpen, setIsBasketOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [colorChange, setColorChange] = useState(false);
	const isHome = router.pathname === '/';
	const [lang, setLang] = useState<string | null>('en');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchText, setSearchText] = useState('');

	const searchRef = useRef<HTMLDivElement>(null);
	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
	const langOpen = Boolean(langAnchor);
	const logoutOpen = Boolean(logoutAnchor);
	const unreadCount = notifications.filter((n) => n.notificationStatus === NotificationStatus.UNREAD).length;

	// ── Queries & Mutations ──

	const { data: notifData, refetch: refetchNotifs } = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 20, search: {} } },
		skip: !user?._id,
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_AS_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

	useEffect(() => {
		if (!notifData) return;
		setNotifications(notifData?.getNotifications?.list ?? []);
	}, [notifData]);

	// ── Lifecycles ──

	useEffect(() => setIsClient(true), []);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem('locale');
		setLang(stored ?? 'en');
		if (!stored) localStorage.setItem('locale', 'en');
	}, [router]);

	const { data: favoritesData } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1 } },
		skip: !user?._id,
	});

	useEffect(() => {
		if (!favoritesData) return;
		wishlistCountVar(favoritesData?.getFavorites?.metaCounter?.[0]?.total ?? 0);
	}, [favoritesData]);

	useEffect(() => {
		const handleScroll = () => {
			const shouldChange = window.scrollY >= window.innerHeight * 0.8;
			setColorChange((prev) => (prev !== shouldChange ? shouldChange : prev));
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// ── Search outside click ──

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setSearchOpen(false);
				setSearchText('');
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	// ── Notification handlers ──

	const handleMarkRead = async (id: string) => {
		try {
			await markRead({ variables: { input: { _id: id, notificationStatus: NotificationStatus.READ } } });
			setNotifications((prev) =>
				prev.map((n) => (n._id === id ? { ...n, notificationStatus: NotificationStatus.READ } : n)),
			);
		} catch (err) {
			console.error(err);
		}
	};

	const handleMarkAll = async () => {
		try {
			await markAllRead({ variables: { input: { page: 1, limit: 100, search: {} } } });
			setNotifications((prev) => prev.map((n) => ({ ...n, notificationStatus: NotificationStatus.READ })));
		} catch (err) {
			console.error(err);
		}
	};

	// ── Search handler ──

	const handleSearch = () => {
		if (!searchText.trim()) return;
		router.push({ pathname: '/product', query: { text: searchText.trim() } });
		setSearchOpen(false);
		setSearchText('');
	};

	// ── Lang handlers ──

	const langClick = (e: React.MouseEvent<HTMLButtonElement>) => setLangAnchor(e.currentTarget);
	const langClose = () => setLangAnchor(null);

	const langChoice = useCallback(
		async (e: any) => {
			const chosen = e.currentTarget.id;
			setLang(chosen);
			localStorage.setItem('locale', chosen);
			setLangAnchor(null);
			await router.push(router.asPath, router.asPath, { locale: chosen });
		},
		[router],
	);

	const navItems = [
		{ label: t('home'), href: '/' },
		{ label: t('shop'), href: '/product' },
		{ label: t('community'), href: '/community' },
		...(user?._id ? [{ label: t('mypage'), href: '/mypage' }] : []),
		{ label: t('cs'), href: '/cs' },
	];

	// ── Favorites Handler ──

	const handleFavoritesClick = async () => {
		if (!user?._id) {
			const ok = await toastLoginConfirm('Please log in to view favorites');

			if (ok) {
				router.replace({
					pathname: router.pathname,
					query: { ...router.query, auth: 'login' },
				});
			}
			return;
		}

		router.push({
			pathname: '/mypage',
			query: { category: 'myFavorites' },
		});
	};

	// ── Lang menu ──

	const langMenu = (
		<>
			<button className="toolbar__btn toolbar__btn--lang" onClick={langClick}>
				<img className="toolbar__flag-img" src={`/img/flag/lang${lang ?? 'en'}.png`} alt="language flag" />
				<CaretDown size={12} color="#616161" weight="fill" />
			</button>
			<StyledMenu anchorEl={langAnchor} open={langOpen} onClose={langClose}>
				<MenuItem disableRipple onClick={langChoice} id="en">
					<img src="/img/flag/langen.png" alt="English" />
					{t('english')}
				</MenuItem>
				<MenuItem disableRipple onClick={langChoice} id="kr">
					<img src="/img/flag/langkr.png" alt="Korean" />
					{t('korean')}
				</MenuItem>
			</StyledMenu>
		</>
	);

	// ── User auth block ──

	const userAuth = (
		<>
			{user?._id ? (
				<>
					<button
						className="toolbar__btn toolbar__btn--avatar"
						onClick={(e) => setLogoutAnchor(e.currentTarget)}
						aria-label={t('accountMenu')}
					>
						{user.memberImage ? (
							<img className="toolbar__avatar" src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`} alt="avatar" />
						) : (
							<AccountCircleIcon sx={{ fontSize: 30, color: 'rgba(255,255,255,0.6)' }} />
						)}
					</button>
					<Menu anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
						<MenuItem onClick={() => logOut()}>
							<Logout fontSize="small" />
							{t('logout')}
						</MenuItem>
					</Menu>
				</>
			) : (
				<button
					type="button"
					className="toolbar__btn toolbar__btn--login"
					aria-label={t('loginRegister')}
					onClick={() =>
						router.push({ pathname: router.pathname, query: { ...router.query, auth: 'login' } }, undefined, {
							shallow: true,
						})
					}
				>
					<AccountCircleOutlinedIcon fontSize="small" />
				</button>
			)}
		</>
	);

	// ── Notification block ──

	const notifBlock = user?._id ? (
		<div className="notif-wrap">
			<button
				className="toolbar__btn"
				aria-label={t('notifications')}
				onClick={() => {
					setNotifOpen((v) => !v);
					if (!notifOpen) refetchNotifs();
				}}
			>
				<NotificationsOutlinedIcon fontSize="small" />
				{unreadCount > 0 && <span className="toolbar__badge">{unreadCount}</span>}
			</button>
			{notifOpen && (
				<NotifDropdown
					t={t}
					notifications={notifications}
					unreadCount={unreadCount}
					onMarkRead={handleMarkRead}
					onMarkAll={handleMarkAll}
					onClose={() => setNotifOpen(false)}
				/>
			)}
		</div>
	) : null;

	// ─────────────────────────────────────────────────────────────────────────────
	// MOBILE
	// ─────────────────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<>
				<div
					className={`site-header site-header--mobile${isHome ? ' site-header--overlay' : ''}${
						colorChange ? ' site-header--scrolled' : ''
					}`}
				>
					<div className="announcement-bar">{t('freeShipping')}</div>

					<header className="navbar-mobile">
						<button
							className="navbar-mobile__menu-btn"
							onClick={() => setMobileMenuOpen((v) => !v)}
							aria-label={t('toggleMenu')}
						>
							{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>

						<Link href="/" className="navbar-mobile__logo">
							SHOP.CO
						</Link>

						<div className="navbar-mobile__actions">
							{notifBlock}
							<IconButton label={t('cart')} count={isClient ? cartCount : 0} onClick={() => setIsBasketOpen(true)}>
								<CartIcon />
							</IconButton>
						</div>
					</header>

					{mobileMenuOpen && (
						<div className="mobile-drawer">
							<nav className="mobile-drawer__nav">
								<ul className="mobile-drawer__list">
									{navItems.map((item) => (
										<li key={item.label} className="mobile-drawer__item">
											<Link href={item.href} className="mobile-drawer__link" onClick={() => setMobileMenuOpen(false)}>
												<div>{item.label}</div>
											</Link>
										</li>
									))}
								</ul>
							</nav>
							<div className="mobile-drawer__footer">
								{userAuth}
								{langMenu}
							</div>
						</div>
					)}
				</div>

				<Basket isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} />
			</>
		);
	}

	// ─────────────────────────────────────────────────────────────────────────────
	// DESKTOP
	// ─────────────────────────────────────────────────────────────────────────────

	return (
		<>
			<div
				className={`site-header${isHome ? ' site-header--overlay' : ''}${colorChange ? ' site-header--scrolled' : ''}`}
			>
				<div className="announcement-bar">{t('freeShipping')}</div>

				<header className="navbar">
					<Link href="/" className="navbar__logo">
						SHOP.CO
					</Link>

					<nav className="nav" aria-label="Primary navigation">
						<ul className="nav__list">
							{navItems.map((item) => (
								<li className="nav__item" key={item.label}>
									<Link href={item.href} className="nav__link">
										<div>{item.label}</div>
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<div className="toolbar">
						{/* Search */}
						<div className={`search-wrap${searchOpen ? ' search-wrap--open' : ''}`} ref={searchRef}>
							{searchOpen ? (
								<div className="search-bar">
									<input
										className="search-bar__input"
										type="text"
										placeholder={t('searchPlaceholder')}
										value={searchText}
										onChange={(e) => setSearchText(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
										autoFocus
									/>
									<button className="search-bar__btn" onClick={handleSearch} aria-label="Submit search">
										<SearchIcon />
									</button>
									<button
										className="search-bar__close"
										onClick={() => {
											setSearchOpen(false);
											setSearchText('');
										}}
										aria-label="Close search"
									>
										<CloseIcon fontSize="small" />
									</button>
								</div>
							) : (
								<button className="toolbar__btn" aria-label={t('search')} onClick={() => setSearchOpen(true)}>
									<SearchIcon />
								</button>
							)}
						</div>

						{notifBlock}
						{userAuth}
						{langMenu}

						<IconButton label={t('wishlist')} count={wishlistCount} onClick={handleFavoritesClick}>
							<WishlistIcon />
						</IconButton>

						<IconButton label={t('cart')} count={isClient ? cartCount : 0} onClick={() => setIsBasketOpen(true)}>
							<CartIcon />
						</IconButton>
					</div>
				</header>
			</div>

			<Basket isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} />
		</>
	);
}
