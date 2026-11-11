import { useCallback, useEffect, useState } from "react";
import { Bike, MapPin, Trash2 } from "lucide-react";

import {
  createDriver,
  deleteDriver,
  getDrivers,
  updateDriver,
} from "../../services/driver.service";
import { getDeliveryZones } from "../../services/deliveryZone.service";

const emptyForm = {
  name: "",
  phone: "",
  vehicle: "",
  zone: "",
  lat: "",
  lng: "",
  status: "available",
};

const hasLocation = location =>
  Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));

const getMapUrl = location =>
  `https://www.google.com/maps?q=${Number(location.lat)},${Number(location.lng)}`;

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const [driverResponse, zoneResponse] = await Promise.all([
      getDrivers({ limit: 100 }),
      getDeliveryZones({ limit: 100 }),
    ]);
    setDrivers(driverResponse.data || []);
    setZones(zoneResponse.data || []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadData, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const handleChange = event => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async event => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateDriver(editingId, form);
      } else {
        await createDriver(form);
      }

      setForm(emptyForm);
      setEditingId("");
      setMessage("Driver saved.");
      loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save driver.");
    }
  };

  const editDriver = driver => {
    setEditingId(driver._id);
    setForm({
      name: driver.name || "",
      phone: driver.phone || "",
      vehicle: driver.vehicle || "",
      zone: driver.zone?._id || "",
      lat: driver.currentLocation?.lat || "",
      lng: driver.currentLocation?.lng || "",
      status: driver.status || "available",
    });
  };

  const removeDriver = async id => {
    if (!globalThis.confirm("Delete this driver?")) return;

    await deleteDriver(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase text-red-600">Drivers</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Driver management
        </h1>
        <p className="mt-2 text-slate-500">
          Manage driver availability, vehicle details, zones, and location.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-red-50 text-red-600">
              <Bike size={20} />
            </span>
            <h2 className="text-lg font-black text-slate-950">
              {editingId ? "Edit driver" : "Add driver"}
            </h2>
          </div>
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          <Input label="Vehicle" name="vehicle" value={form.vehicle} onChange={handleChange} />
          <label className="grid gap-2 text-sm font-bold text-slate-600">
            Zone
            <select
              name="zone"
              value={form.zone}
              onChange={handleChange}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            >
              <option value="">No zone</option>
              {zones.map(zone => (
                <option key={zone._id} value={zone._id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
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
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </label>
          <button className="rounded-lg bg-red-600 px-5 py-3 text-sm font-black text-white">
            Save driver
          </button>
        </form>

        <div className="grid gap-3">
          {message && (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">
              {message}
            </p>
          )}
          {drivers.map(driver => (
            <article
              key={driver._id}
              className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto]"
            >
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  {driver.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {driver.phone} - {driver.vehicle || "No vehicle"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">
                    {driver.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {driver.zone?.name || "No zone"}
                  </span>
                  {hasLocation(driver.currentLocation) && (
                    <a
                      href={getMapUrl(driver.currentLocation)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-700"
                    >
                      <MapPin size={13} />
                      Open map
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => editDriver(driver)}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeDriver(driver._id)}
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
