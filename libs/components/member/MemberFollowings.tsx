import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Following } from '../../types/follow/follow';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { NEXT_PUBLIC_API_URL } from '../../config';
import { T } from '../../types/common';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface MemberFollowingsProps {
	initialInput?: FollowInquiry;
	memberNick?: string;
	subscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	unsubscribeHandler: (id: string, refetch: any, query: any) => Promise<void>;
	likeMemberHandler: (id: string, refetch: any, query: any) => Promise<void>;
	redirectToMemberPageHandler: (id: string) => Promise<void>;
}

const MemberFollowings: NextPage<MemberFollowingsProps> = ({
	initialInput = {
		page: 1,
		limit: 5,
		search: { followerId: '' },
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
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);

	const { data: followingsData, refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!followingsData) return;
		setMemberFollowings(followingsData?.getMemberFollowings?.list ?? []);
		setTotal(followingsData?.getMemberFollowings?.metaCounter[0]?.total ?? 0);
	}, [followingsData]);

	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followerId: router.query.memberId as string },
			}));
		} else {
			setFollowInquiry((prev) => ({
				...prev,
				search: { followerId: user?._id },
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
			<div className="mp-followings mp-followings--mobile">
				<div className="mp-followings__mob-header">
					<div className="mp-followings__mob-header-left">
						{!isMemberPage && <span className="mp-followings__mob-eyebrow">Network</span>}
						<h2 className="mp-followings__mob-title">{ownerLabel ? `${ownerLabel} Followings` : 'Followings'}</h2>
						<p className="mp-followings__mob-sub">{isMemberPage ? 'Inspired by the best' : 'People you follow'}</p>
					</div>
					{total > 0 && <span className="mp-followings__mob-count">{total}</span>}
				</div>

				{memberFollowings.length === 0 ? (
					<div className="mp-followings__empty">
						<PersonAddAltOutlinedIcon />
						<p>Not following anyone yet</p>
					</div>
				) : (
					<div className="mp-followings__list">
						{memberFollowings.map((following: Following) => {
							const imagePath = following?.followingData?.memberImage
								? `${NEXT_PUBLIC_API_URL}/${following.followingData.memberImage}`
								: null;
							const isMe = !!user?._id && user._id === following?.followingId;
							const isFollowing = following.meFollowed?.[0]?.myFollowing;
							const isLiked = following.meLiked?.[0]?.myFavorite;

							return (
								<div className="mp-followings__card" key={following._id}>
									<div
										className="mp-followings__card-left"
										onClick={() => redirectToMemberPageHandler(following?.followingData?._id as string)}
									>
										<div className="mp-followings__avatar-wrap">
											{imagePath ? (
												<img
													src={imagePath}
													alt={following.followingData?.memberNick}
													className="mp-followings__avatar"
												/>
											) : (
												<AccountCircleIcon className="mp-followings__avatar-icon" />
											)}
										</div>
										<div className="mp-followings__info">
											<span className="mp-followings__nick">{following.followingData?.memberNick}</span>
											<div className="mp-followings__meta">
												<span>{following.followingData?.memberFollowers ?? 0} followers</span>
												<span className="mp-followings__dot" />
												<span>{following.followingData?.memberFollowings ?? 0} following</span>
											</div>
										</div>
									</div>
									<div className="mp-followings__card-right">
										<button
											className="mp-followings__like-btn"
											onClick={() =>
												likeMemberHandler(
													following?.followingData?._id as string,
													getMemberFollowingsRefetch,
													followInquiry,
												)
											}
										>
											{isLiked ? (
												<FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
											) : (
												<FavoriteBorderIcon sx={{ fontSize: 16 }} />
											)}
											<span>{following.followingData?.memberLikes ?? 0}</span>
										</button>
										{!isMe &&
											(isFollowing ? (
												<button
													className="mp-followings__unfollow-btn"
													onClick={() =>
														unsubscribeHandler(
															following?.followingData?._id as string,
															getMemberFollowingsRefetch,
															followInquiry,
														)
													}
												>
													Unfollow
												</button>
											) : (
												<button
													className="mp-followings__follow-btn"
													onClick={() =>
														subscribeHandler(
															following?.followingData?._id as string,
															getMemberFollowingsRefetch,
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

				{memberFollowings.length > 0 && (
					<div className="mp-followings__pagination">
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
		<div className="mp-followings">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					{!isMemberPage && <span className="mp-page-bar__eyebrow">Network</span>}
					<h2 className="mp-page-bar__title">{ownerLabel ? `${ownerLabel} Followings` : 'Followings'}</h2>
					{!isMemberPage && <p className="mp-page-bar__sub">People you follow</p>}
					{isMemberPage && <p className="mp-page-bar__sub">Inspired by the best</p>}
				</div>
				<div className="mp-page-bar__right">
					<div className="mp-page-bar__badge">
						<PersonAddAltOutlinedIcon sx={{ fontSize: 14 }} />
						{total}
					</div>
				</div>
			</div>

			{memberFollowings.length === 0 ? (
				<div className="mp-followings__empty">
					<PersonAddAltOutlinedIcon />
					<p>Not following anyone yet</p>
				</div>
			) : (
				<div className="mp-followings__list">
					{memberFollowings.map((following: Following) => {
						const imagePath = following?.followingData?.memberImage
							? `${NEXT_PUBLIC_API_URL}/${following.followingData.memberImage}`
							: null;
						const isMe = !!user?._id && user._id === following?.followingId;
						const isFollowing = following.meFollowed?.[0]?.myFollowing;
						const isLiked = following.meLiked?.[0]?.myFavorite;

						return (
							<div className="mp-followings__card" key={following._id}>
								<div
									className="mp-followings__card-left"
									onClick={() => redirectToMemberPageHandler(following?.followingData?._id as string)}
								>
									<div className="mp-followings__avatar-wrap">
										{imagePath ? (
											<img
												src={imagePath}
												alt={following.followingData?.memberNick}
												className="mp-followings__avatar"
											/>
										) : (
											<AccountCircleIcon className="mp-followings__avatar-icon" />
										)}
									</div>
									<div className="mp-followings__info">
										<span className="mp-followings__nick">{following.followingData?.memberNick}</span>
										<div className="mp-followings__meta">
											<span>{following.followingData?.memberFollowers ?? 0} followers</span>
											<span className="mp-followings__dot" />
											<span>{following.followingData?.memberFollowings ?? 0} following</span>
										</div>
									</div>
								</div>
								<div className="mp-followings__card-right">
									<button
										className="mp-followings__like-btn"
										onClick={() =>
											likeMemberHandler(
												following?.followingData?._id as string,
												getMemberFollowingsRefetch,
												followInquiry,
											)
										}
									>
										{isLiked ? (
											<FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 16 }} />
										)}
										<span>{following.followingData?.memberLikes ?? 0}</span>
									</button>
									{!isMe &&
										(isFollowing ? (
											<button
												className="mp-followings__unfollow-btn"
												onClick={() =>
													unsubscribeHandler(
														following?.followingData?._id as string,
														getMemberFollowingsRefetch,
														followInquiry,
													)
												}
											>
												Unfollow
											</button>
										) : (
											<button
												className="mp-followings__follow-btn"
												onClick={() =>
													subscribeHandler(
														following?.followingData?._id as string,
														getMemberFollowingsRefetch,
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

			{memberFollowings.length > 0 && (
				<div className="mp-followings__pagination">
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

export default MemberFollowings;
