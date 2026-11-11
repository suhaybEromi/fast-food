import { useCallback, useEffect, useState } from "react";
import {
  ImagePlus,
  MonitorPlay,
  Pencil,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";

import {
  createBanner,
  deleteBanner,
  getBanners,
  updateBanner,
} from "../../services/banner.service";
import { IMAGE_URL } from "../../services/api";

const emptyForm = {
  title: "",
  subtitle: "",
  link: "",
  sortOrder: 0,
  status: "active",
  mediaType: "image",
};

const getMediaUrl = path =>
  path?.startsWith("http") ? path : `${IMAGE_URL}${path || ""}`;

export default function BannerList() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [media, setMedia] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const loadBanners = useCallback(async () => {
    try {
      const response = await getBanners({ limit: 100 });
      setBanners(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load banners.");
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadBanners, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBanners]);

  const handleChange = event => {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = async event => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (media) {
      formData.append("media", media);
    }

    try {
      if (editingId) {
        await updateBanner(editingId, formData);
      } else {
        await createBanner(formData);
      }

      setForm(emptyForm);
      setMedia(null);
      setEditingId("");
      setMessage("Banner saved.");
      loadBanners();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save banner.");
    }
  };

  const editBanner = banner => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      sortOrder: banner.sortOrder || 0,
      status: banner.status || "active",
      mediaType: banner.mediaType || (banner.video ? "video" : "image"),
    });
    setMedia(null);
  };

  const removeBanner = async id => {
    if (!globalThis.confirm("Delete this banner?")) return;

    try {
      await deleteBanner(id);
      loadBanners();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete banner.");
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Storefront</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Banner studio
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Create polished image or video promotions for the customer homepage.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
          <MonitorPlay size={18} className="text-red-600" />
          {banners.length} banner{banners.length === 1 ? "" : "s"}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={submit}
          className="grid content-start gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600">
                {form.mediaType === "video" ? <Video size={20} /> : <ImagePlus size={20} />}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Banner details</p>
                <h2 className="text-lg font-black text-slate-950">
                  {editingId ? "Edit banner" : "Add banner"}
                </h2>
              </div>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                  setMedia(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-600"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
            {[
              ["image", "Image", ImagePlus],
              ["video", "Video", Video],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setForm(current => ({ ...current, mediaType: value }));
                  setMedia(null);
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-black transition ${
                  form.mediaType === value
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
          <Input label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
          <Input label="Destination link" name="link" value={form.link} onChange={handleChange} placeholder="https://... or #menu" />

          <label className="grid gap-2 text-sm font-bold text-slate-600">
            {form.mediaType === "video" ? "Video file" : "Image file"}
            <span className="grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-red-300 hover:bg-red-50/40">
              <UploadCloud className="mb-2 text-red-600" size={24} />
              <span className="text-sm font-black text-slate-700">
                {media?.name || `Choose ${form.mediaType}`}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-400">
                {form.mediaType === "video"
                  ? "MP4 or WebM, up to 20 MB"
                  : "JPG, PNG or WebP, up to 20 MB"}
              </span>
              <input
                type="file"
                accept={form.mediaType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
                onChange={event => setMedia(event.target.files[0] || null)}
                className="sr-only"
              />
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Sort order"
              name="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={handleChange}
            />
            <label className="grid gap-2 text-sm font-bold text-slate-600">
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700"
          >
            {editingId ? "Update banner" : "Publish banner"}
          </button>
        </form>

        <div className="grid content-start gap-4">
          {message && (
            <p className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm">
              {message}
            </p>
          )}
          {banners.length === 0 && (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              <div><ImagePlus className="mx-auto mb-3 text-slate-300" size={32} /><strong className="block text-slate-700">No banners yet</strong><span className="text-sm">Create the first storefront promotion.</span></div>
            </div>
          )}
          {banners.map(banner => {
            const isVideo = banner.mediaType === "video" || Boolean(banner.video);
            const mediaPath = isVideo ? banner.video : banner.image;

            return (
              <article
                key={banner._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-[240px_1fr_auto]"
              >
                <div className="relative h-40 overflow-hidden bg-slate-950 md:h-full md:min-h-44">
                  {isVideo && mediaPath ? (
                    <video src={getMediaUrl(mediaPath)} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : mediaPath ? (
                    <img src={getMediaUrl(mediaPath)} alt={banner.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-slate-800 to-slate-950 text-slate-400">No media</div>
                  )}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-black/65 px-2.5 py-1 text-[11px] font-black uppercase text-white backdrop-blur">
                    {isVideo ? <Video size={12} /> : <ImagePlus size={12} />}{isVideo ? "Video" : "Image"}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-black text-slate-950">{banner.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{banner.subtitle || "No subtitle"}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                    <span className={`rounded-lg px-3 py-1.5 capitalize ${banner.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{banner.status}</span>
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-600">Sort {banner.sortOrder || 0}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-4 md:justify-end">
                  <button type="button" onClick={() => editBanner(banner)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-red-600"><Pencil size={14} /> Edit</button>
                  <button type="button" aria-label={`Delete ${banner.title}`} onClick={() => removeBanner(banner._id)} className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"><Trash2 size={15} /></button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      {label}
      <input
        {...props}
        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
      />
    </label>
  );
}
