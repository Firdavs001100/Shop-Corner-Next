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

// ─── Page config (USE KEYS, NOT TEXT) ─────────────────────────────────────────

interface PageConfig {
	title: string;
	bgImage: string;
}

const PAGE_CONFIG: Record<string, PageConfig> = {
	'/product': { title: 'shop', bgImage: '/img/banner/shop-hero2.jpg' },
	'/product/detail': { title: 'productDetail', bgImage: '/img/banner/shop-hero.webp' },
	'/mypage': { title: 'mypage', bgImage: '/img/banner/mypage2.jpg' },
	'/community': { title: 'community', bgImage: '/img/community/header1.jpg' },
	'/community/detail': { title: 'community', bgImage: '/img/community/header1.jpg' },
	'/cs': { title: 'cs', bgImage: '/img/banner/cs/banner1.jpg' },
	'/member': { title: 'memberPage', bgImage: '/img/banner/memberPage.jpg' },
	'/cart': { title: 'cart', bgImage: '/img/banner/shop-hero.webp' },
	'/checkout': { title: 'checkout', bgImage: '/img/banner/shop-hero.webp' },
};

const DEFAULT_BG = '/img/banner/shop-hero2.jpg';

// ─── Breadcrumb labels (KEYS) ────────────────────────────────────────────────

const SEGMENT_LABELS: Record<string, string> = {
	product: 'shop',
	mypage: 'mypage',
	community: 'community',
	cs: 'cs',
	member: 'member',
	detail: 'detail',
};

// ─── Breadcrumb builder ──────────────────────────────────────────────────────

interface Crumb {
	label: string;
	href?: string;
}

const buildCrumbs = (pathname: string, query: Record<string, any>, pageTitle: string, t: any): Crumb[] => {
	const crumbs: Crumb[] = [{ label: t('home'), href: '/' }];
	const segments = pathname.split('/').filter(Boolean);

	segments.forEach((seg, idx) => {
		const isLast = idx === segments.length - 1;
		const href = '/' + segments.slice(0, idx + 1).join('/');

		// skip mongo id
		if (/^[a-f0-9]{24}$/i.test(seg)) return;

		const key = SEGMENT_LABELS[seg];

		const label = isLast ? t(pageTitle, { defaultValue: pageTitle }) : t(key || seg, { defaultValue: seg });

		crumbs.push(isLast ? { label } : { label, href });
	});

	if (query?.productName) {
		crumbs.push({ label: decodeURIComponent(query.productName as string) });
	}

	if (query?.articleTitle) {
		crumbs.push({ label: decodeURIComponent(query.articleTitle as string) });
	}

	return crumbs;
};

// ─── PageHero ────────────────────────────────────────────────────────────────

interface PageHeroProps {
	title: string;
	bgImage: string;
	pathname: string;
	query: Record<string, any>;
	t: any;
}

const PageHero = React.memo(({ title, bgImage, pathname, query, t }: PageHeroProps) => {
	const crumbs = buildCrumbs(pathname, query, title, t);

	const translatedTitle = t(`${title}`, { defaultValue: title });

	return (
		<div className="page-hero" style={{ backgroundImage: `url(${bgImage})` }}>
			<div className="page-hero__overlay" />

			<div className="container">
				<div className="page-hero__content">
					<h1 className="page-hero__title">{translatedTitle}</h1>

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
});

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

			const autoKey = router.pathname.split('/').filter(Boolean).join('.');

			return { title: autoKey, bgImage: DEFAULT_BG };
		}, [router.pathname]);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		const pageTitle = t(`${title}`, { defaultValue: title });

		// ───────── MOBILE ─────────

		if (device === 'mobile') {
			return (
				<>
					<Head>
						<title>{pageTitle} | ShopCo</title>
						<meta name="title" content={`${pageTitle} | ShopCo`} />
					</Head>

					<Stack id="mobile-wrap">
						<Stack id="top">
							<Top />
						</Stack>

						<PageHero
							title={title}
							bgImage={bgImage}
							pathname={router.pathname}
							query={router.query as Record<string, any>}
							t={t}
						/>

						<Stack id="main">
							<Component {...props} />
						</Stack>

						<Stack id="footer">
							<Footer />
						</Stack>

						{authOpen && <Join />}
					</Stack>
				</>
			);
		}

		// ───────── DESKTOP ─────────

		return (
			<>
				<Head>
					<title>{pageTitle} | ShopCo</title>
					<meta name="title" content={`${pageTitle} | ShopCo`} />
				</Head>

				<Stack id="pc-wrap">
					<Stack id="top">
						<Top />
					</Stack>

					<PageHero
						title={title}
						bgImage={bgImage}
						pathname={router.pathname}
						query={router.query as Record<string, any>}
						t={t}
					/>

					<Stack id="main">
						<Component {...props} />
					</Stack>

					<Stack id="footer">
						<Footer />
					</Stack>

					{authOpen && <Join />}
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;
