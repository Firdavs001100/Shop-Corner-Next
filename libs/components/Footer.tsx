import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';

// ── Icons ─────────────────────────────────────────────────

const FacebookIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
	</svg>
);

const TwitterIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
	</svg>
);

const PinterestIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.44 7.64 11.17-.1-.97-.2-2.46.04-3.52.22-.95 1.47-6.26 1.47-6.26s-.37-.76-.37-1.88c0-1.76 1.02-3.08 2.29-3.08 1.08 0 1.6.81 1.6 1.78 0 1.09-.69 2.72-1.05 4.23-.3 1.26.62 2.29 1.85 2.29 2.22 0 3.72-2.87 3.72-6.26 0-2.58-1.75-4.39-4.25-4.39-2.9 0-4.6 2.17-4.6 4.41 0 .87.33 1.81.75 2.32.08.1.09.19.07.29-.08.31-.25.99-.28 1.13-.04.18-.14.22-.32.13-1.25-.58-2.03-2.42-2.03-3.89 0-3.15 2.29-6.05 6.61-6.05 3.47 0 6.16 2.47 6.16 5.78 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.96-.53-2.29-1.15l-.62 2.33c-.22.87-.83 1.96-1.24 2.62.93.29 1.93.44 2.95.44 6.63 0 12-5.37 12-12S18.63 0 12 0z" />
	</svg>
);

const TikTokIcon = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
	</svg>
);

const LocationIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);

const PhoneIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.64 12 19.79 19.79 0 0 1 1.58 3.47 2 2 0 0 1 3.55 1.29h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 5.55 5.55l.87-.87a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
	</svg>
);

const EmailIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
);

const MastercardIcon = () => (
	<svg className="payment-icon" width="40" height="26" viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg">
		<rect width="40" height="26" rx="4" fill="#fff" />
		<circle cx="15" cy="13" r="8" fill="#EB001B" />
		<circle cx="25" cy="13" r="8" fill="#F79E1B" />
		<path d="M20 6.8a8 8 0 0 1 0 12.4A8 8 0 0 1 20 6.8z" fill="#FF5F00" />
	</svg>
);

// ── Data ──────────────────────────────────────────────────

interface NavLink {
	label: string;
	href: string;
}

interface SocialLink {
	icon: ReactNode;
	label: string;
	href: string;
}

// ── Sub-components ────────────────────────────────────────

interface FooterNavColumnProps {
	title: string;
	links: NavLink[];
}

const FooterNavColumn: React.FC<FooterNavColumnProps> = ({ title, links }) => (
	<Box className="footer__col">
		<h4 className="footer__col-title">{title}</h4>
		<ul className="footer__nav-list">
			{links.map(({ label, href }) => (
				<li key={label}>
					<a href={href} className="footer__nav-link">
						{label}
					</a>
				</li>
			))}
		</ul>
	</Box>
);

const FooterBrand = ({ t, socialLinks }: any) => (
	<Box className="footer__col footer__col--brand">
		<div className="footer__logo">SHOP.CO</div>

		<Box className="footer__contact">
			<Box className="footer__contact-item">
				<LocationIcon />
				<span>{t('address')}</span>
			</Box>
			<Box className="footer__contact-item">
				<PhoneIcon />
				<span>{t('phone')}</span>
			</Box>
			<Box className="footer__contact-item">
				<EmailIcon />
				<span>{t('email')}</span>
			</Box>
		</Box>

		<Box className="footer__social">
			{socialLinks.map(({ icon, label, href }: any) => (
				<a key={label} href={href} className="footer__social-link" aria-label={label}>
					{icon}
				</a>
			))}
		</Box>
	</Box>
);

const FooterBottom = ({ t }: any) => (
	<Box className="footer__bottom">
		<p className="footer__copyright">{t('copyright')}</p>
		<Box className="footer__payments">
			<span className="footer__pay-badge footer__pay-badge--visa">VISA</span>
			<MastercardIcon />
			<span className="footer__pay-badge footer__pay-badge--amex">AMEX</span>
			<span className="footer__pay-badge footer__pay-badge--rupay">RuPay</span>
			<span className="footer__pay-badge footer__pay-badge--paypal">P</span>
		</Box>
	</Box>
);

// ── Main Component ────────────────────────────────────────

export default function Footer() {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const helpLinks: NavLink[] = [
		{ label: t('helpCenter'), href: '#' },
		{ label: t('trackOrder'), href: '#' },
		{ label: t('cancelOrder'), href: '#' },
		{ label: t('returnOrder'), href: '#' },
	];

	const categoryLinks: NavLink[] = [
		{ label: t('categoryJacket'), href: '#' },
		{ label: t('categoryPants'), href: '#' },
		{ label: t('categoryTshirt'), href: '#' },
		{ label: t('categoryBagShoes'), href: '#' },
	];

	const policyLinks: NavLink[] = [
		{ label: t('shippingDelivery'), href: '#' },
		{ label: t('returnsPolicy'), href: '#' },
		{ label: t('termsConditions'), href: '#' },
		{ label: t('privacyPolicy'), href: '#' },
	];

	const socialLinks: SocialLink[] = [
		{ icon: <FacebookIcon />, label: 'Facebook', href: '#' },
		{ icon: <TwitterIcon />, label: 'Twitter', href: '#' },
		{ icon: <PinterestIcon />, label: 'Pinterest', href: '#' },
		{ icon: <TikTokIcon />, label: 'TikTok', href: '#' },
	];

	const gridContent = (
		<Box className="footer__grid">
			<FooterBrand t={t} socialLinks={socialLinks} />
			<FooterNavColumn title={t('letUsHelp')} links={helpLinks} />
			<FooterNavColumn title={t('categories')} links={categoryLinks} />
			<FooterNavColumn title={t('ourPolicies')} links={policyLinks} />
		</Box>
	);

	if (device === 'mobile') {
		return (
			<footer className="footer">
				<Box className="footer__inner">
					{gridContent}
					<FooterBottom t={t} />
				</Box>
			</footer>
		);
	} else {
		return (
			<footer className="footer">
				<Box className="footer__inner">
					{gridContent}
					<FooterBottom t={t} />
				</Box>
			</footer>
		);
	}
}
