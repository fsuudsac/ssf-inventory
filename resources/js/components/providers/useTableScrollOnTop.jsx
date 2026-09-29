import { useEffect } from "react";

export default function useTableScrollOnTop(id, location = "") {
	return useEffect(() => {
		const tbl1 = document.getElementById(id);
		if (!tbl1) return;

		const tableStickyHolder = tbl1.querySelector(
			".ant-table-header.ant-table-sticky-holder"
		);
		const tableBody = tbl1.querySelector(".ant-table-body");

		const handleScroll = (event) => {
			const { scrollLeft, scrollTop } = event.target;
			if (tableStickyHolder) {
				tableStickyHolder.scrollLeft = scrollLeft;
				tableStickyHolder.scrollTop = scrollTop;
			}
			if (tableBody) {
				tableBody.scrollLeft = scrollLeft;
				tableBody.scrollTop = scrollTop;
			}
		};

		if (tableStickyHolder) {
			tableStickyHolder.addEventListener("scroll", handleScroll);
		}
		if (tableBody) {
			tableBody.addEventListener("scroll", handleScroll);
		}

		// Clean up event listeners when the component unmounts
		return () => {
			if (tableStickyHolder) {
				tableStickyHolder.removeEventListener("scroll", handleScroll);
			}
			if (tableBody) {
				tableBody.removeEventListener("scroll", handleScroll);
			}
		};
	}, [id, location]);
}
