"use client";

import { useRef, useState, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ConsentCheckbox } from "@/components/ConsentCheckbox";
import {
  uploadCustomDesignAsset,
  submitCustomDesignRequest,
  type SubmitCustomDesignResult,
} from "@/server/actions/custom-design";

const DiamondGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <path d="M12 2 L21 9 L12 22 L3 9 Z" stroke="currentColor" strokeWidth="0.6" />
    <path d="M3 9 H21" stroke="currentColor" strokeWidth="0.6" />
    <path d="M12 2 L8 9" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L16 9" stroke="currentColor" strokeWidth="0.4" />
    <path d="M12 2 L12 22" stroke="currentColor" strokeWidth="0.3" />
  </svg>
);

const JEWELRY_TYPES = [
  { value: "RING", labelKey: "typeRing" },
  { value: "NECKLACE", labelKey: "typeNecklace" },
  { value: "BRACELET", labelKey: "typeBracelet" },
  { value: "EARRINGS", labelKey: "typeEarrings" },
  { value: "OTHER", labelKey: "typeOther" },
] as const;

const SKETCH_COLORS = ["#1d1812", "#ddaa5d", "#8a6d3b", "#b5482f", "#3b5a8a"];
const CANVAS_SIZE = 640;

type Point = { x: number; y: number };

const inputClass =
  "w-full border border-gold-soft bg-paper px-3 py-2.5 text-sm text-ink focus:border-gold focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink/60";

export function CustomDesignClient() {
  const t = useTranslations("CustomDesign");

  const [jewelryType, setJewelryType] = useState<(typeof JEWELRY_TYPES)[number]["value"]>("RING");
  const [tab, setTab] = useState<"describe" | "upload" | "sketch">("describe");
  const [description, setDescription] = useState("");

  const [inspirationFile, setInspirationFile] = useState<File | null>(null);
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<{ points: Point[]; color: string; size: number }[]>([]);
  const drawingRef = useRef(false);
  const [hasSketch, setHasSketch] = useState(false);
  const [sketchColor, setSketchColor] = useState(SKETCH_COLORS[0]);
  const [brushSize, setBrushSize] = useState(4);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitCustomDesignResult | null>(null);

  useEffect(() => {
    return () => {
      if (inspirationPreview) URL.revokeObjectURL(inspirationPreview);
    };
  }, [inspirationPreview]);

  function redrawCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbf8f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  useEffect(() => {
    // The canvas element only exists while the sketch tab is mounted (it's
    // behind a `tab === "sketch"` conditional below), so a fresh <canvas>
    // node with a blank backing bitmap appears every time the customer
    // switches back to this tab — repaint the tracked strokes onto it here
    // rather than relying on a mount-only effect, which would only ever
    // fire for the very first canvas instance and leave later ones blank.
    if (tab === "sketch") redrawCanvas();
  }, [tab]);

  function pointFromEvent(e: ReactPointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    drawingRef.current = true;
    strokesRef.current.push({ points: [pointFromEvent(e)], color: sketchColor, size: brushSize });
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const current = strokesRef.current[strokesRef.current.length - 1];
    current.points.push(pointFromEvent(e));
    redrawCanvas();
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setHasSketch(strokesRef.current.length > 0);
  }

  function undoStroke() {
    strokesRef.current.pop();
    setHasSketch(strokesRef.current.length > 0);
    redrawCanvas();
  }

  function clearSketch() {
    strokesRef.current = [];
    setHasSketch(false);
    redrawCanvas();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInspirationFile(file);
    setInspirationPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function removeInspiration() {
    setInspirationFile(null);
    setInspirationPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function canvasToBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvasRef.current?.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      if (hasSketch) {
        const blob = await canvasToBlob();
        if (blob) {
          const uploadForm = new FormData();
          uploadForm.append("file", blob, "sketch.png");
          const uploaded = await uploadCustomDesignAsset(uploadForm);
          if ("error" in uploaded) {
            setResult({ error: uploaded.error });
            setSubmitting(false);
            return;
          }
          formData.append("sketchImageId", uploaded.mediaId);
        }
      }

      if (inspirationFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", inspirationFile);
        const uploaded = await uploadCustomDesignAsset(uploadForm);
        if ("error" in uploaded) {
          setResult({ error: uploaded.error });
          setSubmitting(false);
          return;
        }
        formData.append("inspirationImageId", uploaded.mediaId);
      }

      formData.set("jewelryType", jewelryType);
      formData.set("description", description);

      const res = await submitCustomDesignRequest(undefined, formData);
      setResult(res);
      if ("submitted" in res) form.reset();
    } catch {
      setResult({ error: t("errorGeneric") });
    } finally {
      setSubmitting(false);
    }
  }

  if (result && "submitted" in result) {
    return (
      <div className="relative border border-gold-soft p-8 text-center sm:p-12">
        <span aria-hidden="true" className="absolute -top-3 -start-3 h-10 w-10 border-t-2 border-s-2 border-gold-bright" />
        <span aria-hidden="true" className="absolute -bottom-3 -end-3 h-10 w-10 border-b-2 border-e-2 border-gold-bright" />
        <DiamondGlyph className="mx-auto h-8 w-8 text-gold-bright" />
        <h2 className="mt-4 text-lg font-semibold uppercase tracking-wide text-ink">{t("successTitle")}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60">{t("successCopy")}</p>
        <Link
          href="/category/all"
          className="mt-6 inline-block border border-gold-bright px-8 py-3 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-gold-bright hover:text-ink"
        >
          {t("backToShop")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {result && "error" in result && (
        <p className="border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{result.error}</p>
      )}

      <div>
        <label className={labelClass}>{t("jewelryTypeLabel")}</label>
        <div className="flex flex-wrap gap-2">
          {JEWELRY_TYPES.map((jt) => (
            <button
              key={jt.value}
              type="button"
              onClick={() => setJewelryType(jt.value)}
              className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                jewelryType === jt.value
                  ? "border-ink bg-ink text-paper"
                  : "border-gold-soft text-ink/70 hover:border-gold"
              }`}
            >
              {t(jt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* The "creation window" — a single square panel whose content swaps
          between the three input methods, so all of them share one focal
          point on the page rather than being three separate stacked forms. */}
      <div className="relative overflow-hidden border border-gold-soft bg-paper-soft p-5 shadow-[0_24px_48px_-30px_rgba(29,24,18,0.35)] sm:p-6">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-bright to-transparent"
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {(["describe", "upload", "sketch"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                tab === key ? "border-gold-bright bg-ink text-paper" : "border-gold-soft text-ink/70 hover:border-gold"
              }`}
            >
              {t(key === "describe" ? "tabDescribe" : key === "upload" ? "tabUpload" : "tabSketch")}
            </button>
          ))}
        </div>

        <div className="mx-auto aspect-square w-full max-w-xl border border-gold-soft bg-paper">
          {tab === "describe" && (
            <div className="flex h-full flex-col p-4">
              <label className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/60">
                {t("describeLabel")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("describePlaceholder")}
                maxLength={3000}
                className="flex-1 w-full resize-none border-0 bg-transparent text-sm leading-6 text-ink focus:outline-none"
              />
            </div>
          )}

          {tab === "upload" && (
            <div className="flex h-full flex-col p-4">
              <p className="mb-3 text-xs text-ink/60">{t("uploadHelp")}</p>
              {inspirationPreview ? (
                <div className="relative flex-1 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inspirationPreview} alt="" className="h-full w-full object-contain" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-ink/70 p-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-paper/50 px-3 py-1.5 text-xs text-paper hover:border-gold-bright"
                    >
                      {t("uploadChange")}
                    </button>
                    <button
                      type="button"
                      onClick={removeInspiration}
                      className="border border-paper/50 px-3 py-1.5 text-xs text-paper hover:border-clay"
                    >
                      {t("uploadRemove")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-1 flex-col items-center justify-center gap-3 border border-dashed border-gold-soft text-ink/50 transition-colors hover:border-gold hover:text-ink/70"
                >
                  <DiamondGlyph className="h-8 w-8" />
                  <span className="text-xs font-medium uppercase tracking-wide">{t("uploadLabel")}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {tab === "sketch" && (
            <div className="flex h-full flex-col p-3">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full flex-1 touch-none"
              />
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-ink/50">{t("sketchColor")}</span>
                  {SKETCH_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSketchColor(c)}
                      aria-label={c}
                      className="h-5 w-5 rounded-full border"
                      style={{ backgroundColor: c, borderColor: sketchColor === c ? "#ddaa5d" : "transparent" }}
                    />
                  ))}
                </div>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-ink/50">
                  {t("sketchBrush")}
                  <input
                    type="range"
                    min={2}
                    max={14}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-16 accent-gold-bright"
                  />
                </label>
                <button type="button" onClick={undoStroke} className="text-[10px] uppercase tracking-wide text-ink/50 underline hover:text-gold-deep">
                  {t("sketchUndo")}
                </button>
                <button type="button" onClick={clearSketch} className="text-[10px] uppercase tracking-wide text-ink/50 underline hover:text-gold-deep">
                  {t("sketchClear")}
                </button>
              </div>
              <p className="mt-2 text-[10px] text-ink/40">{t("sketchHelp")}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {t("contactSectionTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("nameLabel")}</label>
            <input name="customerName" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("emailLabel")}</label>
            <input name="customerEmail" type="email" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("phoneLabel")}</label>
            <input name="customerPhone" className={inputClass} />
          </div>
        </div>
      </div>

      <ConsentCheckbox id="custom-design-consent" />

      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-gold-bright bg-ink py-3 text-xs font-semibold uppercase tracking-wide text-paper transition-colors hover:bg-gold-bright hover:text-ink disabled:opacity-50 sm:w-auto sm:px-12"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
