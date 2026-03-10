import React from 'react';
import { useRouter } from 'next/router';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { NEXT_PUBLIC_API_URL } from '../../../libs/config';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
	ALL: <GridViewIcon sx={{ fontSize: 16 }} />,
	QUESTION: <HelpOutlineIcon sx={{ fontSize: 16 }} />,
	REVIEW: <StarBorderIcon sx={{ fontSize: 16 }} />,
	DISCUSSION: <ForumOutlinedIcon sx={{ fontSize: 16 }} />,
	HELP: <SupportAgentOutlinedIcon sx={{ fontSize: 16 }} />,
	SHOWCASE: <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />,
};

const formatDate = (date: Date) =>
	new Date(date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase();

interface ArticleCardProps {
	article: BoardArticle;
	onLike: (e: React.MouseEvent, articleId: string) => void;
}

const ArticleCard = ({ article, onLike }: ArticleCardProps) => {
	const router = useRouter();
	const isLiked = Boolean(article.meLiked?.[0]?.myFavorite);

	const goToDetail = () => router.push({ pathname: '/community/detail', query: { id: article._id } });

	return (
		<article className="com-article-card">
			{/* Image */}
			{article.articleImage?.[0] && (
				<div className="com-article-card__img-wrap" onClick={goToDetail}>
					<img src={`${NEXT_PUBLIC_API_URL}/${article.articleImage[0]}`} alt={article.articleTitle} />
					<span className="com-article-card__category">
						<span className="com-article-card__category-icon">{CATEGORY_ICONS[article.articleCategory]}</span>
						{article.articleCategory}
					</span>
				</div>
			)}

			{/* Body */}
			<div className="com-article-card__body">
				<h2 className="com-article-card__title" onClick={goToDetail}>
					{article.articleTitle}
				</h2>

				{/* Like button */}
				<button
					className={`com-article-card__like-btn${isLiked ? ' liked' : ''}`}
					onClick={(e) => onLike(e, article._id)}
				>
					<span className="like-icon">
						{isLiked ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
					</span>
					<span>{article.articleLikes}</span>
				</button>

				{/* Meta */}
				<div className="com-article-card__meta">
					<span className="com-article-card__meta-item">
						<CalendarTodayIcon sx={{ fontSize: 12 }} />
						{formatDate(article.createdAt)}
					</span>
					<span className="com-article-card__meta-sep">|</span>
					<span className="com-article-card__meta-item">
						<PersonOutlineIcon sx={{ fontSize: 13 }} />
						{article.memberData?.memberNick ?? 'Anonymous'}
					</span>
					<span className="com-article-card__meta-sep">|</span>
					<span className="com-article-card__meta-item">
						<ChatBubbleOutlineIcon sx={{ fontSize: 12 }} />
						{article.articleComments} Comments
					</span>
					<span className="com-article-card__meta-sep">|</span>
					<span className="com-article-card__meta-item">
						<RemoveRedEyeIcon sx={{ fontSize: 12 }} />
						{article.articleViews}
					</span>
				</div>

				{/* Excerpt */}
				<p className="com-article-card__excerpt">
					{article.articleContent.length > 280 ? `${article.articleContent.slice(0, 280)}...` : article.articleContent}
				</p>

				{/* Footer */}
				<div className="com-article-card__footer">
					<button className="com-article-card__read-btn" onClick={goToDetail}>
						Read More
					</button>
					{article.memberData && (
						<div className="com-article-card__author">
							{article.memberData.memberImage && (
								<img
									src={`${NEXT_PUBLIC_API_URL}/${article.memberData.memberImage}`}
									alt={article.memberData.memberNick}
								/>
							)}
							<span>{article.memberData.memberNick}</span>
						</div>
					)}
				</div>
			</div>
		</article>
	);
};

export default ArticleCard;
