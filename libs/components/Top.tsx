import { useReactiveVar } from '@apollo/client';
import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { cartVar, userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import Basket from './Basket';
import { SearchIcon } from './icons/SearchIcon';
import { CartIcon } from './icons/CartIcon';
import { WishlistIcon } from './icons/WishlistIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
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
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const SLIDES = [
	{
		eyebrow: 'FASHION',
		heading: ['Making a Statement', 'Through Fashion'],
		subtext: "Fashion isn't just clothes, it's a statement.",
		cta: 'Shop The Collection',
		image: '/img/banner/main3.webp',
		align: 'left',
	},
	{
		eyebrow: 'NEW ARRIVALS',
		heading: ['Discover Your', 'Unique Style'],
		subtext: 'Explore the latest trends in contemporary fashion.',
		cta: 'Shop New Arrivals',
		image: '/img/banner/main2.webp',
		align: 'center',
	},
	{
		eyebrow: 'COLLECTION',
		heading: ['Elevate Every', 'Occasion'],
		subtext: 'Curated pieces for every moment in your life.',
		cta: 'View Collection',
		image: '/img/banner/main1.webp',
		align: 'right',
	},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const IconButton: React.FC<IconButtonProps> = ({ label, children, count, onClick }) => (
	<button className="toolbar__btn" aria-label={label} onClick={onClick}>
		{children}
		{count !== undefined && count > 0 && <span className="toolbar__badge">{count}</span>}
	</button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header() {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');

	const cart = useReactiveVar(cartVar);
	const user = useReactiveVar(userVar);

	const [activeSlide, setActiveSlide] = useState(0);
	const [isBasketOpen, setIsBasketOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const [colorChange, setColorChange] = useState(false);
	const [lang, setLang] = useState<string | null>('en');
	const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
	const langOpen = Boolean(langAnchor);
	const logoutOpen = Boolean(logoutAnchor);

	// ── Lifecycles ──

	useEffect(() => setIsClient(true), []);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const stored = localStorage.getItem('locale');
		setLang(stored ?? 'en');
		if (!stored) localStorage.setItem('locale', 'en');
	}, [router]);

	useEffect(() => {
		const handleScroll = () => setColorChange(window.scrollY >= window.innerHeight * 0.8);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// ── Auto-slide every 8s ──

	const goToNext = useCallback(() => setActiveSlide((i) => (i === SLIDES.length - 1 ? 0 : i + 1)), []);
	const goToPrev = () => setActiveSlide((i) => (i === 0 ? SLIDES.length - 1 : i - 1));

	useEffect(() => {
		const timer = setInterval(goToNext, 8000);
		return () => clearInterval(timer);
	}, [goToNext]);

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

	const { eyebrow, heading, subtext, cta, image, align } = SLIDES[activeSlide];

	const navItems = [
		{ label: t('Home'), href: '/' },
		{ label: t('Shop'), href: '/product' },
		{ label: t('Community'), href: '/community?articleCategory=FREE' },
		...(user?._id ? [{ label: t('My Page'), href: '/mypage' }] : []),
		{ label: t('CS'), href: '/cs' },
	];

	// ── Shared: Lang menu ──

	const langMenu = (
		<>
			<button className="toolbar__btn toolbar__btn--lang" onClick={langClick}>
				<img className="toolbar__flag-img" src={`/img/flag/lang${lang ?? 'en'}.png`} alt="language flag" />
				<CaretDown size={12} color="#616161" weight="fill" />
			</button>
			<StyledMenu anchorEl={langAnchor} open={langOpen} onClose={langClose}>
				<MenuItem disableRipple onClick={langChoice} id="en">
					<img src="/img/flag/langen.png" alt="English" />
					{t('English')}
				</MenuItem>
				<MenuItem disableRipple onClick={langChoice} id="kr">
					<img src="/img/flag/langkr.png" alt="Korean" />
					{t('Korean')}
				</MenuItem>
			</StyledMenu>
		</>
	);

	// ── Shared: User auth block ──

	const userAuth = (
		<>
			{user?._id ? (
				<>
					<button
						className="toolbar__btn toolbar__btn--avatar"
						onClick={(e) => setLogoutAnchor(e.currentTarget)}
						aria-label="Account menu"
					>
						<img
							className="toolbar__avatar"
							src={user.memberImage ? `${NEXT_PUBLIC_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
							alt="avatar"
						/>
					</button>
					<Menu anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
						<MenuItem onClick={() => logOut()}>
							<Logout fontSize="small" style={{ color: 'blue', marginRight: 10 }} />
							{t('Logout')}
						</MenuItem>
					</Menu>
				</>
			) : (
				<Link href="/account/join" className="toolbar__btn toolbar__btn--login" aria-label="Login / Register">
					<AccountCircleOutlinedIcon fontSize="small" />
				</Link>
			)}
		</>
	);

	// ── Shared: Hero ──

	const heroSection = (
		<section className="hero" aria-label="Featured collection">
			<div className="hero__backdrop" style={{ backgroundImage: `url(${image})` }} role="img" aria-label={eyebrow} />
			<div className="hero__overlay" />

			<div className={`hero__content hero__content--${align}`}>
				<span className="hero__eyebrow">{eyebrow}</span>
				<h1 className="hero__heading">
					{heading.map((line, i) => (
						<span key={i}>{line}</span>
					))}
				</h1>
				<p className="hero__subtext">{subtext}</p>
				<a href="/product" className="hero__cta">
					{cta}
				</a>
			</div>

			<div className="hero__dots">
				{SLIDES.map((_, i) => (
					<button
						key={i}
						className={`hero__dot${i === activeSlide ? ' hero__dot--active' : ''}`}
						onClick={() => setActiveSlide(i)}
						aria-label={`Go to slide ${i + 1}`}
					/>
				))}
			</div>

			<button className="slider-btn slider-btn--prev" onClick={goToPrev} aria-label="Previous slide">
				<ChevronLeftIcon />
			</button>
			<button className="slider-btn slider-btn--next" onClick={goToNext} aria-label="Next slide">
				<ChevronRightIcon />
			</button>
		</section>
	);

	// ─────────────────────────────────────────────────────────────────────────────
	// MOBILE
	// ─────────────────────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<>
				<div className={`site-header site-header--mobile${colorChange ? ' site-header--scrolled' : ''}`}>
					<div className="announcement-bar">Free shipping in orders over ₩200,000</div>

					<header className="navbar-mobile">
						<button
							className="navbar-mobile__menu-btn"
							onClick={() => setMobileMenuOpen((v) => !v)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>

						<a href="/" className="navbar-mobile__logo">
							SHOP.CO
						</a>

						<div className="navbar-mobile__actions">
							{user?._id && (
								<IconButton label="Notifications">
									<NotificationsOutlinedIcon fontSize="small" />
								</IconButton>
							)}
							<IconButton label="Cart" count={isClient ? cartCount : 0} onClick={() => setIsBasketOpen(true)}>
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

					{heroSection}
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
			<div className={`site-header${colorChange ? ' site-header--scrolled' : ''}`}>
				<div className="announcement-bar">Free shipping in orders over ₩200,000</div>

				<header className="navbar">
					<a href="/" className="navbar__logo">
						SHOP.CO
					</a>

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
						<IconButton label="Search">
							<SearchIcon />
						</IconButton>

						{user?._id && (
							<IconButton label="Notifications">
								<NotificationsOutlinedIcon fontSize="small" />
							</IconButton>
						)}

						{userAuth}
						{langMenu}

						<IconButton label="Wishlist" count={0}>
							<WishlistIcon />
						</IconButton>

						<IconButton label="Cart" count={isClient ? cartCount : 0} onClick={() => setIsBasketOpen(true)}>
							<CartIcon />
						</IconButton>
					</div>
				</header>

				{heroSection}
			</div>

			<Basket isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} />
		</>
	);
}
