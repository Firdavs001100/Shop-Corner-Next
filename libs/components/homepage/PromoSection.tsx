import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

// ── Countdown Timer ───────────────────────────────────────
const TARGET = { days: 341, hours: 16, mins: 12, secs: 39 };

function useCountdown() {
	const [time, setTime] = useState(TARGET);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const interval = setInterval(() => {
			setTime((prev) => {
				let { days, hours, mins, secs } = prev;
				secs--;
				if (secs < 0) {
					secs = 59;
					mins--;
				}
				if (mins < 0) {
					mins = 59;
					hours--;
				}
				if (hours < 0) {
					hours = 23;
					days--;
				}
				if (days < 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
				return { days, hours, mins, secs };
			});
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return { time, mounted };
}

// ── CountBox ──────────────────────────────────────────────
interface CountBoxProps {
	value: number;
	label: string;
}

const CountBox: React.FC<CountBoxProps> = ({ value, label }) => (
	<div className="count-box">
		<span className="count-box__value">{String(value).padStart(2, '0')}</span>
		<span className="count-box__label">{label}</span>
	</div>
);

// ── Main Component ────────────────────────────────────────
export default function PromoSection() {
	const { time, mounted } = useCountdown();
	const router = useRouter();

	// Use static TARGET values on server, live values on client
	const display = mounted ? time : TARGET;

	/** HANDLERS **/

	const pushAllProductsHandler = async () => {
		await router.push({ pathname: '/product' });
	};

	return (
		<div className="promo-section">
			{/* ── Hero Banner ── */}
			<div className="promo-hero">
				{/* Left */}
				<div className="promo-hero__left">
					<p className="promo-hero__eyebrow">Limited Time Only</p>
					<h2 className="promo-hero__heading">
						Sale Up To
						<br />
						40% Off
					</h2>
					<p className="promo-hero__subtext">
						Exceptional Products Meticulously Crafted with Unparalleled Expertise and Care
					</p>
					<a href="product" className="promo-hero__cta">
						Shop Now <span className="promo-hero__cta-arrow">›</span>
					</a>
				</div>

				{/* Right */}
				<div className="promo-hero__right">
					<img className="promo-hero__img" src="/img/banner/promoBanner.webp" alt="Timeless Fashion" />
					<div className="promo-hero__overlay" />
					<div className="promo-hero__img-text">
						<p className="promo-hero__img-title">Timeless Fashion Elevated</p>
						<p className="promo-hero__img-sub">Ready, Set, Go! Hurry Up and Score Amazing Discounts!</p>
					</div>
				</div>
			</div>

			{/* ── Weekly Deals ── */}
			<div className="weekly-deals">
				<div className="weekly-deals__left">
					<h2 className="weekly-deals__title">Weekly Deals</h2>
					<p className="weekly-deals__sub">This week only sale up to 25% off!</p>
				</div>

				<div className="weekly-deals__timer" suppressHydrationWarning>
					<CountBox value={display.days} label="Days" />
					<span className="timer-sep">:</span>
					<CountBox value={display.hours} label="Hours" />
					<span className="timer-sep">:</span>
					<CountBox value={display.mins} label="Mins" />
					<span className="timer-sep">:</span>
					<CountBox value={display.secs} label="Sec" />
				</div>

				<button className="weekly-deals__cta" onClick={() => pushAllProductsHandler()}>
					Shop Our Collection
				</button>
			</div>
		</div>
	);
}
