import React from 'react';
import { Comment } from '../../types/comment/comment';
import { NEXT_PUBLIC_API_URL } from '../../config';
import moment from 'moment';

interface ReviewProps {
	comment: Comment;
}

const Review = ({ comment }: ReviewProps) => {
	const memberImage = comment?.memberData?.memberImage
		? `${NEXT_PUBLIC_API_URL}/${comment.memberData.memberImage}`
		: '/img/profile/defaultUser.svg';

	const memberNick = comment?.memberData?.memberNick ?? 'Anonymous';
	const date = comment?.createdAt ? moment(comment.createdAt).format('MMM D, YYYY') : '';

	return (
		<div className="review-card">
			<div className="review-card__header">
				<img className="review-card__avatar" src={memberImage} alt={memberNick} />
				<div className="review-card__meta">
					<span className="review-card__name">{memberNick}</span>
					<span className="review-card__date">{date}</span>
				</div>
			</div>
			<p className="review-card__content">{comment?.commentContent}</p>
		</div>
	);
};

export default Review;
