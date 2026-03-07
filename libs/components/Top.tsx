import { useReactiveVar } from '@apollo/client';
import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { cartVar } from '../../apollo/store';
import Basket from './Basket';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import { WishlistIcon } from './icons/WishlistIcon';
import { CartIcon } from './icons/CartIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

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
	onClick?: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemProps[] = [
	{ label: 'Home', href: '#', active: true, hasDropdown: true },
	{ label: 'Shop', href: '#', active: false, hasDropdown: true },
	{ label: 'Product', href: '#', active: false, hasDropdown: true },
	{ label: 'Pages', href: '#', active: false, hasDropdown: true },
	{ label: 'Blog', href: '#', active: false, hasDropdown: true },
];

// align: 'left' | 'center' | 'right'
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

const NavItem: React.FC<NavItemProps> = ({ label, href, active, hasDropdown }) => (
	<li className="nav__item">
		<a href={href} className={`nav__link${active ? ' nav__link--active' : ''}`}>
			{label}
			{hasDropdown && <ChevronDownIcon />}
		</a>
	</li>
);

const IconButton: React.FC<IconButtonProps> = ({ label, children, count, onClick }) => (
	<button className="toolbar__btn" aria-label={label} onClick={onClick}>
		{children}
		{count !== undefined && count > 0 && <span className="toolbar__badge">{count}</span>}
	</button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Header() {
	const [activeSlide, setActiveSlide] = useState(0);
	const [isBasketOpen, setIsBasketOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const cart = useReactiveVar(cartVar);
	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

	useEffect(() => setIsClient(true), []);

	const goToNext = useCallback(() => setActiveSlide((i) => (i === SLIDES.length - 1 ? 0 : i + 1)), []);

	const goToPrev = () => setActiveSlide((i) => (i === 0 ? SLIDES.length - 1 : i - 1));

	// Auto-advance every 8 seconds
	useEffect(() => {
		const timer = setInterval(goToNext, 8000);
		return () => clearInterval(timer);
	}, [goToNext]);

	const { eyebrow, heading, subtext, cta, image, align } = SLIDES[activeSlide];

	return (
		<>
			<div className="site-header">
				<div className="announcement-bar">Free shipping in orders over $50</div>

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
						<IconButton label="Cart" count={isClient ? cartCount : 0} onClick={() => setIsBasketOpen(true)}>
							<CartIcon />
						</IconButton>
					</div>
				</header>

				<section className="hero" aria-label="Featured collection">
					<div
						className="hero__backdrop"
						style={{ backgroundImage: `url(${image})` }}
						role="img"
						aria-label={eyebrow}
					/>
					<div className="hero__overlay" />

					{/* align class drives layout via CSS */}
					<div className={`hero__content hero__content--${align}`}>
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

					{/* Dot indicators */}
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
			</div>

			<Basket isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} />
		</>
	);
}
