import { Modal, Typography } from "antd";

export default function NotificationModalView(props) {
	const { toggleModalView, setToggleModalView } = props;

	return (
		<Modal
			title={toggleModalView.data?.notification.title}
			wrapClassName="notification-modal-view"
			open={toggleModalView.open}
			onCancel={() => {
				setToggleModalView({
					open: false,
					data: null,
				});
			}}
			footer={null}
		>
			<Typography.Text>
				{toggleModalView.data?.notification.description}
			</Typography.Text>
		</Modal>
	);
}
