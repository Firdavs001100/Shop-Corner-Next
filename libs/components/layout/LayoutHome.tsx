import React, { useState, useEffect, useCallback } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import Join from '../account/join';
import { Link, Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { useRouter } from 'next/router';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useTranslation } from 'next-i18next';

/* ───────────── Slides ───────────── */

const SLIDES = [
	{
		eyebrow: 'hero.fashion',
		heading: ['hero.statement1', 'hero.statement2'],
		subtext: 'hero.subtext1',
		cta: 'hero.cta1',
		image: '/img/banner/main3.webp',
		align: 'left',
	},
	{
		eyebrow: 'hero.newArrivals',
		heading: ['hero.unique1', 'hero.unique2'],
		subtext: 'hero.subtext2',
		cta: 'hero.cta2',
		image: '/img/banner/main2.webp',
		align: 'center',
	},
	{
		eyebrow: 'hero.collection',
		heading: ['hero.elevate1', 'hero.elevate2'],
		subtext: 'hero.subtext3',
		cta: 'hero.cta3',
		image: '/img/banner/main1.webp',
		align: 'right',
	},
];

/* ───────────── Hero Slider ───────────── */

const Hero = () => {
	const [activeSlide, setActiveSlide] = useState(0);
	const { t } = useTranslation('common');

	const goToNext = useCallback(() => {
		setActiveSlide((i) => (i === SLIDES.length - 1 ? 0 : i + 1));
	}, []);

	const goToPrev = () => {
		setActiveSlide((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
	};

	useEffect(() => {
		const timer = setInterval(goToNext, 8000);
		return () => clearInterval(timer);
	}, [goToNext]);

	const { eyebrow, heading, subtext, cta, image, align } = SLIDES[activeSlide];

	return (
		<section className="hero" aria-label="Featured collection">
			<div className="hero__backdrop" style={{ backgroundImage: `url(${image})` }} role="img" aria-label={eyebrow} />
			<div className="hero__overlay" />

			<div className={`hero__content hero__content--${align}`}>
				<span className="hero__eyebrow">{t(eyebrow)}</span>

				<h1 className="hero__heading">
					{heading.map((line, i) => (
						<span key={i}>{t(line)}</span>
					))}
				</h1>

				<p className="hero__subtext">{t(subtext)}</p>

				<a href="/product" className="hero__cta">
					{t(cta)}
				</a>
				{/* <Link href="/product" className="hero__cta">
					{t(cta)}
				</Link> */}
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
};

/* ───────────── Layout HOC ───────────── */

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const router = useRouter();
		const user = useReactiveVar(userVar);

		/* restore login session */
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/* detect auth modal */
		const authMode = router.isReady && typeof router.query.auth === 'string' ? router.query.auth : undefined;

		const authOpen = authMode === 'login' || authMode === 'register';

		/* ───────── MOBILE ───────── */

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>ShopCo</title>
						<meta name="title" content="ShopCo" />
					</Head>

					<Stack id="mobile-wrap">
						<Stack id="top">
							<Top />
						</Stack>

						<Hero />

						<Stack id="main">
							<Component {...props} />
						</Stack>

						<Stack id="footer">
							<Footer />
						</Stack>

						{/* AUTH MODAL */}
						{authOpen && <Join />}
					</Stack>
				</>
			);
		}

		/* ───────── DESKTOP ───────── */

		return (
			<>
				<Head>
					<title>ShopCo</title>
					<meta name="title" content="ShopCo" />
				</Head>

				<Stack id="pc-wrap">
					<Stack id="top">
						<Top />
					</Stack>

					<Hero />

					<Stack id="main">
						<Component {...props} />
					</Stack>

					<Stack id="footer">
						<Footer />
					</Stack>

					{/* AUTH MODAL */}
					{authOpen && <Join />}
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;
