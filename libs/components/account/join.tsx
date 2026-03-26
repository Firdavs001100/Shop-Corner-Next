import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../auth';
import { toastSmallSuccess, toastErrorHandling, toastBasic } from '../../toast';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Modal } from '@mui/material';
import { useTranslation } from 'next-i18next';

type AnimState = 'idle' | 'exit' | 'enter';

const Join: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const device = useDeviceDetect();

	const [loginView, setLoginView] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [newsletter, setNewsletter] = useState(false);
	const [animState, setAnimState] = useState<AnimState>('idle');

	const [input, setInput] = useState({ nick: '', password: '', phone: '', email: '' });

	useEffect(() => {
		if (!router.isReady) return;
		setLoginView(router.query.auth !== 'register');
	}, [router.query.auth, router.isReady]);

	const closeModal = () => router.push(router.pathname, undefined, { shallow: true });

	const handleInput = useCallback((name: string, value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			toastSmallSuccess(t('welcomeBack'), 1000);
			closeModal();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	}, [input, t]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.email, 'USER');
			toastSmallSuccess(t('accountCreated'), 1000);
			closeModal();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	}, [input, t]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') loginView ? doLogin() : doSignUp();
	};

	const loginDisabled = !input.nick || !input.password;
	const signupDisabled = !input.nick || !input.password || !input.phone || !input.email;

	const handleForgotPassword = () => {
		toastBasic(t('passwordResetUnavailable'), 3000);
	};

	const toggleView = () => {
		setAnimState('exit');
		setTimeout(() => {
			router.push(
				{ pathname: router.pathname, query: { ...router.query, auth: loginView ? 'register' : 'login' } },
				undefined,
				{ shallow: true },
			);
			setAnimState('enter');
			setTimeout(() => setAnimState('idle'), 350);
		}, 250);
	};

	const contentClass = ['join-content', animState !== 'idle' ? `join-content--${animState}` : '']
		.filter(Boolean)
		.join(' ');

	// ───────────────── MOBILE ─────────────────

	if (device === 'mobile') {
		return (
			<Modal open={true} onClose={closeModal}>
				<div className="join-mobile">
					<div className="join-mobile__card">
						<div className={contentClass}>
							<div className="join-mobile__header">
								<h1 className="join-mobile__title">{loginView ? t('signIn') : t('register')}</h1>
								<p className="join-mobile__subtitle">{loginView ? t('signInSubtitle') : t('registerSubtitle')}</p>
							</div>

							<div className="join-mobile__fields">
								{loginView ? (
									<div className="join-mobile__field">
										<label className="join-mobile__label">
											{t('nickname')} <span className="join-mobile__required">*</span>
										</label>
										<input
											className="join-mobile__input"
											type="text"
											placeholder={t('enterNickname')}
											value={input.nick}
											onChange={(e) => handleInput('nick', e.target.value)}
											onKeyDown={handleKeyDown}
										/>
									</div>
								) : (
									<>
										<div className="join-mobile__field-row">
											<div className="join-mobile__field">
												<label className="join-mobile__label">
													{t('nickname')} <span className="join-mobile__required">*</span>
												</label>
												<input
													className="join-mobile__input"
													type="text"
													placeholder={t('nickname')}
													value={input.nick}
													onChange={(e) => handleInput('nick', e.target.value)}
												/>
											</div>
											<div className="join-mobile__field">
												<label className="join-mobile__label">
													{t('phoneInput')} <span className="join-mobile__required">*</span>
												</label>
												<input
													className="join-mobile__input"
													type="tel"
													placeholder={t('phoneInput')}
													value={input.phone}
													onChange={(e) => handleInput('phone', e.target.value)}
												/>
											</div>
										</div>
										<div className="join-mobile__field">
											<label className="join-mobile__label">
												{t('emailInput')} <span className="join-mobile__required">*</span>
											</label>
											<input
												className="join-mobile__input"
												type="email"
												placeholder={t('emailInput')}
												value={input.email}
												onChange={(e) => handleInput('email', e.target.value)}
											/>
										</div>
									</>
								)}

								<div className="join-mobile__field">
									<label className="join-mobile__label">
										{t('password')} <span className="join-mobile__required">*</span>
									</label>
									<div className="join-mobile__password-wrap">
										<input
											className="join-mobile__input join-mobile__input--password"
											type={showPassword ? 'text' : 'password'}
											placeholder={t('passwordInput')}
											value={input.password}
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={handleKeyDown}
										/>
										<button
											type="button"
											className="join-mobile__password-toggle"
											onClick={() => setShowPassword((v) => !v)}
											aria-label={showPassword ? t('hide') : t('show')}
										>
											{showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
										</button>
									</div>
								</div>

								{!loginView && (
									<div className="join-mobile__privacy">
										<label className="join-mobile__checkbox-row">
											<input
												className="join-mobile__checkbox"
												type="checkbox"
												checked={newsletter}
												onChange={(e) => setNewsletter(e.target.checked)}
											/>
											{t('newsletter')}
										</label>
									</div>
								)}
							</div>

							<div className="join-mobile__actions">
								<button
									type="button"
									className="join-mobile__btn join-mobile__btn--primary"
									disabled={loginView ? loginDisabled : signupDisabled}
									onClick={loginView ? doLogin : doSignUp}
								>
									{loginView ? t('login') : t('register')}
								</button>
								<button type="button" className="join-mobile__btn join-mobile__btn--secondary" onClick={toggleView}>
									{loginView ? t('noAccount') : t('haveAccount')}
								</button>
								{loginView && (
									<div className="join-mobile__forgot" onClick={handleForgotPassword}>
										<EmailOutlinedIcon fontSize="small" />
										<strong>{t('forgotPassword')}</strong>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	// ───────────────── DESKTOP ─────────────────

	return (
		<Modal open={true} onClose={closeModal}>
			<div className="join-page">
				<div className="join-page__card">
					<button type="button" className="join-page__close" onClick={closeModal} aria-label={t('close')}>
						✕
					</button>

					<div className={contentClass}>
						<div className="join-page__header">
							<h1 className="join-page__title">{loginView ? t('signIn') : t('register')}</h1>
							<p className="join-page__subtitle">{loginView ? t('signInSubtitle') : t('registerSubtitle')}</p>
						</div>

						<div className="join-page__fields">
							{loginView ? (
								<div className="join-page__field">
									<label className="join-page__label">
										{t('nickname')} <span className="join-page__required">*</span>
									</label>
									<input
										className="join-page__input"
										type="text"
										placeholder={t('enterNickname')}
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
										onKeyDown={handleKeyDown}
									/>
								</div>
							) : (
								<>
									<div className="join-page__field-row">
										<div className="join-page__field">
											<label className="join-page__label">
												{t('nickname')} <span className="join-page__required">*</span>
											</label>
											<input
												className="join-page__input"
												type="text"
												placeholder={t('nickname')}
												value={input.nick}
												onChange={(e) => handleInput('nick', e.target.value)}
											/>
										</div>
										<div className="join-page__field">
											<label className="join-page__label">
												{t('phoneInput')} <span className="join-page__required">*</span>
											</label>
											<input
												className="join-page__input"
												type="tel"
												placeholder={t('phoneInput')}
												value={input.phone}
												onChange={(e) => handleInput('phone', e.target.value)}
											/>
										</div>
									</div>
									<div className="join-page__field">
										<label className="join-page__label">
											{t('emailInput')} <span className="join-page__required">*</span>
										</label>
										<input
											className="join-page__input"
											type="email"
											placeholder={t('emailInput')}
											value={input.email}
											onChange={(e) => handleInput('email', e.target.value)}
										/>
									</div>
								</>
							)}

							<div className="join-page__field">
								<label className="join-page__label">
									{t('password')} <span className="join-page__required">*</span>
								</label>
								<div className="join-page__password-wrap">
									<input
										className="join-page__input join-page__input--password"
										type={showPassword ? 'text' : 'password'}
										placeholder={t('passwordInput')}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onKeyDown={handleKeyDown}
									/>
									<button
										type="button"
										className="join-page__password-toggle"
										onClick={() => setShowPassword((v) => !v)}
										aria-label={showPassword ? t('hide') : t('show')}
									>
										{showPassword ? t('hide') : t('show')}
									</button>
								</div>
							</div>

							{!loginView && (
								<div className="join-page__privacy">
									<p className="join-page__privacy-text">{t('termsText')}</p>
									<label className="join-page__checkbox-row">
										<input
											className="join-page__checkbox"
											type="checkbox"
											checked={newsletter}
											onChange={(e) => setNewsletter(e.target.checked)}
										/>
										{t('newsletter')}
									</label>
								</div>
							)}
						</div>

						<div className="join-page__actions">
							<button
								type="button"
								className="join-page__btn join-page__btn--primary"
								disabled={loginView ? loginDisabled : signupDisabled}
								onClick={loginView ? doLogin : doSignUp}
							>
								{loginView ? t('login') : t('register')}
							</button>
							<p className="join-page__new-customer">{loginView ? t('noAccount') : t('haveAccount')}</p>
							<button type="button" className="join-page__btn join-page__btn--secondary" onClick={toggleView}>
								{loginView ? t('register') : t('login')}
							</button>
							{loginView && (
								<div className="join-page__forgot" onClick={handleForgotPassword}>
									<EmailOutlinedIcon fontSize="small" />
									<strong>{t('forgotPassword')}</strong>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default Join;
