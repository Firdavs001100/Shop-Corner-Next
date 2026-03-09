import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../auth';
import { toastSmallSuccess, toastErrorHandling, toastBasic } from '../../toast';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Modal } from '@mui/material';

type AnimState = 'idle' | 'exit' | 'enter';

const Join: NextPage = () => {
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
			toastSmallSuccess('Welcome back!', 1000);
			closeModal();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.email, 'USER');
			toastSmallSuccess('Account created!', 1000);
			closeModal();
		} catch (err: any) {
			toastErrorHandling(err);
		}
	}, [input]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') loginView ? doLogin() : doSignUp();
	};

	const loginDisabled = !input.nick || !input.password;
	const signupDisabled = !input.nick || !input.password || !input.phone || !input.email;

	const handleForgotPassword = () => {
		toastBasic('Password reset is not available at the moment. Please try again later.', 3000);
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
								<h1 className="join-mobile__title">{loginView ? 'Sign In' : 'Register'}</h1>
								<p className="join-mobile__subtitle">
									{loginView ? 'Please enter your details below to sign in.' : 'Please enter your details to register.'}
								</p>
							</div>

							<div className="join-mobile__fields">
								{loginView ? (
									<div className="join-mobile__field">
										<label className="join-mobile__label">
											Nickname <span className="join-mobile__required">*</span>
										</label>
										<input
											className="join-mobile__input"
											type="text"
											placeholder="ENTER YOUR NICKNAME"
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
													Nickname <span className="join-mobile__required">*</span>
												</label>
												<input
													className="join-mobile__input"
													type="text"
													placeholder="NICKNAME"
													value={input.nick}
													onChange={(e) => handleInput('nick', e.target.value)}
												/>
											</div>
											<div className="join-mobile__field">
												<label className="join-mobile__label">
													Phone <span className="join-mobile__required">*</span>
												</label>
												<input
													className="join-mobile__input"
													type="tel"
													placeholder="PHONE"
													value={input.phone}
													onChange={(e) => handleInput('phone', e.target.value)}
												/>
											</div>
										</div>
										<div className="join-mobile__field">
											<label className="join-mobile__label">
												Email <span className="join-mobile__required">*</span>
											</label>
											<input
												className="join-mobile__input"
												type="email"
												placeholder="EMAIL"
												value={input.email}
												onChange={(e) => handleInput('email', e.target.value)}
											/>
										</div>
									</>
								)}

								<div className="join-mobile__field">
									<label className="join-mobile__label">
										Password <span className="join-mobile__required">*</span>
									</label>
									<div className="join-mobile__password-wrap">
										<input
											className="join-mobile__input join-mobile__input--password"
											type={showPassword ? 'text' : 'password'}
											placeholder="PASSWORD"
											value={input.password}
											onChange={(e) => handleInput('password', e.target.value)}
											onKeyDown={handleKeyDown}
										/>
										<button
											type="button"
											className="join-mobile__password-toggle"
											onClick={() => setShowPassword((v) => !v)}
										>
											{showPassword ? (
												<VisibilityOffIcon fontSize="small" />
											) : (
												<span className="join-mobile__show-text">Show</span>
											)}
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
											Sign up for our newsletter
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
									{loginView ? 'Login' : 'Register'}
								</button>
								<button type="button" className="join-mobile__btn join-mobile__btn--secondary" onClick={toggleView}>
									{loginView ? "Don't have an account? Register" : 'Already have an account? Login'}
								</button>
								{loginView && (
									<div className="join-mobile__forgot" onClick={handleForgotPassword}>
										<EmailOutlinedIcon fontSize="small" />
										<strong>Forgot your password?</strong>
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
					<button type="button" className="join-page__close" onClick={closeModal}>
						✕
					</button>

					<div className={contentClass}>
						<div className="join-page__header">
							<h1 className="join-page__title">{loginView ? 'Sign In' : 'Register'}</h1>
							<p className="join-page__subtitle">
								{loginView
									? 'Please enter your details below to sign in.'
									: 'Please fill in your details to create an account.'}
							</p>
						</div>

						<div className="join-page__fields">
							{loginView ? (
								<div className="join-page__field">
									<label className="join-page__label">
										Nickname <span className="join-page__required">*</span>
									</label>
									<input
										className="join-page__input"
										type="text"
										placeholder="ENTER YOUR NICKNAME"
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
												Nickname <span className="join-page__required">*</span>
											</label>
											<input
												className="join-page__input"
												type="text"
												placeholder="NICKNAME"
												value={input.nick}
												onChange={(e) => handleInput('nick', e.target.value)}
											/>
										</div>
										<div className="join-page__field">
											<label className="join-page__label">
												Phone <span className="join-page__required">*</span>
											</label>
											<input
												className="join-page__input"
												type="tel"
												placeholder="PHONE"
												value={input.phone}
												onChange={(e) => handleInput('phone', e.target.value)}
											/>
										</div>
									</div>
									<div className="join-page__field">
										<label className="join-page__label">
											Email <span className="join-page__required">*</span>
										</label>
										<input
											className="join-page__input"
											type="email"
											placeholder="EMAIL"
											value={input.email}
											onChange={(e) => handleInput('email', e.target.value)}
										/>
									</div>
								</>
							)}

							<div className="join-page__field">
								<label className="join-page__label">
									Password <span className="join-page__required">*</span>
								</label>
								<div className="join-page__password-wrap">
									<input
										className="join-page__input join-page__input--password"
										type={showPassword ? 'text' : 'password'}
										placeholder="PASSWORD"
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onKeyDown={handleKeyDown}
									/>
									<button
										type="button"
										className="join-page__password-toggle"
										onClick={() => setShowPassword((v) => !v)}
									>
										{showPassword ? <VisibilityOffIcon fontSize="small" /> : 'Show'}
									</button>
								</div>
							</div>

							{!loginView && (
								<div className="join-page__privacy">
									<p className="join-page__privacy-text">
										By registering, you agree to our Terms of Service and Privacy Policy.
									</p>
									<label className="join-page__checkbox-row">
										<input
											className="join-page__checkbox"
											type="checkbox"
											checked={newsletter}
											onChange={(e) => setNewsletter(e.target.checked)}
										/>
										Sign up for our newsletter
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
								{loginView ? 'Login' : 'Register'}
							</button>
							<p className="join-page__new-customer">
								{loginView ? "Don't have an account?" : 'Already have an account?'}
							</p>
							<button type="button" className="join-page__btn join-page__btn--secondary" onClick={toggleView}>
								{loginView ? 'Register' : 'Login'}
							</button>
							{loginView && (
								<div className="join-page__forgot" onClick={handleForgotPassword}>
									<EmailOutlinedIcon fontSize="small" />
									<strong>Forgot your password?</strong>
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
