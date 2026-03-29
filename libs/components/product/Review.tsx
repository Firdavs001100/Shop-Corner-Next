import React from 'react';
import { Comment } from '../../types/comment/comment';
import { NEXT_PUBLIC_API_URL } from '../../config';
import moment from 'moment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface ReviewProps {
	comment: Comment;
}

const Review = ({ comment }: ReviewProps) => {
	const memberImage = comment?.memberData?.memberImage?.trim()
		? `${NEXT_PUBLIC_API_URL}/${comment.memberData.memberImage}`
		: null;

	const memberNick = comment?.memberData?.memberNick ?? 'Anonymous';
	const date = comment?.createdAt ? moment(comment.createdAt).format('MMM D, YYYY') : '';
	const rating = comment?.commentRating ?? 0;

	return (
		<div className="review-card">
			<div className="review-card__header">
				<div className="review-card__avatar">
					{memberImage ? <img src={memberImage} alt={memberNick} /> : <AccountCircleIcon />}
				</div>
				<div className="review-card__meta">
					<div className="review-card__meta-top">
						<span className="review-card__name">{memberNick}</span>
						{rating > 0 && (
							<div className="review-card__stars">
								{[1, 2, 3, 4, 5].map((s) => (
									<span key={s} className={`review-card__star${s <= rating ? ' review-card__star--filled' : ''}`}>
										★
									</span>
								))}
							</div>
						)}
					</div>
					<span className="review-card__date">{date}</span>
				</div>
			</div>
			<p className="review-card__content">{comment?.commentContent}</p>
		</div>
	);
};

export default Review;
