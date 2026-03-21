import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import axios from 'axios';
import { Messages, NEXT_PUBLIC_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { toastErrorHandling, toastSmallSuccess } from '../../toast';
import parsePhoneNumber from 'libphonenumber-js';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

type Tab = 'info' | 'security';

const FIELDS = [
	{
		label: 'Username',
		key: 'memberNick',
		icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
		placeholder: 'Your username',
	},
	{
		label: 'Full Name',
		key: 'memberFullName',
		icon: <BadgeOutlinedIcon sx={{ fontSize: 16 }} />,
		placeholder: 'Your full name',
	},
	{
		label: 'Phone',
		key: 'memberPhone',
		icon: <PhoneOutlinedIcon sx={{ fontSize: 16 }} />,
		placeholder: 'Your phone number',
	},
	{
		label: 'Address',
		key: 'memberAddress',
		icon: <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />,
		placeholder: 'Your address',
	},
];

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	const [activeTab, setActiveTab] = useState<Tab>('info');
	const [editing, setEditing] = useState(false);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);
	const [previewImage, setPreviewImage] = useState<string>('');
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	const formatKRPhone = (value: string) => {
		const digits = value.replace(/\D/g, '');
		try {
			const phone = parsePhoneNumber(digits, 'KR');
			return phone ? phone.formatNational() : digits;
		} catch {
			return digits;
		}
	};

	const [updateMember] = useMutation(UPDATE_MEMBER);

	useEffect(() => {
		setUpdateData({
			_id: user._id,
			memberNick: user.memberNick ?? '',
			memberPhone: user.memberPhone ?? '',
			memberAddress: user.memberAddress ?? '',
			memberDesc: user.memberDesc ?? '',
			memberFullName: user.memberFullName ?? '',
			memberImage: user.memberImage ?? '',
		});
		setPreviewImage(user.memberImage ? `${NEXT_PUBLIC_API_URL}/${user.memberImage}` : '');
	}, [user]);

	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			if (!image) return;
			setUploading(true);
			const reader = new FileReader();
			reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
			reader.readAsDataURL(image);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
					variables: { file: null, target: 'member' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);
			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});
			const responseImage = response.data.data.imageUploader;
			const saveData: MemberUpdate = {
				_id: user._id,
				memberNick: user.memberNick,
				memberPhone: user.memberPhone,
				memberAddress: user.memberAddress,
				memberDesc: user.memberDesc,
				memberFullName: user.memberFullName,
				memberImage: responseImage,
			};
			const result = await updateMember({ variables: { input: saveData } });
			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));
			toastSmallSuccess('Photo updated!', 1000);
		} catch (err) {
			toastErrorHandling(err);
		} finally {
			setUploading(false);
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			setSaving(true);
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			updateData.memberPhone = updateData.memberPhone?.replace(/\D/g, '');
			const result = await updateMember({ variables: { input: updateData } });
			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			toastSmallSuccess('Profile updated!', 1000);
			setEditing(false);
		} catch (err) {
			toastErrorHandling(err);
		} finally {
			setSaving(false);
		}
	}, [updateData]);

	const updatePasswordHandler = async () => {
		if (!currentPassword.trim()) {
			toastErrorHandling({ message: 'Please enter your current password' });
			return;
		}
		if (!newPassword.trim() || newPassword !== confirmPassword) {
			toastErrorHandling({ message: "Passwords don't match" });
			return;
		}
		try {
			setSavingPassword(true);
			const result = await updateMember({
				variables: {
					input: { _id: user._id, memberPassword: currentPassword, memberNewPassword: newPassword },
				},
			});
			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			toastSmallSuccess('Password updated successfully!', 1000);
		} catch (err) {
			toastErrorHandling(err);
		} finally {
			setSavingPassword(false);
		}
	};

	const cancelEdit = () => {
		setUpdateData({
			_id: user._id,
			memberNick: user.memberNick ?? '',
			memberPhone: user.memberPhone ?? '',
			memberAddress: user.memberAddress ?? '',
			memberDesc: user.memberDesc ?? '',
			memberFullName: user.memberFullName ?? '',
			memberImage: user.memberImage ?? '',
		});
		setPreviewImage(user.memberImage ? `${NEXT_PUBLIC_API_URL}/${user.memberImage}` : '');
		setEditing(false);
	};

	const isDisabled =
		saving || !updateData.memberNick?.trim() || !updateData.memberPhone?.trim() || !updateData.memberAddress?.trim();
	const isPasswordDisabled =
		savingPassword || !currentPassword.trim() || !newPassword.trim() || newPassword !== confirmPassword;

	const STATS = [
		{ icon: <ArticleOutlinedIcon />, label: 'Articles', value: user.memberArticles ?? 0 },
		{ icon: <FavoriteBorderIcon />, label: 'Likes', value: user.memberLikes ?? 0 },
		{ icon: <RemoveRedEyeOutlinedIcon />, label: 'Views', value: user.memberViews ?? 0 },
		{ icon: <EmojiEventsOutlinedIcon />, label: 'Points', value: user.memberPoints ?? 0 },
	];

	// u2500u2500 MOBILE u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500

	if (device === 'mobile') {
		return (
			<div className="mp-profile mp-profile--mobile">
				{/* Page bar */}
				<div className="mp-page-bar">
					<div className="mp-page-bar__left">
						<span className="mp-page-bar__eyebrow">Account</span>
						<h2 className="mp-page-bar__title">My Profile</h2>
					</div>
				</div>

				{/* Hero */}
				<div className="mp-profile__mob-hero">
					<div className="mp-profile__mob-identity">
						<div className="mp-profile__avatar-wrap">
							{previewImage ? (
								<img src={previewImage} alt={user.memberNick} className="mp-profile__avatar" />
							) : (
								<AccountCircleIcon className="mp-profile__avatar-icon" />
							)}
							<label
								htmlFor="mob-upload"
								className={`mp-profile__camera${uploading ? ' mp-profile__camera--busy' : ''}`}
							>
								<CameraAltOutlinedIcon sx={{ fontSize: 13 }} />
							</label>
							<input
								id="mob-upload"
								type="file"
								hidden
								accept="image/jpg,image/jpeg,image/png"
								onChange={uploadImage}
							/>
						</div>
						<div className="mp-profile__mob-identity-info">
							<h2 className="mp-profile__display-name">{user.memberFullName || user.memberNick}</h2>
							<span className="mp-profile__username">@{user.memberNick}</span>
							<span className="mp-profile__type-chip">{user.memberType}</span>
						</div>
					</div>

					{/* Stats inline in hero */}
					<div className="mp-profile__stats-strip">
						{STATS.map((s) => (
							<div key={s.label} className="mp-profile__stat-pill">
								{s.icon}
								<strong>{s.value}</strong>
								<span>{s.label}</span>
							</div>
						))}
					</div>
				</div>

				{/* Tabs */}
				<div className="mp-profile__tabs">
					<button
						className={`mp-profile__tab${activeTab === 'info' ? ' active' : ''}`}
						onClick={() => {
							setActiveTab('info');
							setEditing(false);
						}}
					>
						<PersonOutlineIcon sx={{ fontSize: 15 }} /> Personal Info
					</button>
					<button
						className={`mp-profile__tab${activeTab === 'security' ? ' active' : ''}`}
						onClick={() => {
							setActiveTab('security');
							setEditing(false);
						}}
					>
						<LockOutlinedIcon sx={{ fontSize: 15 }} /> Security
					</button>
				</div>

				{activeTab === 'info' && (
					<div className="mp-profile__section">
						<div className="mp-profile__section-head">
							<span className="mp-profile__section-title">Personal Info</span>
							{!editing ? (
								<button className="mp-profile__ghost-btn" onClick={() => setEditing(true)}>
									<EditOutlinedIcon sx={{ fontSize: 13 }} /> Edit
								</button>
							) : (
								<div className="mp-profile__inline-actions">
									<button className="mp-profile__inline-cancel" onClick={cancelEdit}>
										Cancel
									</button>
									<button className="mp-profile__inline-save" onClick={updateProfileHandler} disabled={isDisabled}>
										{saving ? 'Saving...' : 'Save'}
									</button>
								</div>
							)}
						</div>
						<div className="mp-profile__form">
							{FIELDS.map((f) => (
								<div key={f.key} className="mp-profile__field">
									<label>{f.label}</label>
									<div className={`mp-profile__input-wrap${!editing ? ' mp-profile__input-wrap--readonly' : ''}`}>
										{f.icon}
										<input
											type="text"
											placeholder={f.placeholder}
											value={
												f.key === 'memberPhone'
													? formatKRPhone((editing ? updateData : (user as any))[f.key] ?? '')
													: (editing ? updateData : (user as any))[f.key] ?? ''
											}
											readOnly={!editing}
											onChange={({ target: { value } }) =>
												setUpdateData((prev) => ({
													...prev,
													[f.key]: f.key === 'memberPhone' ? formatKRPhone(value) : value,
												}))
											}
										/>
									</div>
								</div>
							))}
							<div className="mp-profile__field">
								<label>About Me</label>
								<div
									className={`mp-profile__input-wrap mp-profile__input-wrap--textarea${
										!editing ? ' mp-profile__input-wrap--readonly' : ''
									}`}
								>
									<NotesOutlinedIcon sx={{ fontSize: 16 }} />
									<textarea
										placeholder="Tell us about yourself..."
										value={(editing ? updateData.memberDesc : user.memberDesc) ?? ''}
										rows={3}
										readOnly={!editing}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberDesc: value }))}
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'security' && (
					<div className="mp-profile__section">
						<div className="mp-profile__section-head">
							<span className="mp-profile__section-title">Change Password</span>
						</div>
						<div className="mp-profile__form">
							<div className="mp-profile__field">
								<label>Current Password</label>
								<div className="mp-profile__input-wrap">
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showCurrent ? 'text' : 'password'}
										placeholder="Enter your current password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
									/>
									<button className="mp-profile__pw-toggle" onClick={() => setShowCurrent(!showCurrent)}>
										{showCurrent ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
							</div>
							<div className={`mp-profile__field${!currentPassword.trim() ? ' mp-profile__field--locked' : ''}`}>
								<label>New Password</label>
								<div className="mp-profile__input-wrap">
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showNew ? 'text' : 'password'}
										placeholder="Enter new password"
										value={newPassword}
										disabled={!currentPassword.trim()}
										onChange={(e) => setNewPassword(e.target.value)}
									/>
									<button
										className="mp-profile__pw-toggle"
										onClick={() => setShowNew(!showNew)}
										disabled={!currentPassword.trim()}
									>
										{showNew ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
							</div>
							<div className={`mp-profile__field${!currentPassword.trim() ? ' mp-profile__field--locked' : ''}`}>
								<label>Confirm New Password</label>
								<div
									className={`mp-profile__input-wrap${
										confirmPassword && newPassword !== confirmPassword ? ' mp-profile__input-wrap--error' : ''
									}`}
								>
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showConfirm ? 'text' : 'password'}
										placeholder="Confirm new password"
										value={confirmPassword}
										disabled={!currentPassword.trim()}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
									<button
										className="mp-profile__pw-toggle"
										onClick={() => setShowConfirm(!showConfirm)}
										disabled={!currentPassword.trim()}
									>
										{showConfirm ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
								{confirmPassword && newPassword !== confirmPassword && (
									<span className="mp-profile__field-error">Passwords don't match</span>
								)}
							</div>
							<button className="mp-profile__save-pw-btn" onClick={updatePasswordHandler} disabled={isPasswordDisabled}>
								{savingPassword ? 'Updating...' : 'Update Password u2192'}
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}

	// u2500u2500 DESKTOP u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500

	return (
		<div className="mp-profile">
			{/* Page bar */}
			<div className="mp-page-bar">
				<div className="mp-page-bar__left">
					<span className="mp-page-bar__eyebrow">Account</span>
					<h2 className="mp-page-bar__title">My Profile</h2>
					<p className="mp-page-bar__sub">Manage your personal info and security</p>
				</div>
			</div>

			{/* Hero */}
			<div className="mp-profile__hero">
				<div className="mp-profile__identity">
					<div className="mp-profile__avatar-wrap">
						{previewImage ? (
							<img src={previewImage} alt={user.memberNick} className="mp-profile__avatar" />
						) : (
							<AccountCircleIcon className="mp-profile__avatar-icon" />
						)}
						<label
							htmlFor="desk-upload"
							className={`mp-profile__camera${uploading ? ' mp-profile__camera--busy' : ''}`}
						>
							<CameraAltOutlinedIcon sx={{ fontSize: 14 }} />
						</label>
						<input id="desk-upload" type="file" hidden accept="image/jpg,image/jpeg,image/png" onChange={uploadImage} />
					</div>
					<div className="mp-profile__identity-info">
						<h2 className="mp-profile__display-name">{user.memberFullName || user.memberNick}</h2>
						<span className="mp-profile__username">@{user.memberNick}</span>
						<span className="mp-profile__type-chip">{user.memberType}</span>
					</div>
					<div className="mp-profile__identity-actions">
						{activeTab === 'info' && !editing && (
							<button className="mp-profile__edit-btn" onClick={() => setEditing(true)}>
								<EditOutlinedIcon sx={{ fontSize: 15 }} />
								Edit Profile
							</button>
						)}
					</div>
				</div>

				{/* Stats inside hero */}
				<div className="mp-profile__stats-bar">
					{STATS.map((s, i) => (
						<React.Fragment key={s.label}>
							<div className="mp-profile__stat">
								<div className="mp-profile__stat-icon">{s.icon}</div>
								<div>
									<div className="mp-profile__stat-val">{s.value}</div>
									<div className="mp-profile__stat-label">{s.label}</div>
								</div>
							</div>
							{i < STATS.length - 1 && <div className="mp-profile__stat-divider" />}
						</React.Fragment>
					))}
				</div>
			</div>

			{/* Body */}
			<div className="mp-profile__body">
				<div className="mp-profile__tabs">
					<button
						className={`mp-profile__tab${activeTab === 'info' ? ' active' : ''}`}
						onClick={() => {
							setActiveTab('info');
							setEditing(false);
						}}
					>
						<PersonOutlineIcon sx={{ fontSize: 16 }} /> Personal Info
					</button>
					<button
						className={`mp-profile__tab${activeTab === 'security' ? ' active' : ''}`}
						onClick={() => {
							setActiveTab('security');
							setEditing(false);
						}}
					>
						<LockOutlinedIcon sx={{ fontSize: 16 }} /> Security
					</button>
				</div>

				<div className="mp-profile__tab-divider" />

				{activeTab === 'info' && (
					<>
						<div className="mp-profile__section-head">
							<div>
								<h3 className="mp-profile__section-title">Personal Information</h3>
								<p className="mp-profile__section-sub">
									{editing
										? 'Update your details below and hit save when done.'
										: 'Your personal details and contact info.'}
								</p>
							</div>
							{editing && (
								<div className="mp-profile__form-actions">
									<button className="mp-profile__cancel-btn" onClick={cancelEdit}>
										Cancel
									</button>
									<button className="mp-profile__save-btn" onClick={updateProfileHandler} disabled={isDisabled}>
										{saving ? 'Saving...' : 'Save Changes'}
									</button>
								</div>
							)}
						</div>
						<div className="mp-profile__form-grid">
							{FIELDS.map((f) => (
								<div key={f.key} className="mp-profile__field">
									<label>{f.label}</label>
									<div className={`mp-profile__input-wrap${!editing ? ' mp-profile__input-wrap--readonly' : ''}`}>
										{f.icon}
										<input
											type="tel"
											inputMode="numeric"
											maxLength={13}
											placeholder={f.placeholder}
											value={
												f.key === 'memberPhone'
													? formatKRPhone((editing ? updateData : (user as any))[f.key] ?? '')
													: (editing ? updateData : (user as any))[f.key] ?? ''
											}
											readOnly={!editing}
											onChange={({ target: { value } }) =>
												setUpdateData((prev) => ({
													...prev,
													[f.key]: f.key === 'memberPhone' ? formatKRPhone(value) : value,
												}))
											}
										/>
									</div>
								</div>
							))}
							<div className="mp-profile__field mp-profile__field--full">
								<label>About Me</label>
								<div
									className={`mp-profile__input-wrap mp-profile__input-wrap--textarea${
										!editing ? ' mp-profile__input-wrap--readonly' : ''
									}`}
								>
									<NotesOutlinedIcon sx={{ fontSize: 16 }} />
									<textarea
										placeholder="Tell us about yourself..."
										value={(editing ? updateData.memberDesc : user.memberDesc) ?? ''}
										rows={4}
										readOnly={!editing}
										onChange={({ target: { value } }) => setUpdateData((prev) => ({ ...prev, memberDesc: value }))}
									/>
								</div>
							</div>
						</div>
					</>
				)}

				{activeTab === 'security' && (
					<>
						<div className="mp-profile__section-head">
							<div>
								<h3 className="mp-profile__section-title">Change Password</h3>
								<p className="mp-profile__section-sub">Make sure your account is using a strong password.</p>
							</div>
						</div>
						<div className="mp-profile__form-grid mp-profile__form-grid--narrow">
							<div className="mp-profile__field mp-profile__field--full">
								<label>Current Password</label>
								<div className="mp-profile__input-wrap">
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showCurrent ? 'text' : 'password'}
										placeholder="Enter your current password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
									/>
									<button className="mp-profile__pw-toggle" onClick={() => setShowCurrent(!showCurrent)}>
										{showCurrent ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
							</div>
							<div className={`mp-profile__field${!currentPassword.trim() ? ' mp-profile__field--locked' : ''}`}>
								<label>New Password</label>
								<div className="mp-profile__input-wrap">
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showNew ? 'text' : 'password'}
										placeholder="Enter new password"
										value={newPassword}
										disabled={!currentPassword.trim()}
										onChange={(e) => setNewPassword(e.target.value)}
									/>
									<button
										className="mp-profile__pw-toggle"
										onClick={() => setShowNew(!showNew)}
										disabled={!currentPassword.trim()}
									>
										{showNew ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
							</div>
							<div className={`mp-profile__field${!currentPassword.trim() ? ' mp-profile__field--locked' : ''}`}>
								<label>Confirm New Password</label>
								<div
									className={`mp-profile__input-wrap${
										confirmPassword && newPassword !== confirmPassword ? ' mp-profile__input-wrap--error' : ''
									}`}
								>
									<LockOutlinedIcon sx={{ fontSize: 16 }} />
									<input
										type={showConfirm ? 'text' : 'password'}
										placeholder="Confirm new password"
										value={confirmPassword}
										disabled={!currentPassword.trim()}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
									<button
										className="mp-profile__pw-toggle"
										onClick={() => setShowConfirm(!showConfirm)}
										disabled={!currentPassword.trim()}
									>
										{showConfirm ? (
											<VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
										) : (
											<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
										)}
									</button>
								</div>
								{confirmPassword && newPassword !== confirmPassword && (
									<span className="mp-profile__field-error">Passwords don't match</span>
								)}
							</div>
							<div className="mp-profile__field mp-profile__field--full">
								<button className="mp-profile__save-btn" onClick={updatePasswordHandler} disabled={isPasswordDisabled}>
									{savingPassword ? 'Updating...' : 'Update Password u2192'}
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
		memberFullName: '',
	},
};

export default MyProfile;
