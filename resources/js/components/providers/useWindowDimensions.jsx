import { useState, useEffect } from "react";

export default function useWindowDimensions() {
    const getSize = () => ({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    const [windowSize, setWindowSize] = useState(getSize());

    useEffect(() => {
        function handleResize() {
            // console.log("window.innerWidth: ", window.innerWidth);
            // console.log("window.innerHeight: ", window.innerHeight);

            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}
