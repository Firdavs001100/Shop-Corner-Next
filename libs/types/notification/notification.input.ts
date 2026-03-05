import { Direction } from '../../enums/common.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

export interface NotificationInput {
	notificationType: NotificationType;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	productId?: string;
	articleId?: string;
}

export interface NFISearch {
	notificationStatus?: NotificationStatus;
	notificationGroup?: NotificationGroup;
	notificationType?: NotificationType;
}

export interface NotificationInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: NFISearch;
}
