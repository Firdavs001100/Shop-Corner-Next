import React from 'react';
import TiptapEditor from '../community/TiptapEditor';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const WriteArticle = () => {
	const device = useDeviceDetect();
	if (device === 'mobile') {
		return (
			<div className="mp-write-article mp-write-article--mobile">
				<div className="mp-write-article__mob-header">
					<div className="mp-write-article__mob-header-left">
						<span className="mp-write-article__mob-eyebrow">Community</span>
						<h2 className="mp-write-article__mob-title">Write Article</h2>
						<p className="mp-write-article__mob-sub">Share your knowledge</p>
					</div>
				</div>
				<div className="mp-write-article__editor-wrap">
					<TiptapEditor />
				</div>
			</div>
		);
	}
	return (
		<div className="mp-write-article">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Community</span>
					<h2 className="mp-page-bar__title">Write Article</h2>
					<p className="mp-page-bar__sub">Share your knowledge with the community</p>
				</div>
			</div>
			<TiptapEditor />
		</div>
	);
};

export default WriteArticle;
