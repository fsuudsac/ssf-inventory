const convertQrCodeToImage = (qrCodeId, codeName) => {
    const svg = document.getElementById(qrCodeId)?.querySelector("svg");
    if (!svg) {
        return Promise.reject(new Error("SVG element not found"));
    }

    const svgData = new XMLSerializer().serializeToString(svg);

    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            const svgSize = svg.getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], codeName, {
                        type: "image/png",
                    });
                    resolve(file);
                } else {
                    reject(new Error("Canvas toBlob failed"));
                }
            }, "image/png");
        };

        img.onerror = (err) => {
            reject(new Error("Image loading failed"));
        };

        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            svgData
        )}`;
    });
};

export default convertQrCodeToImage;
