import Resizer from "react-image-file-resizer";

const fileResizer = (options) =>
    new Promise((resolve, reject) => {
        let error = false;

        if (options.file === null) {
            return reject("Error: File is required.");
        }

        if (!error) {
            Resizer.imageFileResizer(
                options.file, // Is the file of the image which will resized.
                options.maxWidth ?? 1080, // Is the maxWidth of the resized new image.
                options.maxHeight ?? 1080, // Is the maxHeight of the resized new image.
                options.compressFormat ?? "JPEG", // Is the compressFormat of the resized new image. (JPEG, PNG, WEBP) (default: JPEG)
                options.quality ?? 100, // Is the quality of the resized new image. (0 to 100) (default: 100)
                options.degree ?? 0, // Is the degree of clockwise rotation to apply to uploaded image. (0 to 360) (default: 0)
                (uri) => resolve(uri), // Is the callBack function of the resized new image URI. (default: null)
                options.type ?? "file", // Is the output type of the resized new image. [base64, blob, file]. (default: base64)
                options.minWidth ?? 1000, // Is the minWidth of the resized new image. (next line is minHeight of the resized new image.)
                options.minHeight ?? 0 // Is the minHeight of the resized new image. (default: 0)
            );
        }
    });

export default fileResizer;
