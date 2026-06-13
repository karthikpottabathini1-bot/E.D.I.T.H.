import { useState, useMemo } from "react";
import { Image, Video, Download, Trash2, X } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { getSessionMedia, getStoredMedia, deleteMedia, clearAllMedia } from "../utils/mediaStore";

export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const [, forceUpdate] = useState(0);

  const all = useMemo(() => {
    const session = getSessionMedia();
    const stored = getStoredMedia();
    return session.length > 0 ? session : stored;
  }, [selected]);

  const handleDelete = (id) => {
    deleteMedia(id);
    if (selected?.id === id) setSelected(null);
    forceUpdate(n => n + 1);
  };

  const handleDeleteAll = () => {
    clearAllMedia();
    setSelected(null);
    forceUpdate(n => n + 1);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-semibold mb-1">Gallery</h1>
            <p className="text-gray-400 text-sm">{all.length} items captured.</p>
          </div>
          <button onClick={handleDeleteAll}
            className="text-xs font-mono text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5">
            <Trash2 size={14} /> Delete all
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {all.map(item => (
            <GlassCard key={item.id} className="!p-3 group relative">
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:border-red-500/30">
                <X size={12} className="text-red-400" />
              </button>
              <div className="aspect-square rounded-lg bg-black/60 flex items-center justify-center overflow-hidden relative mb-2 cursor-pointer"
                onClick={() => setSelected(item)}>
                {item.type === "photo" && item.dataUrl ? (
                  <img src={item.dataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Video size={32} className="text-gray-600" />
                )}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/50">
                  {item.type === "photo" ? (
                    <Image size={10} className="text-white/70" />
                  ) : (
                    <Video size={10} className="text-white/70" />
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
                <button onClick={() => handleDelete(selected.id)}
                  className="text-xs font-mono text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
                <button onClick={() => setSelected(null)} className="text-xs font-mono text-gray-400 hover:text-white transition-colors">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
