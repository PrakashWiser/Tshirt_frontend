import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

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
  const [imgSrc, setImgSrc] = useState(src?.trim() || FALLBACK);

  useEffect(() => {
    setImgSrc(src?.trim() || FALLBACK);
  }, [src]);

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
