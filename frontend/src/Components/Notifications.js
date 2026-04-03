import React from "react";
import { useNotification } from "../contexts/NotificationContext";
import "./Notifications.css";

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ✕
            </button>
          </div>
          <div className="notification-progress"></div>
        </div>
      ))}
    </div>
  );
}
