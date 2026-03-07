import { useEffect, useState } from 'react';

// ── Countdown Timer ───────────────────────────────────────
export const TARGET = { days: 341, hours: 16, mins: 12, secs: 39 };

const useCountdown = () => {
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
};

export default useCountdown;
