"use client";

import { field } from "../constants";

export default function DrawingModal({ drawing, setDrawing, busy, saveDrawing, closeDrawing, upload, setError }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeDrawing();
        }
      }}
    >
      <form
        onSubmit={saveDrawing}
        className="w-full max-w-lg rounded-xl bg-white p-6 text-gray-900 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {drawing.id ? "Edit Drawing" : "Add Drawing"}
          </h2>
    
          <button
            type="button"
            onClick={() => closeDrawing()}
            className="text-xl text-gray-400 hover:text-black"
          >
            ×A
          </button>
        </div>
    
        <div className="mt-5 space-y-3">
          <input
            className={field}
            placeholder="Drawing title"
            value={drawing.title}
            onChange={(e) =>
              setDrawing({
                ...drawing,
                title: e.target.value,
              })
            }
          />
    
          <input
            className={field}
            placeholder="Reference"
            value={drawing.reference || ""}
            onChange={(e) =>
              setDrawing({
                ...drawing,
                reference: e.target.value,
              })
            }
          />
    
          <div>
            <label className="mb-1 block text-xs text-gray-500">PDF</label>
    
            <input
              type="file"
              accept="application/pdf"
              className={field}
              onChange={async (e) => {
                try {
                  const url = await upload(e.target.files?.[0]);
    
                  setDrawing({
                    ...drawing,
                    pdf_url: url,
                  });
                } catch (e) {
                  setError(e.message);
                }
              }}
            />
          </div>
    
          <div>
            <label className="mb-1 block text-xs text-gray-500">
              Thumbnail
            </label>
    
            <input
              type="file"
              accept="image/*"
              className={field}
              onChange={async (e) => {
                try {
                  const url = await upload(e.target.files?.[0]);
    
                  setDrawing({
                    ...drawing,
                    thumbnail_url: url,
                  });
                } catch (e) {
                  setError(e.message);
                }
              }}
            />
    
            {drawing.thumbnail_url && (
              <img
                src={drawing.thumbnail_url}
                alt=""
                className="mt-2 h-24 w-full rounded-lg object-cover"
              />
            )}
          </div>
    
          <input
            className={field}
            type="number"
            placeholder="Order"
            value={drawing.sort_order || 0}
            onChange={(e) =>
              setDrawing({
                ...drawing,
                sort_order: Number(e.target.value),
              })
            }
          />
    
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={!!drawing.published}
              onChange={(e) =>
                setDrawing({
                  ...drawing,
                  published: e.target.checked,
                })
              }
            />
            Published
          </label>
    
          <button
            disabled={busy}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save Drawing"}
          </button>
        </div>
      </form>
    </div>
  );
}
