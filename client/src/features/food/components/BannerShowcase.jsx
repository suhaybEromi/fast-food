import { useEffect, useState } from "react";

import { IMAGE_URL } from "../../services/api";

const getMediaUrl = path =>
  path?.startsWith("http") ? path : `${IMAGE_URL}${path || ""}`;

export default function BannerShowcase({ banners }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleBanners = banners.slice(0, 6);
  const safeIndex = visibleBanners.length
    ? activeIndex % visibleBanners.length
    : 0;
  const activeBanner = visibleBanners[safeIndex];

  useEffect(() => {
    if (visibleBanners.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % visibleBanners.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [visibleBanners.length]);

  if (!activeBanner) return null;

  const isVideo =
    activeBanner.mediaType === "video" || Boolean(activeBanner.video);
  const mediaPath = isVideo ? activeBanner.video : activeBanner.image;
  const content = (
    <>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb44d]">
        FireFast special
      </p>
      <h2 className="mt-2 max-w-2xl text-2xl font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
        {activeBanner.title}
      </h2>
      {activeBanner.subtitle && (
        <p className="mt-3 max-w-xl text-sm font-medium leading-5 text-white/75 sm:leading-6">
          {activeBanner.subtitle}
        </p>
      )}
      {activeBanner.link && (
        <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#ff9f1c] px-4 py-2.5 text-sm font-black text-[#24211d] shadow-lg shadow-black/20">
          View offer <span aria-hidden="true">&rarr;</span>
        </span>
      )}
    </>
  );

  return (
    <section
      aria-label="Featured offers"
      className="overflow-hidden rounded-3xl border border-black/5 bg-[#24211d] shadow-[0_24px_65px_rgba(39,32,24,0.16)]"
    >
      <div className="group relative min-h-56 overflow-hidden sm:min-h-64 lg:min-h-[300px]">
        {isVideo && mediaPath ? (
          <video
            key={mediaPath}
            src={getMediaUrl(mediaPath)}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : mediaPath ? (
          <img
            key={mediaPath}
            src={getMediaUrl(mediaPath)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,159,28,0.35),transparent_30%),linear-gradient(135deg,#3a2d21,#17130f)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#17130f]/95 via-[#17130f]/65 to-[#17130f]/15" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 lg:p-8">
          {activeBanner.link ? (
            <a href={activeBanner.link} className="block w-fit max-w-full">
              {content}
            </a>
          ) : (
            <div>{content}</div>
          )}
        </div>

        <div className="absolute end-5 top-5 z-20 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur-md">
          {String(safeIndex + 1).padStart(2, "0")} / {String(visibleBanners.length).padStart(2, "0")}
        </div>
      </div>

      {visibleBanners.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/10 bg-[#1d1915] p-2.5 sm:p-3">
          {visibleBanners.map((banner, index) => (
            <button
              type="button"
              key={banner._id}
              aria-label={`Show offer ${index + 1}: ${banner.title}`}
              aria-current={index === safeIndex}
              onClick={() => setActiveIndex(index)}
              className={`min-w-32 flex-1 rounded-lg px-3 py-2 text-start transition sm:min-w-40 ${
                index === safeIndex
                  ? "bg-white text-[#24211d]"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="line-clamp-1 text-xs font-black">{banner.title}</span>
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider opacity-60">
                {banner.mediaType === "video" || banner.video ? "Video" : "Offer"}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
