import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

const IMG_URL = import.meta.env.VITE_BASE_IMAGE_URL || "";
const FALLBACK =
    "https://assets.webdads2u.com/images/1778042348274-image-not-found--1-.png";

interface CustomImageProps {
    src?: string | null;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    width?: number | string;
    height?: number | string;
}

function CustomImage({
    src,
    alt = "image",
    className = "",
    style = {},
    width,
    height,
}: CustomImageProps) {
    const finalSrc = useMemo(() => {
        if (!src?.trim()) {
            return FALLBACK;
        }

        if (
            src.startsWith("http") ||
            src.startsWith("blob:") ||
            src.startsWith("data:")
        ) {
            return src;
        }

        return `${IMG_URL}${src}`;
    }, [src]);



    const [imgSrc, setImgSrc] = useState(finalSrc);

    useEffect(() => {
        setImgSrc(finalSrc);
    }, [finalSrc]);

    return (
        <img
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            loading="lazy"
            onError={() => {
                if (imgSrc !== FALLBACK) {
                    setImgSrc(FALLBACK);
                }
            }}
        />
    );
}

export default CustomImage;