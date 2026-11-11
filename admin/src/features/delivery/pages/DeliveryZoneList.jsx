import { useCallback, useEffect, useState } from "react";
import { MapPinned, Trash2 } from "lucide-react";

import {
  createDeliveryZone,
  deleteDeliveryZone,
  getDeliveryZones,
  updateDeliveryZone,
} from "../../services/deliveryZone.service";

const emptyForm = {
  name: "",
  description: "",
  deliveryFee: 2000,
  minOrder: 0,
  estimatedMinutes: 30,
  lat: "",
  lng: "",
  radiusKm: 0,
  status: "active",
};

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

export default function DeliveryZoneList() {
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const loadZones = useCallback(async () => {
    const response = await getDeliveryZones({ limit: 100 });
    setZones(response.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadZones, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadZones]);

  const handleChange = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async event => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateDeliveryZone(editingId, form);
      } else {
        await createDeliveryZone(form);
      }

      setForm(emptyForm);
      setEditingId("");
      setMessage("Delivery zone saved.");
      loadZones();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save zone.");
    }
  };

  const editZone = zone => {
    setEditingId(zone._id);
    setForm({
      name: zone.name || "",
      description: zone.description || "",
      deliveryFee: zone.deliveryFee || 0,
      minOrder: zone.minOrder || 0,
      estimatedMinutes: zone.estimatedMinutes || 30,
      lat: zone.center?.lat || "",
      lng: zone.center?.lng || "",
      radiusKm: zone.radiusKm || 0,
      status: zone.status || "active",
    });
  };

  const removeZone = async id => {
    if (!globalThis.confirm("Delete this delivery zone?")) return;

    await deleteDeliveryZone(id);
    loadZones();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Delivery</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Delivery zones
        </h1>
        <p className="mt-2 text-slate-500">
          Control delivery fees, minimum order rules, ETA, and service areas.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
              <MapPinned size={20} />
            </span>
            <h2 className="text-lg font-black text-slate-950">
              {editingId ? "Edit zone" : "Add zone"}
            </h2>
          </div>

          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Description" name="description" value={form.description} onChange={handleChange} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Delivery fee" name="deliveryFee" type="number" value={form.deliveryFee} onChange={handleChange} required />
            <Input label="Minimum order" name="minOrder" type="number" value={form.minOrder} onChange={handleChange} />
            <Input label="ETA minutes" name="estimatedMinutes" type="number" value={form.estimatedMinutes} onChange={handleChange} />
            <Input label="Radius km" name="radiusKm" type="number" value={form.radiusKm} onChange={handleChange} />
            <Input label="Latitude" name="lat" type="number" value={form.lat} onChange={handleChange} />
            <Input label="Longitude" name="lng" type="number" value={form.lng} onChange={handleChange} />
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <button className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white">
            Save zone
          </button>
        </form>

        <div className="grid gap-3">
          {message && (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">
              {message}
            </p>
          )}
          {zones.map(zone => (
            <article
              key={zone._id}
              className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="text-lg font-black text-slate-950">{zone.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {zone.description || "No description"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Fee IQD {Number(zone.deliveryFee || 0).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    ETA {zone.estimatedMinutes} min
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">
                    {zone.status}
                  </span>
                  {hasLocation(zone.center) && (
                    <a
                      href={getMapUrl(zone.center)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-red-50 px-3 py-1 text-red-700"
                    >
                      Open map
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => editZone(zone)}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeZone(zone._id)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
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
        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
      />
    </label>
  );
}
