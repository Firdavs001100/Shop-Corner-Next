import React, { useCallback, useEffect, useRef, useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { NEXT_PUBLIC_API_URL } from '../config';
import { useRouter } from 'next/router';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const SendIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="22" y1="2" x2="11" y2="13" />
		<polygon points="22 2 15 22 11 13 2 9 22 2" />
	</svg>
);

const ChatIcon = () => (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
);

const CloseIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const MinimizeIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="5" y1="12" x2="19" y2="12" />
	</svg>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isOwn }: { msg: MessagePayload; isOwn: boolean }) => {
	const memberImage = msg.memberData?.memberImage ? `${NEXT_PUBLIC_API_URL}/${msg.memberData.memberImage}` : null;
	const initials = msg.memberData?.memberNick?.[0]?.toUpperCase() ?? 'A';

	if (isOwn) {
		return (
			<div className="chat-msg chat-msg--own">
				<div className="chat-msg__content chat-msg__content--own">
					<div className="chat-msg__bubble chat-msg__bubble--own">{msg.text}</div>
				</div>
				<div className="chat-msg__avatar chat-msg__avatar--own">
					{memberImage ? <img src={memberImage} alt={msg.memberData?.memberNick ?? 'you'} /> : <span>{initials}</span>}
				</div>
			</div>
		);
	}

	return (
		<div className="chat-msg chat-msg--other">
			<div className="chat-msg__avatar">
				{memberImage ? <img src={memberImage} alt={msg.memberData?.memberNick ?? 'user'} /> : <span>{initials}</span>}
			</div>
			<div className="chat-msg__content">
				<span className="chat-msg__nick">{msg.memberData?.memberNick ?? 'Anonymous'}</span>
				<div className="chat-msg__bubble chat-msg__bubble--other">{msg.text}</div>
			</div>
		</div>
	);
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Chat = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState('');
	const [open, setOpen] = useState(false);
	const [visible, setVisible] = useState(false);
	const [unread, setUnread] = useState(0);

	const inputRef = useRef<HTMLInputElement>(null);
	const openRef = useRef(false);

	useEffect(() => {
		openRef.current = open;
	}, [open]);

	// ── Socket Message Handler ──
	useEffect(() => {
		if (!socket) return;

		socket.onmessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);

				switch (data.event) {
					case 'info':
						setOnlineUsers(data.totalClients);
						break;

					case 'getMessages':
						setMessagesList(data.list ?? []);
						break;

					case 'message':
						// Fix for "Anonymous" + missing avatar on own messages
						const receivedMsg: MessagePayload = {
							...data,
							memberData: data.memberData || user || ({ _id: '', memberNick: 'Anonymous', memberImage: null } as any),
						};
						setMessagesList((prev) => [...prev, receivedMsg]);

						if (!openRef.current) setUnread((prev) => prev + 1);
						break;
				}
			} catch (e) {
				console.error('Failed to parse WebSocket message', e);
			}
		};

		return () => {
			socket.onmessage = null;
		};
	}, [socket, user]);

	// Other effects (unchanged)
	useEffect(() => {
		const t = setTimeout(() => setVisible(true), 150);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		setVisible(false);
		setOpen(false);
		const t = setTimeout(() => setVisible(true), 150);
		return () => clearTimeout(t);
	}, [router.pathname]);

	useEffect(() => {
		if (open) {
			setUnread(0);
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [open]);

	useEffect(() => {
		if (openRef.current) setUnread(0);
	}, [messagesList]);

	// ── Handlers ──
	const handleToggle = () => setOpen((v) => !v);

	const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setMessageInput(e.target.value);
	}, []);

	const handleSend = () => {
		if (!messageInput.trim()) return;

		if (!socket || socket.readyState !== WebSocket.OPEN) {
			console.error('Socket not ready');
			return;
		}

		socket.send(JSON.stringify({ event: 'message', data: messageInput }));
		setMessageInput('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};

	// Mobile swipe to close
	const touchStartX = useRef<number>(0);
	const onSwipeStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};
	const onSwipeEnd = (e: React.TouchEvent) => {
		const diff = e.changedTouches[0].clientX - touchStartX.current;
		if (diff > 60) setOpen(false);
	};

	if (!visible) return null;

	return (
		<div className="chat-widget">
			{/* Mobile backdrop */}
			{open && <div className="chat-backdrop" onClick={() => setOpen(false)} />}

			{/* Chat panel */}
			<div
				className={`chat-panel${open ? ' chat-panel--open' : ''}`}
				onTouchStart={onSwipeStart}
				onTouchEnd={onSwipeEnd}
			>
				{/* Header */}
				<div className="chat-panel__header">
					<div className="chat-panel__header-left">
						<div className="chat-panel__online-dot" />
						<span className="chat-panel__title">Live Chat</span>
						<span className="chat-panel__online-count">{onlineUsers} online</span>
					</div>
					<div className="chat-panel__header-actions">
						<button className="chat-panel__header-btn" onClick={() => setOpen(false)} aria-label="Minimize">
							<MinimizeIcon />
						</button>
					</div>
				</div>

				{/* Messages */}
				<div className="chat-panel__body">
					<div className="chat-panel__scroll">
						<ScrollableFeed>
							<div className="chat-panel__messages">
								<div className="chat-panel__welcome">
									<div className="chat-panel__welcome-icon">
										<ChatIcon />
									</div>
									<p>Welcome to Live Chat! Say hello 👋</p>
								</div>
								{messagesList.map((msg, i) => (
									<MessageBubble
										key={i}
										msg={msg}
										isOwn={!!user && !!msg.memberData && msg.memberData._id === user._id}
									/>
								))}
							</div>
						</ScrollableFeed>
					</div>
				</div>

				{/* Input */}
				<div className="chat-panel__footer">
					<div className="chat-panel__input-row">
						<div className="chat-panel__input-avatar">
							{user?.memberImage ? (
								<img src={`${NEXT_PUBLIC_API_URL}/${user.memberImage}`} alt={user.memberNick} />
							) : (
								<span>{user?.memberNick?.[0]?.toUpperCase() ?? '?'}</span>
							)}
						</div>
						<div className="chat-panel__input-wrap">
							<input
								ref={inputRef}
								className="chat-panel__input"
								type="text"
								placeholder="Type a message..."
								value={messageInput}
								onChange={handleInput}
								onKeyDown={handleKeyDown}
								maxLength={500}
							/>
							<button
								className="chat-panel__send-btn"
								onClick={handleSend}
								disabled={!messageInput.trim()}
								aria-label="Send message"
							>
								<SendIcon />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Pull tab — mobile only */}
			{!open && (
				<button className="chat-pull-tab" onClick={() => setOpen(true)} aria-label="Open chat">
					<ChatIcon />
					{unread > 0 && <span className="chat-pull-tab__badge">{unread > 9 ? '9+' : unread}</span>}
				</button>
			)}

			{/* Toggle button — desktop only */}
			<button
				className={`chat-toggle${open ? ' chat-toggle--open' : ''}`}
				onClick={handleToggle}
				aria-label="Toggle chat"
			>
				{open ? <CloseIcon /> : <ChatIcon />}
				{!open && unread > 0 && <span className="chat-toggle__badge">{unread > 9 ? '9+' : unread}</span>}
			</button>
		</div>
	);
};

export default Chat;
