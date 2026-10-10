package com.examhub.service;

import com.examhub.dto.NotificationDto;

import java.util.List;

public interface NotificationService {
    List<NotificationDto> getUserNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
