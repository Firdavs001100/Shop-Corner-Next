import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Follower } from '../../types/follow/follow';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { NEXT_PUBLIC_API_URL, Messages } from '../../config';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const MemberFollowers: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [total, setTotal] = useState<number>(0);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const {
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list ?? []);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	const subscribeHandler = async (id: string) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			toastSmallSuccess('Subscribed!', 800);
			await getMemberFollowersRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const unsubscribeHandler = async (id: string) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			toastSmallSuccess('Unsubscribed!', 800);
			await getMemberFollowersRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const likeMemberHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			toastSmallSuccess('Success', 800);
			await getMemberFollowersRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const redirectToMemberPage = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry((prev) => ({ ...prev, page: value }));
	};

	// u2500u2500 MOBILE u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500

	if (device === 'mobile') {
		return (
			<div className="mp-followers mp-followers--mobile">
				<div className="mp-page-bar">
					<h2 className="mp-page-bar__title">Followers</h2>
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
							const isMe = user?._id === follower?.followerId;
							const isFollowing = follower.meFollowed?.[0]?.myFollowing;
							const isLiked = follower.meLiked?.[0]?.myFavorite;

							return (
								<div className="mp-followers__card" key={follower._id}>
									<div className="mp-followers__card-left" onClick={() => redirectToMemberPage(follower?.followerData?._id)}>
										<div className="mp-followers__avatar-wrap">
											{imagePath
												? <img src={imagePath} alt={follower.followerData?.memberNick} className="mp-followers__avatar" />
												: <AccountCircleIcon className="mp-followers__avatar-icon" />
											}
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
										<button className="mp-followers__like-btn" onClick={() => likeMemberHandler(follower?.followerData?._id)}>
											{isLiked
												? <FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
												: <FavoriteBorderIcon sx={{ fontSize: 16 }} />
											}
											<span>{follower.followerData?.memberLikes ?? 0}</span>
										</button>
										{!isMe && (
											isFollowing ? (
												<button className="mp-followers__unfollow-btn" onClick={() => unsubscribeHandler(follower?.followerData?._id)}>
													Unfollow
												</button>
											) : (
												<button className="mp-followers__follow-btn" onClick={() => subscribeHandler(follower?.followerData?._id)}>
													<PersonAddAltOutlinedIcon sx={{ fontSize: 13 }} /> Follow
												</button>
											)
										)}
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

	// u2500u2500 DESKTOP u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500

	return (
		<div className="mp-followers">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Network</span>
					<h2 className="mp-page-bar__title">Followers</h2>
					<p className="mp-page-bar__sub">People who follow you</p>
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
						const isMe = user?._id === follower?.followerId;
						const isFollowing = follower.meFollowed?.[0]?.myFollowing;
						const isLiked = follower.meLiked?.[0]?.myFavorite;

						return (
							<div className="mp-followers__card" key={follower._id}>
								<div className="mp-followers__card-left" onClick={() => redirectToMemberPage(follower?.followerData?._id)}>
									<div className="mp-followers__avatar-wrap">
										{imagePath
											? <img src={imagePath} alt={follower.followerData?.memberNick} className="mp-followers__avatar" />
											: <AccountCircleIcon className="mp-followers__avatar-icon" />
										}
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
									<button className="mp-followers__like-btn" onClick={() => likeMemberHandler(follower?.followerData?._id)}>
										{isLiked
											? <FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
											: <FavoriteBorderIcon sx={{ fontSize: 16 }} />
										}
										<span>{follower.followerData?.memberLikes ?? 0}</span>
									</button>
									{!isMe && (
										isFollowing ? (
											<button className="mp-followers__unfollow-btn" onClick={() => unsubscribeHandler(follower?.followerData?._id)}>
												Unfollow
											</button>
										) : (
											<button className="mp-followers__follow-btn" onClick={() => subscribeHandler(follower?.followerData?._id)}>
												<PersonAddAltOutlinedIcon sx={{ fontSize: 13 }} /> Follow
											</button>
										)
									)}
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

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: { followingId: '' },
	},
};

export default MemberFollowers;