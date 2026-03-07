import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useCountdown, { TARGET } from '../../hooks/useCountdown';

// ── CountBox ──────────────────────────────────────────────
interface CountBoxProps {
	value: number;
	label: string;
}

const CountBox = ({ value, label }: CountBoxProps) => (
	<Box className="count-box">
		<span className="count-box__value">{String(value).padStart(2, '0')}</span>
		<span className="count-box__label">{label}</span>
	</Box>
);

// ── Main Component ────────────────────────────────────────
export default function PromoSection() {
	const device = useDeviceDetect();
	const { time, mounted } = useCountdown();
	const router = useRouter();

	const display = mounted ? time : TARGET;

	const pushAllProductsHandler = async () => {
		await router.push({ pathname: '/product' });
	};

	const heroContent = (
		<Box className="promo-hero">
			<Box className="promo-hero__left">
				<p className="promo-hero__eyebrow">Limited Time Only</p>
				<h2 className="promo-hero__heading">
					Sale Up To
					<br />
					40% Off
				</h2>
				<p className="promo-hero__subtext">
					Exceptional Products Meticulously Crafted with Unparalleled Expertise and Care
				</p>
				<button className="promo-hero__cta" onClick={() => pushAllProductsHandler()}>
					Shop Now <span className="promo-hero__cta-arrow">›</span>
				</button>
			</Box>

			<Box className="promo-hero__right">
				<img className="promo-hero__img" src="/img/banner/promoBanner.webp" alt="Timeless Fashion" />
				<Box className="promo-hero__overlay" />
				<Box className="promo-hero__img-text">
					<p className="promo-hero__img-title">Timeless Fashion Elevated</p>
					<p className="promo-hero__img-sub">Ready, Set, Go! Hurry Up and Score Amazing Discounts!</p>
				</Box>
			</Box>
		</Box>
	);

	const dealsContent = (
		<Box className="weekly-deals">
			<Box className="weekly-deals__left">
				<h2 className="weekly-deals__title">Weekly Deals</h2>
				<p className="weekly-deals__sub">This week only sale up to 25% off!</p>
			</Box>

			<Box className="weekly-deals__timer" suppressHydrationWarning>
				<CountBox value={display.days} label="Days" />
				<span className="timer-sep">:</span>
				<CountBox value={display.hours} label="Hours" />
				<span className="timer-sep">:</span>
				<CountBox value={display.mins} label="Mins" />
				<span className="timer-sep">:</span>
				<CountBox value={display.secs} label="Sec" />
			</Box>

			<button className="weekly-deals__cta" onClick={() => pushAllProductsHandler()}>
				Shop Our Collection
			</button>
		</Box>
	);

	if (device === 'mobile') {
		return (
			<Box className="promo-section">
				{heroContent}
				{dealsContent}
			</Box>
		);
	} else {
		return (
			<Box className="promo-section">
				{heroContent}
				{dealsContent}
			</Box>
		);
	}
}
