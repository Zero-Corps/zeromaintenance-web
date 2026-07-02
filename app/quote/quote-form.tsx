"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CONDITIONS,
  SERVICES,
  SIZE_CLASSES,
  computeEstimate,
  formatCurrency,
  type ConditionId,
  type ServiceId,
  type SizeClassId,
} from "@/lib/quote";
import { submitQuote, type SubmitState } from "./actions";

const initialState: SubmitState = { error: null };

const inputClass =
  "w-full rounded-none border border-line bg-panel px-3.5 py-2.5 text-fg placeholder:text-muted/60 outline-none transition-colors focus:border-accent";
const labelClass = "spec-label mb-2 block";

export function QuoteForm() {
  const [state, formAction, isPending] = useActionState(
    submitQuote,
    initialState,
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [sizeClass, setSizeClass] = useState<SizeClassId | "">("");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [condition, setCondition] = useState<ConditionId | "">("");
  const [notes, setNotes] = useState("");

  const estimate = useMemo(
    () => computeEstimate({ services, sizeClass, condition }),
    [services, sizeClass, condition],
  );

  function toggleService(id: ServiceId) {
    setServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    formAction({
      name,
      email,
      phone,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      sizeClass,
      services,
      condition,
      notes,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-[1fr_360px]"
    >
      {/* Form fields */}
      <div className="flex flex-col gap-8">
        {/* Contact */}
        <fieldset className="border border-line bg-panel/40 p-6">
          <legend className="spec-label px-2">Your details</legend>
          <div className="grid gap-5">
            <div>
              <label className={labelClass} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Vehicle */}
        <fieldset className="border border-line bg-panel/40 p-6">
          <legend className="spec-label px-2">Vehicle</legend>
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="year">
                  Year
                </label>
                <input
                  id="year"
                  inputMode="numeric"
                  className={inputClass}
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  placeholder="2021"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="make">
                  Make
                </label>
                <input
                  id="make"
                  className={inputClass}
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  placeholder="Toyota"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="model">
                  Model
                </label>
                <input
                  id="model"
                  className={inputClass}
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Tacoma"
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>Size class</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SIZE_CLASSES.map((size) => {
                  const active = sizeClass === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSizeClass(size.id)}
                      aria-pressed={active}
                      className={`border px-3 py-3 text-left text-sm transition-colors ${
                        active
                          ? "border-accent bg-accent/10 text-fg"
                          : "border-line bg-panel text-muted hover:border-accent-glow hover:text-fg"
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Services */}
        <fieldset className="border border-line bg-panel/40 p-6">
          <legend className="spec-label px-2">Services</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map((service) => {
              const active = services.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  aria-pressed={active}
                  className={`flex items-center justify-between border px-4 py-4 text-left transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : "border-line bg-panel hover:border-accent-glow"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center border text-xs ${
                        active
                          ? "border-accent bg-accent text-white"
                          : "border-muted"
                      }`}
                    >
                      {active ? "✓" : ""}
                    </span>
                    <span className="font-medium">{service.label}</span>
                  </span>
                  <span className="font-mono text-sm text-accent-glow">
                    {formatCurrency(service.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Condition */}
        <fieldset className="border border-line bg-panel/40 p-6">
          <legend className="spec-label px-2">Paint condition</legend>
          <div className="grid grid-cols-3 gap-3">
            {CONDITIONS.map((c) => {
              const active = condition === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCondition(c.id)}
                  aria-pressed={active}
                  className={`border px-3 py-3 text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent/10 text-fg"
                      : "border-line bg-panel text-muted hover:border-accent-glow hover:text-fg"
                  }`}
                >
                  {c.label}
                  {c.surcharge > 0 && (
                    <span className="ml-1 font-mono text-xs text-muted">
                      +{Math.round(c.surcharge * 100)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="border border-line bg-panel/40 p-6">
          <legend className="spec-label px-2">Notes (optional)</legend>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should know — stains, deep scratches, specific goals…"
          />
          <p className="mt-3 text-xs text-muted">
            No need to upload photos here — after you submit, we&apos;ll text
            the number you provide so you can send pictures of your vehicle
            directly.
          </p>
        </fieldset>
      </div>

      {/* Estimate panel */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-line bg-panel p-6">
          <p className="spec-label">Instant estimate</p>

          <div className="mt-4">
            {estimate.hasSelection ? (
              <p className="font-display text-4xl">
                {formatCurrency(estimate.low)}
                <span className="mx-2 text-muted">–</span>
                {formatCurrency(estimate.high)}
              </p>
            ) : (
              <p className="font-display text-3xl text-muted">
                Select a service
              </p>
            )}
          </div>

          <p className="mt-4 text-sm text-muted">
            Live estimate based on your selections. Final price is confirmed
            after an in-person inspection.
          </p>

          <div className="mt-6 space-y-2 border-t border-line pt-5 font-mono text-xs text-muted">
            <div className="flex justify-between">
              <span>Services</span>
              <span className="text-fg">
                {services.length === 0
                  ? "—"
                  : `${services.length} selected`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Size class</span>
              <span className="text-fg">
                {SIZE_CLASSES.find((s) => s.id === sizeClass)?.label ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Condition</span>
              <span className="text-fg">
                {CONDITIONS.find((c) => c.id === condition)?.label ?? "—"}
              </span>
            </div>
          </div>

          {state.error && (
            <p
              role="alert"
              className="mt-5 border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-6 w-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-glow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Submitting…" : "Request this quote"}
          </button>
          <p className="mt-3 text-center font-mono text-xs text-muted">
            No payment now — this just sends us your request.
          </p>
        </div>
      </div>
    </form>
  );
}
