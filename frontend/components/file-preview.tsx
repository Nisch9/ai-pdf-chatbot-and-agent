'use client';

import { FileIcon, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PDFViewerDialog } from "@/components/pdf-viewer-dialog"

interface FilePreviewProps {
  fileName: string;
  fileUrl?: string;
  onRemove: () => void;
}

export function FilePreview({ fileName, fileUrl, onRemove }: FilePreviewProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <>
      <div 
        className="flex items-center gap-3 glass-effect border border-slate-700/50 rounded-lg p-3 shadow-lg shadow-slate-950/20 hover:bg-slate-800/40 transition-all duration-200 cursor-pointer group"
        onClick={() => setViewerOpen(true)}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md shadow-pink-500/30 relative">
          <FileIcon className="w-6 h-6 text-white" />
          {/* Preview indicator overlay */}
          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-slate-100">{fileName}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span>PDF</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 group-hover:text-blue-300">Click to preview</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <PDFViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        fileName={fileName}
        fileUrl={fileUrl}
      />
    </>
  )
}

