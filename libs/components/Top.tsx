import React, { useState, ReactNode } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);

const UserIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const WishlistIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
	</svg>
);

const CartIcon = () => (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
		<line x1="3" y1="6" x2="21" y2="6" />
		<path d="M16 10a4 4 0 0 1-8 0" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);

const ChevronLeftIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="15 18 9 12 15 6" />
	</svg>
);

const ChevronRightIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemProps {
	label: string;
	href: string;
	active: boolean;
	hasDropdown: boolean;
}

interface IconButtonProps {
	label: string;
	children: ReactNode;
	count?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemProps[] = [
	{ label: 'Home', href: '#', active: true, hasDropdown: true },
	{ label: 'Shop', href: '#', active: false, hasDropdown: true },
	{ label: 'Product', href: '#', active: false, hasDropdown: true },
	{ label: 'Pages', href: '#', active: false, hasDropdown: true },
	{ label: 'Blog', href: '#', active: false, hasDropdown: true },
];

const SLIDES = [
	{
		eyebrow: 'FASHION',
		heading: ['Making a Statement', 'Through Fashion'],
		subtext: "Fashion isn't just clothes, it's a statement.",
		cta: 'Shop The Collection',
		image: '/img/banner/main3.webp',
	},
	{
		eyebrow: 'NEW ARRIVALS',
		heading: ['Discover Your', 'Unique Style'],
		subtext: 'Explore the latest trends in contemporary fashion.',
		cta: 'Shop New Arrivals',
		image: '/img/banner/main2.webp',
	},
	{
		eyebrow: 'COLLECTION',
		heading: ['Elevate Every', 'Occasion'],
		subtext: 'Curated pieces for every moment in your life.',
		cta: 'View Collection',
		image: '/img/banner/main1.webp',
	},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const NavItem: React.FC<NavItemProps> = ({ label, href, active, hasDropdown }) => (
	<li className="nav__item">
		<a href={href} className={`nav__link${active ? ' nav__link--active' : ''}`}>
			{label}
			{hasDropdown && <ChevronDownIcon />}
		</a>
	</li>
);

const IconButton: React.FC<IconButtonProps> = ({ label, children, count }) => (
	<button className="toolbar__btn" aria-label={label}>
		{children}
		{count !== undefined && <span className="toolbar__badge">{count}</span>}
	</button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header() {
	const [activeSlide, setActiveSlide] = useState(0);

	const goToPrev = () => setActiveSlide((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
	const goToNext = () => setActiveSlide((i) => (i === SLIDES.length - 1 ? 0 : i + 1));

	const { eyebrow, heading, subtext, cta, image } = SLIDES[activeSlide];

	return (
		<div className="site-header">
			{/* ── Announcement Bar ── */}
			<div className="announcement-bar">Free shipping in orders over $50</div>

			{/* ── Primary Navigation ── */}
			<header className="navbar">
				<a href="/" className="navbar__logo">
					SHOP.CO
				</a>

				<nav className="nav" aria-label="Primary navigation">
					<ul className="nav__list">
						{NAV_ITEMS.map((item) => (
							<NavItem key={item.label} {...item} />
						))}
					</ul>
				</nav>

				<div className="toolbar">
					<IconButton label="Search">
						<SearchIcon />
					</IconButton>
					<IconButton label="Account">
						<UserIcon />
					</IconButton>
					<IconButton label="Wishlist" count={0}>
						<WishlistIcon />
					</IconButton>
					<IconButton label="Cart" count={0}>
						<CartIcon />
					</IconButton>
				</div>
			</header>

			{/* ── Hero Slider ── */}
			<section className="hero" aria-label="Featured collection">
				<div className="hero__backdrop" style={{ backgroundImage: `url(${image})` }} role="img" aria-label={eyebrow} />
				<div className="hero__overlay" />

				<div className="hero__content">
					<span className="hero__eyebrow">{eyebrow}</span>
					<h1 className="hero__heading">
						{heading.map((line, i) => (
							<span key={i}>{line}</span>
						))}
					</h1>
					<p className="hero__subtext">{subtext}</p>
					<a href="#" className="hero__cta">
						{cta}
					</a>
				</div>

				<button className="slider-btn slider-btn--prev" onClick={goToPrev} aria-label="Previous slide">
					<ChevronLeftIcon />
				</button>
				<button className="slider-btn slider-btn--next" onClick={goToNext} aria-label="Next slide">
					<ChevronRightIcon />
				</button>
			</section>
		</div>
	);
}
