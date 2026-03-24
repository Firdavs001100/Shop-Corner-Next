import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Follower } from '../../types/follow/follow';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { T } from '../../types/common';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface MemberFollowersProps {
	initialInput?: FollowInquiry;
	memberNick?: string;
	subscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	unsubscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	likeMemberHandler: (id: string, refetch: any, query: any) => Promise<void>;
	redirectToMemberPageHandler: (id: string) => Promise<void>;
}

const MemberFollowers: NextPage<MemberFollowersProps> = ({
	initialInput = {
		page: 1,
		limit: 5,
		search: { followingId: '' },
	},
	memberNick = '',
	subscribeHandler,
	unsubscribeHandler,
	likeMemberHandler,
	redirectToMemberPageHandler,
}) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [total, setTotal] = useState<number>(0);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);

	const { data: followersData, refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!followersData) return;
		setMemberFollowers(followersData?.getMemberFollowers?.list ?? []);
		setTotal(followersData?.getMemberFollowers?.metaCounter[0]?.total ?? 0);
	}, [followersData]);

	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followingId: router.query.memberId as string },
			}));
		} else {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followingId: user?._id },
			}));
		}
	}, [router.query.memberId, user]);

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry((prev) => ({ ...prev, page: value }));
	};

	const isMemberPage = !!router.query.memberId;
	const ownerLabel = isMemberPage && memberNick ? `${memberNick}'s` : null;

	// ── MOBILE ──────────────────────────────────────────────────────────────

	if (device === 'mobile') {
		return (
			<div className="mp-followers mp-followers--mobile">
				<div className="mp-followers__mob-header">
					<div className="mp-followers__mob-header-left">
						{!isMemberPage && <span className="mp-followers__mob-eyebrow">Network</span>}
						<h2 className="mp-followers__mob-title">{ownerLabel ? `${ownerLabel} Followers` : 'Followers'}</h2>
						<p className="mp-followers__mob-sub">
							{isMemberPage ? 'Join the ones who believe in them' : 'People who follow you'}
						</p>
					</div>
					{total > 0 && <span className="mp-followers__mob-count">{total}</span>}
				</div>

				{memberFollowers.length === 0 ? (
					<div className="mp-followers__empty">
						<PeopleAltOutlinedIcon />
						<p>No followers yet</p>
					</div>
				) : (
					<div className="mp-followers__list">
						{memberFollowers.map((follower: Follower) => {
							const imagePath = follower?.followerData?.memberImage
								? `${NEXT_PUBLIC_API_URL}/${follower.followerData.memberImage}`
								: null;
							const isMe = !!user?._id && user._id === follower?.followerId;
							const isFollowing = follower.meFollowed?.[0]?.myFollowing;
							const isLiked = follower.meLiked?.[0]?.myFavorite;

							return (
								<div className="mp-followers__card" key={follower._id}>
									<div
										className="mp-followers__card-left"
										onClick={() => redirectToMemberPageHandler(follower?.followerData?._id as string)}
									>
										<div className="mp-followers__avatar-wrap">
											{imagePath ? (
												<img src={imagePath} alt={follower.followerData?.memberNick} className="mp-followers__avatar" />
											) : (
												<AccountCircleIcon className="mp-followers__avatar-icon" />
											)}
										</div>
										<div className="mp-followers__info">
											<span className="mp-followers__nick">{follower.followerData?.memberNick}</span>
											<div className="mp-followers__meta">
												<span>{follower.followerData?.memberFollowers ?? 0} followers</span>
												<span className="mp-followers__dot" />
												<span>{follower.followerData?.memberFollowings ?? 0} following</span>
											</div>
										</div>
									</div>
									<div className="mp-followers__card-right">
										<button
											className="mp-followers__like-btn"
											onClick={() =>
												likeMemberHandler(
													follower?.followerData?._id as string,
													getMemberFollowersRefetch,
													followInquiry,
												)
											}
										>
											{isLiked ? (
												<FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
											) : (
												<FavoriteBorderIcon sx={{ fontSize: 16 }} />
											)}
											<span>{follower.followerData?.memberLikes ?? 0}</span>
										</button>
										{!isMe &&
											(isFollowing ? (
												<button
													className="mp-followers__unfollow-btn"
													onClick={() =>
														unsubscribeHandler(
															follower?.followerData?._id as string,
															getMemberFollowersRefetch,
															followInquiry,
														)
													}
												>
													Unfollow
												</button>
											) : (
												<button
													className="mp-followers__follow-btn"
													onClick={() =>
														subscribeHandler(
															follower?.followerData?._id as string,
															getMemberFollowersRefetch,
															followInquiry,
														)
													}
												>
													<PersonAddAltOutlinedIcon sx={{ fontSize: 13 }} /> Follow
												</button>
											))}
									</div>
								</div>
							);
						})}
					</div>
				)}

				{memberFollowers.length > 0 && (
					<div className="mp-followers__pagination">
						<Pagination
							page={followInquiry.page}
							count={Math.ceil(total / followInquiry.limit)}
							onChange={paginationHandler}
							shape="rounded"
							size="small"
						/>
					</div>
				)}
			</div>
		);
	}

	// ── DESKTOP ──────────────────────────────────────────────────────────────

	return (
		<div className="mp-followers">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					{!isMemberPage && <span className="mp-page-bar__eyebrow">Network</span>}
					<h2 className="mp-page-bar__title">{ownerLabel ? `${ownerLabel} Followers` : 'Followers'}</h2>
					{!isMemberPage && <p className="mp-page-bar__sub">People who follow you</p>}
					{isMemberPage && <p className="mp-page-bar__sub">Join the ones who believe in them</p>}
				</div>
				<div className="mp-page-bar__right">
					<div className="mp-page-bar__badge">
						<PeopleAltOutlinedIcon sx={{ fontSize: 14 }} />
						{total}
					</div>
				</div>
			</div>

			{memberFollowers.length === 0 ? (
				<div className="mp-followers__empty">
					<PeopleAltOutlinedIcon />
					<p>No followers yet</p>
				</div>
			) : (
				<div className="mp-followers__list">
					{memberFollowers.map((follower: Follower) => {
						const imagePath = follower?.followerData?.memberImage
							? `${NEXT_PUBLIC_API_URL}/${follower.followerData.memberImage}`
							: null;
						const isMe = !!user?._id && user._id === follower?.followerId;
						const isFollowing = follower.meFollowed?.[0]?.myFollowing;
						const isLiked = follower.meLiked?.[0]?.myFavorite;

						return (
							<div className="mp-followers__card" key={follower._id}>
								<div
									className="mp-followers__card-left"
									onClick={() => redirectToMemberPageHandler(follower?.followerData?._id as string)}
								>
									<div className="mp-followers__avatar-wrap">
										{imagePath ? (
											<img src={imagePath} alt={follower.followerData?.memberNick} className="mp-followers__avatar" />
										) : (
											<AccountCircleIcon className="mp-followers__avatar-icon" />
										)}
									</div>
									<div className="mp-followers__info">
										<span className="mp-followers__nick">{follower.followerData?.memberNick}</span>
										<div className="mp-followers__meta">
											<span>{follower.followerData?.memberFollowers ?? 0} followers</span>
											<span className="mp-followers__dot" />
											<span>{follower.followerData?.memberFollowings ?? 0} following</span>
										</div>
									</div>
								</div>
								<div className="mp-followers__card-right">
									<button
										className="mp-followers__like-btn"
										onClick={() =>
											likeMemberHandler(follower?.followerData?._id as string, getMemberFollowersRefetch, followInquiry)
										}
									>
										{isLiked ? (
											<FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 16 }} />
										)}
										<span>{follower.followerData?.memberLikes ?? 0}</span>
									</button>
									{!isMe &&
										(isFollowing ? (
											<button
												className="mp-followers__unfollow-btn"
												onClick={() =>
													unsubscribeHandler(
														follower?.followerData?._id as string,
														getMemberFollowersRefetch,
														followInquiry,
													)
												}
											>
												Unfollow
											</button>
										) : (
											<button
												className="mp-followers__follow-btn"
												onClick={() =>
													subscribeHandler(
														follower?.followerData?._id as string,
														getMemberFollowersRefetch,
														followInquiry,
													)
												}
											>
												<PersonAddAltOutlinedIcon sx={{ fontSize: 13 }} /> Follow
											</button>
										))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{memberFollowers.length > 0 && (
				<div className="mp-followers__pagination">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="rounded"
						size="small"
					/>
				</div>
			)}
		</div>
	);
};

export default MemberFollowers;
