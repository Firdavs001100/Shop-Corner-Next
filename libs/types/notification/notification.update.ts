import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

export interface NotificationUpdate {
	_id: string;
	notificationStatus?: NotificationStatus;
	notificationType?: NotificationType;
	notificationGroup?: NotificationGroup;
	notificationTitle?: string;
	notificationDesc?: string;
	productId?: string;
	articleId?: string;
}
