import { useState } from "react";
import { Image, Video, Download, Trash2 } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { getSessionMedia, getStoredMedia } from "../utils/mediaStore";

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  const session = getSessionMedia();
  const stored = getStoredMedia();
  const all = session.length > 0 ? session : stored;

  if (all.length === 0) {
    return (
      <div className="p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Gallery</h1>
            <p className="text-gray-400 text-sm">Photos and videos captured by E.D.I.T.H.</p>
          </div>
          <div className="text-center py-16">
            <Image size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No media captured yet.</p>
            <p className="text-gray-600 text-xs mt-1">Say "take a picture" or "start recording" on the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Gallery</h1>
          <p className="text-gray-400 text-sm">{all.length} items captured.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {all.map(item => (
            <GlassCard key={item.id} className="!p-3 cursor-pointer hover:border-white/20 transition-colors" onClick={() => setSelected(item)}>
              <div className="aspect-square rounded-lg bg-black/60 flex items-center justify-center overflow-hidden relative mb-2">
                {item.type === "photo" && item.dataUrl ? (
                  <img src={item.dataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Video size={32} className="text-gray-600" />
                )}
                <div className="absolute top-2 right-2">
                  {item.type === "photo" ? (
                    <Image size={12} className="text-white/80" />
                  ) : (
                    <Video size={12} className="text-white/80" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span className="text-[10px] font-mono text-gray-600">{item.type}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setSelected(null)}>
          <div className="max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {selected.type === "photo" && selected.dataUrl ? (
              <img src={selected.dataUrl} alt="" className="max-w-full max-h-[80vh] rounded-xl" />
            ) : (
              <div className="w-96 h-64 bg-white/5 rounded-xl flex items-center justify-center">
                <Video size={48} className="text-gray-600" />
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-white">{selected.type === "photo" ? "Photo" : "Video"}</p>
                <p className="text-xs text-gray-500">{new Date(selected.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                {selected.dataUrl && (
                  <a href={selected.dataUrl} download={selected.fileName} className="text-xs font-mono text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <Download size={14} /> Download
                  </a>
                )}
                <button onClick={() => {
                  const meta = JSON.parse(localStorage.getItem("edith_media") || "[]");
                  const filtered = meta.filter(m => m.id !== selected.id);
                  localStorage.setItem("edith_media", JSON.stringify(filtered));
                  setSelected(null);
                  window.location.reload();
                }} className="text-xs font-mono text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
                <button onClick={() => setSelected(null)} className="text-xs font-mono text-gray-400 hover:text-white transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
