import { App } from "antd";

let globalMessage = null;
let globalNotification = null;
let globalModal = null;

export const setAntdInstances = ({ message, notification, modal }) => {
    globalMessage = message;
    globalNotification = notification;
    globalModal = modal;
};

export const getAntdApp = () => ({
    message: globalMessage,
    notification: globalNotification,
    modal: globalModal,
});

export const AntdAppHolder = () => {
    const staticApp = App.useApp();
    setAntdInstances(staticApp);
    return null;
};
