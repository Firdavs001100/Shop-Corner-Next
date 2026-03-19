import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Pagination } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Following } from '../../types/follow/follow';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE, LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { NEXT_PUBLIC_API_URL, Messages } from '../../config';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const MemberFollowings: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [total, setTotal] = useState<number>(0);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);

	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { refetch: getMemberFollowingsRefetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followerId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowings(data?.getMemberFollowings?.list ?? []);
			setTotal(data?.getMemberFollowings?.metaCounter[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
	}, [router]);

	const subscribeHandler = async (id: string | undefined) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await subscribe({ variables: { input: id } });
			toastSmallSuccess('Subscribed!', 800);
			await getMemberFollowingsRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const unsubscribeHandler = async (id: string | undefined) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);
			await unsubscribe({ variables: { input: id } });
			toastSmallSuccess('Unsubscribed!', 800);
			await getMemberFollowingsRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const likeMemberHandler = async (id: string | undefined) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			toastSmallSuccess('Success', 800);
			await getMemberFollowingsRefetch({ input: followInquiry });
		} catch (err) {
			toastErrorHandling(err);
		}
	};

	const redirectToMemberPage = async (memberId: string | undefined) => {
		try {
			if (!memberId) return;
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
			<div className="mp-followings mp-followings--mobile">
				<div className="mp-page-bar">
					<h2 className="mp-page-bar__title">Followings</h2>
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
							const isMe = user?._id === following?.followingId;
							const isFollowing = following.meFollowed?.[0]?.myFollowing;
							const isLiked = following.meLiked?.[0]?.myFavorite;

							return (
								<div className="mp-followings__card" key={following._id}>
									<div className="mp-followings__card-left" onClick={() => redirectToMemberPage(following?.followingData?._id)}>
										<div className="mp-followings__avatar-wrap">
											{imagePath
												? <img src={imagePath} alt={following.followingData?.memberNick} className="mp-followings__avatar" />
												: <AccountCircleIcon className="mp-followings__avatar-icon" />
											}
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
										<button className="mp-followings__like-btn" onClick={() => likeMemberHandler(following?.followingData?._id)}>
											{isLiked
												? <FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
												: <FavoriteBorderIcon sx={{ fontSize: 16 }} />
											}
											<span>{following.followingData?.memberLikes ?? 0}</span>
										</button>
										{!isMe && (
											isFollowing ? (
												<button className="mp-followings__unfollow-btn" onClick={() => unsubscribeHandler(following?.followingData?._id)}>
													Unfollow
												</button>
											) : (
												<button className="mp-followings__follow-btn" onClick={() => subscribeHandler(following?.followingData?._id)}>
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

	// u2500u2500 DESKTOP u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500

	return (
		<div className="mp-followings">
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Network</span>
					<h2 className="mp-page-bar__title">Followings</h2>
					<p className="mp-page-bar__sub">People you follow</p>
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
						const isMe = user?._id === following?.followingId;
						const isFollowing = following.meFollowed?.[0]?.myFollowing;
						const isLiked = following.meLiked?.[0]?.myFavorite;

						return (
							<div className="mp-followings__card" key={following._id}>
								<div className="mp-followings__card-left" onClick={() => redirectToMemberPage(following?.followingData?._id)}>
									<div className="mp-followings__avatar-wrap">
										{imagePath
											? <img src={imagePath} alt={following.followingData?.memberNick} className="mp-followings__avatar" />
											: <AccountCircleIcon className="mp-followings__avatar-icon" />
										}
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
									<button className="mp-followings__like-btn" onClick={() => likeMemberHandler(following?.followingData?._id)}>
										{isLiked
											? <FavoriteIcon sx={{ fontSize: 16, color: '#e53935' }} />
											: <FavoriteBorderIcon sx={{ fontSize: 16 }} />
										}
										<span>{following.followingData?.memberLikes ?? 0}</span>
									</button>
									{!isMe && (
										isFollowing ? (
											<button className="mp-followings__unfollow-btn" onClick={() => unsubscribeHandler(following?.followingData?._id)}>
												Unfollow
											</button>
										) : (
											<button className="mp-followings__follow-btn" onClick={() => subscribeHandler(following?.followingData?._id)}>
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

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: { followerId: '' },
	},
};

export default MemberFollowings;