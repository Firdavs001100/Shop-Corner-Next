import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Join from '../../components/account/join';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// ─── Page config ──────────────────────────────────────────────────────────────

interface PageConfig {
	title: string;
	bgImage: string;
}

const PAGE_CONFIG: Record<string, PageConfig> = {
	'/product': { title: 'Shop', bgImage: '/img/banner/shop-hero2.jpg' },
	'/product/detail': { title: 'Product Detail', bgImage: '/img/banner/shop-hero.webp' },
	'/mypage': { title: 'My Page', bgImage: '/img/banner/header1.svg' },
	'/community': { title: 'Community', bgImage: '/img/community/header1.jpg' },
	'/community/detail': { title: 'Community', bgImage: '/img/community/header1.jpg' },
	'/cs': { title: 'Help Center', bgImage: '/img/banner/cs/banner1.svg' },
	'/member': { title: 'Member Page', bgImage: '/img/banner/header1.svg' },
};

const DEFAULT_BG = '/img/banner/header2.svg';

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

interface Crumb {
	label: string;
	href?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
	product: 'Shop',
	mypage: 'My Page',
	community: 'Community',
	cs: 'Help Center',
	member: 'Member',
	detail: 'Detail',
};

const buildCrumbs = (pathname: string, query: Record<string, any>, pageTitle: string): Crumb[] => {
	const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];
	const segments = pathname.split('/').filter(Boolean);

	segments.forEach((seg, idx) => {
		const isLast = idx === segments.length - 1;
		const href = '/' + segments.slice(0, idx + 1).join('/');

		if (/^[a-f0-9]{24}$/i.test(seg)) return;

		const label = isLast
			? pageTitle
			: SEGMENT_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

		crumbs.push(isLast ? { label } : { label, href });
	});

	if (query?.productName) crumbs.push({ label: decodeURIComponent(query.productName as string) });

	if (query?.articleTitle) crumbs.push({ label: decodeURIComponent(query.articleTitle as string) });

	return crumbs;
};

// ─── PageHero ────────────────────────────────────────────────────────────────

interface PageHeroProps {
	title: string;
	bgImage: string;
	pathname: string;
	query: Record<string, any>;
}

const PageHero = ({ title, bgImage, pathname, query }: PageHeroProps) => {
	const crumbs = buildCrumbs(pathname, query, title);

	return (
		<div className="page-hero" style={{ backgroundImage: `url(${bgImage})` }}>
			<div className="page-hero__overlay" />

			<div className="container">
				<div className="page-hero__content">
					<h1 className="page-hero__title">{title}</h1>

					<nav className="page-hero__breadcrumb" aria-label="Breadcrumb">
						{crumbs.map((crumb, i) => (
							<React.Fragment key={i}>
								{i > 0 && <ChevronRightIcon className="page-hero__sep" />}

								{crumb.href ? (
									<Link href={crumb.href} className="page-hero__link">
										{crumb.label}
									</Link>
								) : (
									<span className="page-hero__current">{crumb.label}</span>
								)}
							</React.Fragment>
						))}
					</nav>
				</div>
			</div>
		</div>
	);
};

// ─── Layout HOC ──────────────────────────────────────────────────────────────

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();

		const authMode = router.isReady && typeof router.query.auth === 'string' ? router.query.auth : undefined;

		const authOpen = authMode === 'login' || authMode === 'register';

		const { title, bgImage } = useMemo(() => {
			const config = PAGE_CONFIG[router.pathname];

			if (config) return config;

			const autoTitle = router.pathname
				.split('/')
				.filter(Boolean)
				.map((s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
				.join(' ');

			return { title: autoTitle, bgImage: DEFAULT_BG };
		}, [router.pathname]);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		// ───────── MOBILE ─────────

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

						<PageHero
							title={t(title)}
							bgImage={bgImage}
							pathname={router.pathname}
							query={router.query as Record<string, any>}
						/>

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

		// ───────── DESKTOP ─────────

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

					<PageHero
						title={t(title)}
						bgImage={bgImage}
						pathname={router.pathname}
						query={router.query as Record<string, any>}
					/>

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

export default withLayoutBasic;
