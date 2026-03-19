import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Notice } from '../../libs/types/notice/notice';
import { NoticeCategory } from '../../libs/enums/notice.enum';
import { GET_NOTICES } from '../../apollo/user/query';
import { CREATE_NOTICE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { toastSmallSuccess, toastErrorHandling } from '../../libs/toast';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconChevron = ({ open }: { open: boolean }) => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
	>
		<polyline points="6 9 12 15 18 9" />
	</svg>
);
const IconMail = () => (
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
		<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
		<polyline points="22,6 12,13 2,6" />
	</svg>
);
const IconPhone = () => (
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
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
	</svg>
);
const IconClock = () => (
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
		<circle cx="12" cy="12" r="10" />
		<polyline points="12 6 12 12 16 14" />
	</svg>
);
const IconMapPin = () => (
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
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);
const IconSearch = () => (
	<svg
		width="18"
		height="18"
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
const IconShield = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
	</svg>
);
const IconHelpCircle = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="10" />
		<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
		<line x1="12" y1="17" x2="12.01" y2="17" />
	</svg>
);
const IconHeadphones = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M3 18v-6a9 9 0 0 1 18 0v6" />
		<path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
	</svg>
);
const IconMessageSquare = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
);
const IconSend = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="22" y1="2" x2="11" y2="13" />
		<polygon points="22 2 15 22 11 13 2 9 22 2" />
	</svg>
);
const IconCalendar = () => (
	<svg
		width="13"
		height="13"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
		<line x1="16" y1="2" x2="16" y2="6" />
		<line x1="8" y1="2" x2="8" y2="6" />
		<line x1="3" y1="10" x2="21" y2="10" />
	</svg>
);
const IconInbox = () => (
	<svg
		width="36"
		height="36"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
		<path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
	</svg>
);

// ── FAQ Item ──────────────────────────────────────────────────────────────────

const FaqItem = ({ notice }: { notice: Notice }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className={`cs-faq__item ${open ? 'cs-faq__item--open' : ''}`}>
			<button className="cs-faq__question" onClick={() => setOpen((v) => !v)}>
				<span>{notice.noticeTitle}</span>
				<IconChevron open={open} />
			</button>
			{open && (
				<div className="cs-faq__answer">
					<p>{notice.noticeContent}</p>
				</div>
			)}
		</div>
	);
};

// ── Inquiry Item ──────────────────────────────────────────────────────────────

const InquiryItem = ({ notice }: { notice: Notice }) => {
	const [open, setOpen] = useState(false);
	const formatDate = (d: Date) =>
		new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

	return (
		<div className={`cs-inquiry__item ${open ? 'cs-inquiry__item--open' : ''}`}>
			<button className="cs-inquiry__header" onClick={() => setOpen((v) => !v)}>
				<div className="cs-inquiry__header-left">
					<span className="cs-inquiry__title">{notice.noticeTitle}</span>
					<span className="cs-inquiry__date">
						<IconCalendar />
						{formatDate(notice.createdAt)}
					</span>
				</div>
				<div className="cs-inquiry__header-right">
					<span className={`cs-inquiry__status cs-inquiry__status--${notice.noticeStatus.toLowerCase()}`}>
						{notice.noticeStatus === 'HOLD'
							? 'Pending'
							: notice.noticeStatus === 'ACTIVE'
							? 'Answered'
							: notice.noticeStatus}
					</span>
					<IconChevron open={open} />
				</div>
			</button>
			{open && (
				<div className="cs-inquiry__body">
					<p>{notice.noticeContent}</p>
				</div>
			)}
		</div>
	);
};

// ── Inquiry Section ───────────────────────────────────────────────────────────

interface InquirySectionProps {
	inquiries: Notice[];
	inquiryTitle: string;
	setInquiryTitle: (v: string) => void;
	inquiryContent: string;
	setInquiryContent: (v: string) => void;
	submitting: boolean;
	onSubmit: () => void;
	isLoggedIn: boolean;
}

const InquirySection = ({
	inquiries,
	inquiryTitle,
	setInquiryTitle,
	inquiryContent,
	setInquiryContent,
	submitting,
	onSubmit,
	isLoggedIn,
}: InquirySectionProps) => (
	<>
		<div className="cs-inquiry__form">
			<h4 className="cs-inquiry__form-title">Submit a New Inquiry</h4>
			<div className="cs-inquiry__form-fields">
				<input
					className="cs-inquiry__input"
					type="text"
					placeholder="Subject"
					value={inquiryTitle}
					onChange={(e) => setInquiryTitle(e.target.value)}
					maxLength={100}
				/>
				<textarea
					className="cs-inquiry__textarea"
					placeholder="Describe your issue or question in detail..."
					value={inquiryContent}
					onChange={(e) => setInquiryContent(e.target.value)}
					rows={4}
					maxLength={500}
				/>
				<div className="cs-inquiry__form-footer">
					<span className="cs-inquiry__char-count">{inquiryContent.length}/500</span>
					<button
						className="cs-inquiry__submit-btn"
						onClick={onSubmit}
						disabled={submitting || !inquiryTitle.trim() || !inquiryContent.trim() || !isLoggedIn}
					>
						<IconSend />
						{submitting ? 'Sending...' : 'Send Inquiry'}
					</button>
				</div>
				{!isLoggedIn && <p className="cs-inquiry__login-warn">⚠ Please log in to submit an inquiry.</p>}
			</div>
		</div>

		<div className="cs-inquiry__history">
			<h4 className="cs-inquiry__history-title">Previous Inquiries</h4>
			{inquiries.length > 0 ? (
				<div className="cs-inquiry__list">
					{inquiries.map((inq) => (
						<InquiryItem key={inq._id} notice={inq} />
					))}
				</div>
			) : (
				<div className="cs-inquiry__empty">
					<IconInbox />
					<p>No inquiries yet.</p>
				</div>
			)}
		</div>
	</>
);

// ── CS Page ───────────────────────────────────────────────────────────────────

const CsPage: NextPage = () => {
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const user = useReactiveVar(userVar);

	const [activeSection, setActiveSection] = useState<'faq' | 'terms' | 'inquiry' | 'contact'>('faq');
	const [faqSearch, setFaqSearch] = useState('');
	const [faqs, setFaqs] = useState<Notice[]>([]);
	const [terms, setTerms] = useState<Notice[]>([]);
	const [inquiries, setInquiries] = useState<Notice[]>([]);
	const [inquiryTitle, setInquiryTitle] = useState('');
	const [inquiryContent, setInquiryContent] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const { data: faqData } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: { noticeCategory: NoticeCategory.FAQ },
			},
		},
	});

	const { data: termsData } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: { noticeCategory: NoticeCategory.TERMS },
			},
		},
	});

	const { data: inquiryData, refetch: refetchInquiries } = useQuery(GET_NOTICES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 50,
				sort: 'createdAt',
				direction: 'DESC',
				search: { noticeCategory: NoticeCategory.INQUIRY },
			},
		},
		skip: activeSection !== 'inquiry',
	});

	const [createNotice] = useMutation(CREATE_NOTICE);

	useEffect(() => {
		if (faqData) setFaqs(faqData?.getNotices?.list ?? []);
	}, [faqData]);

	useEffect(() => {
		if (termsData) setTerms(termsData?.getNotices?.list ?? []);
	}, [termsData]);

	useEffect(() => {
		if (inquiryData) setInquiries(inquiryData?.getNotices?.list ?? []);
	}, [inquiryData]);

	const filteredFaqs = faqs.filter(
		(f) =>
			faqSearch === '' ||
			f.noticeTitle.toLowerCase().includes(faqSearch.toLowerCase()) ||
			f.noticeContent.toLowerCase().includes(faqSearch.toLowerCase()),
	);

	const handleSubmitInquiry = async () => {
		if (!inquiryTitle.trim() || !inquiryContent.trim()) return;
		setSubmitting(true);
		try {
			await createNotice({
				variables: {
					input: {
						noticeCategory: NoticeCategory.INQUIRY,
						noticeTitle: inquiryTitle.trim(),
						noticeContent: inquiryContent.trim(),
					},
				},
			});
			toastSmallSuccess('Inquiry submitted successfully!', 1200);
			setInquiryTitle('');
			setInquiryContent('');
			refetchInquiries();
		} catch (err: any) {
			toastErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

	const NAV_ITEMS = [
		{ key: 'faq' as const, label: 'FAQ', icon: <IconHelpCircle /> },
		{ key: 'terms' as const, label: 'Terms & Conditions', icon: <IconShield /> },
		{ key: 'inquiry' as const, label: 'My Inquiries', icon: <IconMessageSquare /> },
		{ key: 'contact' as const, label: 'Contact Us', icon: <IconHeadphones /> },
	];

	const CONTACT_ITEMS = [
		{
			icon: <IconMail />,
			label: 'Email Support',
			value: 'support@shopco.com',
			note: 'Response within 24 hours',
			href: 'mailto:support@shopco.com',
		},
		{
			icon: <IconPhone />,
			label: 'Phone Support',
			value: '+82-2-1234-5678',
			note: 'Mon–Fri, 9am–6pm KST',
			href: 'tel:+82-2-1234-5678',
		},
		{
			icon: <IconClock />,
			label: 'Business Hours',
			value: 'Monday – Friday',
			note: '9:00 AM – 6:00 PM KST',
			href: null,
		},
		{
			icon: <IconMapPin />,
			label: 'Office Address',
			value: 'Gangnam-gu, Seoul',
			note: 'South Korea',
			href: null,
		},
	];

	const inquirySectionProps: InquirySectionProps = {
		inquiries,
		inquiryTitle,
		setInquiryTitle,
		inquiryContent,
		setInquiryContent,
		submitting,
		onSubmit: handleSubmitInquiry,
		isLoggedIn: !!user?._id,
	};

	// ── MOBILE ────────────────────────────────────────────────────────────────

	if (isMobile) {
		return (
			<div id="cs-page" className="cs-page--mobile">
				<div className="cs-mob-tabs">
					{NAV_ITEMS.map((item) => (
						<button
							key={item.key}
							className={`cs-mob-tab ${activeSection === item.key ? 'cs-mob-tab--active' : ''}`}
							onClick={() => setActiveSection(item.key)}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>

				{activeSection === 'faq' && (
					<div className="cs-mob-section">
						<div className="cs-mob-section__header">
							<h2 className="cs-mob-section__title">Frequently Asked Questions</h2>
							<p className="cs-mob-section__sub">Find answers to common questions</p>
						</div>
						<div className="cs-search-wrap">
							<IconSearch />
							<input
								className="cs-search-input"
								type="text"
								placeholder="Search questions..."
								value={faqSearch}
								onChange={(e) => setFaqSearch(e.target.value)}
							/>
						</div>
						<div className="cs-faq__list">
							{filteredFaqs.length > 0 ? (
								filteredFaqs.map((f) => <FaqItem key={f._id} notice={f} />)
							) : (
								<div className="cs-empty">
									<p>{faqSearch ? 'No results found.' : 'No FAQs available yet.'}</p>
								</div>
							)}
						</div>
					</div>
				)}

				{activeSection === 'terms' && (
					<div className="cs-mob-section">
						<div className="cs-mob-section__header">
							<h2 className="cs-mob-section__title">Terms & Conditions</h2>
							<p className="cs-mob-section__sub">Please read our terms carefully</p>
						</div>
						<div className="cs-terms__list">
							{terms.length > 0 ? (
								terms.map((t) => (
									<div key={t._id} className="cs-terms__item">
										<h4 className="cs-terms__item-title">{t.noticeTitle}</h4>
										<p className="cs-terms__item-content">{t.noticeContent}</p>
									</div>
								))
							) : (
								<div className="cs-empty">
									<p>No terms available yet.</p>
								</div>
							)}
						</div>
					</div>
				)}

				{activeSection === 'inquiry' && (
					<div className="cs-mob-section">
						<div className="cs-mob-section__header">
							<h2 className="cs-mob-section__title">My Inquiries</h2>
							<p className="cs-mob-section__sub">Submit and track your inquiries</p>
						</div>
						<div className="cs-inquiry__mob-wrap">
							<InquirySection {...inquirySectionProps} />
						</div>
					</div>
				)}

				{activeSection === 'contact' && (
					<div className="cs-mob-section">
						<div className="cs-mob-section__header">
							<h2 className="cs-mob-section__title">Contact Us</h2>
							<p className="cs-mob-section__sub">We're here to help</p>
						</div>
						<div className="cs-contact__cards">
							{CONTACT_ITEMS.map((c) => (
								<div key={c.label} className="cs-contact__card">
									<div className="cs-contact__card-icon">{c.icon}</div>
									<div className="cs-contact__card-info">
										<span className="cs-contact__card-label">{c.label}</span>
										{c.href ? (
											<a href={c.href} className="cs-contact__card-value">
												{c.value}
											</a>
										) : (
											<span className="cs-contact__card-value">{c.value}</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		);
	}

	// ── DESKTOP ───────────────────────────────────────────────────────────────

	return (
		<div id="cs-page">
			<div className="container">
				<div className="cs-layout">
					<aside className="cs-sidebar">
						<div className="cs-sidebar__inner">
							<p className="cs-sidebar__eyebrow">Help Center</p>
							<h2 className="cs-sidebar__title">How can we help?</h2>
							<nav className="cs-sidebar__nav">
								{NAV_ITEMS.map((item) => (
									<button
										key={item.key}
										className={`cs-sidebar__nav-item ${
											activeSection === item.key ? 'cs-sidebar__nav-item--active' : ''
										}`}
										onClick={() => setActiveSection(item.key)}
									>
										<span className="cs-sidebar__nav-icon">{item.icon}</span>
										<span>{item.label}</span>
									</button>
								))}
							</nav>
							<div className="cs-sidebar__contact">
								<p className="cs-sidebar__contact-title">Still need help?</p>
								<a href="mailto:support@shopco.com" className="cs-sidebar__contact-link">
									<IconMail />
									support@shopco.com
								</a>
								<a href="tel:+82-2-1234-5678" className="cs-sidebar__contact-link">
									<IconPhone />
									+82-2-1234-5678
								</a>
								<div className="cs-sidebar__contact-link cs-sidebar__contact-link--plain">
									<IconClock />
									Mon–Fri · 9am–6pm KST
								</div>
							</div>
						</div>
					</aside>

					<main className="cs-main">
						{activeSection === 'faq' && (
							<div className="cs-section">
								<div className="cs-section__header">
									<div className="cs-section__header-icon">
										<IconHelpCircle />
									</div>
									<div>
										<h2 className="cs-section__title">Frequently Asked Questions</h2>
										<p className="cs-section__sub">Find quick answers to the most common questions</p>
									</div>
								</div>
								<div className="cs-search-wrap">
									<IconSearch />
									<input
										className="cs-search-input"
										type="text"
										placeholder="Search questions..."
										value={faqSearch}
										onChange={(e) => setFaqSearch(e.target.value)}
									/>
								</div>
								<div className="cs-faq__list">
									{filteredFaqs.length > 0 ? (
										filteredFaqs.map((f) => <FaqItem key={f._id} notice={f} />)
									) : (
										<div className="cs-empty">
											<p>{faqSearch ? `No results for "${faqSearch}"` : 'No FAQs available yet.'}</p>
										</div>
									)}
								</div>
							</div>
						)}

						{activeSection === 'terms' && (
							<div className="cs-section">
								<div className="cs-section__header">
									<div className="cs-section__header-icon">
										<IconShield />
									</div>
									<div>
										<h2 className="cs-section__title">Terms & Conditions</h2>
										<p className="cs-section__sub">Please read our terms and conditions carefully</p>
									</div>
								</div>
								<div className="cs-terms__list">
									{terms.length > 0 ? (
										terms.map((t) => (
											<div key={t._id} className="cs-terms__item">
												<h4 className="cs-terms__item-title">{t.noticeTitle}</h4>
												<p className="cs-terms__item-content">{t.noticeContent}</p>
											</div>
										))
									) : (
										<div className="cs-empty">
											<p>No terms available yet.</p>
										</div>
									)}
								</div>
							</div>
						)}

						{activeSection === 'inquiry' && (
							<div className="cs-section">
								<div className="cs-section__header">
									<div className="cs-section__header-icon">
										<IconMessageSquare />
									</div>
									<div>
										<h2 className="cs-section__title">My Inquiries</h2>
										<p className="cs-section__sub">Submit a question and track your previous inquiries</p>
									</div>
								</div>
								<InquirySection {...inquirySectionProps} />
							</div>
						)}

						{activeSection === 'contact' && (
							<div className="cs-section">
								<div className="cs-section__header">
									<div className="cs-section__header-icon">
										<IconHeadphones />
									</div>
									<div>
										<h2 className="cs-section__title">Contact Us</h2>
										<p className="cs-section__sub">Our support team is ready to help you</p>
									</div>
								</div>
								<div className="cs-contact__grid">
									{CONTACT_ITEMS.map((c) => (
										<div key={c.label} className="cs-contact__card">
											<div className="cs-contact__card-icon">{c.icon}</div>
											<div className="cs-contact__card-info">
												<span className="cs-contact__card-label">{c.label}</span>
												{c.href ? (
													<a href={c.href} className="cs-contact__card-value">
														{c.value}
													</a>
												) : (
													<span className="cs-contact__card-value">{c.value}</span>
												)}
												<span className="cs-contact__card-note">{c.note}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(CsPage);
