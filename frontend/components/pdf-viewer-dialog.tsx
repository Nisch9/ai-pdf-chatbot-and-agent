'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileIcon, ExternalLink, Download, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface PDFViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl?: string; // Data URL or blob URL
}

export function PDFViewerDialog({ open, onOpenChange, fileName, fileUrl }: PDFViewerDialogProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Reset zoom and rotation when dialog opens
  useEffect(() => {
    if (open) {
      setZoom(100);
      setRotation(0);
    }
  }, [open]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleOpenExternal = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect border-slate-700 max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <FileIcon className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-slate-100 text-sm font-medium truncate max-w-[300px]">
                {fileName}
              </DialogTitle>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-700/50"
                onClick={handleZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4 text-slate-400" />
              </Button>
              <span className="text-xs text-slate-400 min-w-[40px] text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-700/50"
                onClick={handleZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4 text-slate-400" />
              </Button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-700/50"
                onClick={handleRotate}
                title="Rotate"
              >
                <RotateCw className="h-4 w-4 text-slate-400" />
              </Button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-700/50"
                onClick={handleDownload}
                title="Download"
                disabled={!fileUrl}
              >
                <Download className="h-4 w-4 text-slate-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-700/50"
                onClick={handleOpenExternal}
                title="Open in new tab"
                disabled={!fileUrl}
              >
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </Button>
              <div className="w-px h-4 bg-slate-700 mx-2" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <X className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-auto bg-slate-900/50 p-4">
          {fileUrl ? (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-lg border border-slate-700/50 bg-white"
                style={{ minHeight: '60vh' }}
                title={fileName}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <FileIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm">Preview not available</p>
              <p className="text-xs mt-1 opacity-75">
                The file was uploaded but preview data is not stored locally
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-700/50 flex-shrink-0">
          <p className="text-xs text-slate-500">
            💡 Tip: Use zoom controls to adjust the view, or open in a new tab for full features
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
