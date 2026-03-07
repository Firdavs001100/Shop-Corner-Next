import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const SLIDES = ['/img/story/st2.avif', '/img/story/st3.avif', '/img/story/st1.avif'];

const StorySection = () => {
	const router = useRouter();
	const [index, setIndex] = useState(0);
	const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
	const next = () => setIndex((i) => (i + 1) % SLIDES.length);

	return (
		<div className="container">
			<div className="story-section">
				{/* Left — text */}
				<div className="story-section__left">
					<span className="story-section__eyebrow">STORY</span>
					<h2 className="story-section__title">We Will Give You The Best</h2>
					<p className="story-section__desc">
						Exceptional Products Meticulously Crafted with Unparalleled Expertise and Care
					</p>
					<button className="story-section__cta" onClick={() => router.push('/product')}>
						Shop Now
					</button>
				</div>

				{/* Right — image slider */}
				<div className="story-section__right">
					<div className="story-section__img-wrap">
						<img src={SLIDES[index]} alt="Story" className="story-section__img" />
					</div>

					<button className="story-section__nav story-section__nav--prev" onClick={prev} aria-label="Previous">
						<ChevronLeftIcon />
					</button>
					<button className="story-section__nav story-section__nav--next" onClick={next} aria-label="Next">
						<ChevronRightIcon />
					</button>
				</div>
			</div>
		</div>
	);
};

export default StorySection;
