/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext } from "react";
import { NotificationsStore } from "../notification-store";

const DefaultNotificationApi: NotificationsStore = {
  add: () => "",
  log: () => "",
  error: () => "",
  dismiss: () => {},
  clear: () => {},
};

export const NotificationContext = createContext<NotificationsStore>(DefaultNotificationApi);

export const useNotifications = () => {
  return useContext(NotificationContext);
};
