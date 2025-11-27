'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as fabric from 'fabric';
import { motion } from 'framer-motion';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState('Impact');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(48);
  const [isSaving, setIsSaving] = useState(false);

  // Font options
  const fonts = [
    'Impact',
    'Arial Black',
    'Comic Sans MS',
    'Times New Roman',
    'Courier New',
    'Verdana',
  ];

  useEffect(() => {
    // Get image from session storage
    const storedImage = sessionStorage.getItem('editorImage');
    if (storedImage) {
      setImageData(storedImage);
    } else {
      // If no image, redirect back
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (!canvasRef.current || !imageData) return;

    const canvasWidth = window.innerWidth < 768 ? window.innerWidth - 32 : 800;
    const canvasHeight = window.innerWidth < 768 ? window.innerHeight - 200 : 600;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#1a1a1a',
    });
    fabricCanvasRef.current = canvas;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const fabricImage = new fabric.Image(img);
      const scale = Math.min(
        canvasWidth / img.width,
        canvasHeight / img.height
      );
      fabricImage.scale(scale);
      fabricImage.set({
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      canvas.add(fabricImage);
      canvas.renderAll();
    };
    img.src = imageData;

    return () => {
      canvas.dispose();
    };
  }, [imageData]);

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Your Text', {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: selectedFont,
      fontSize: fontSize,
      fill: textColor,
      stroke: '#000000',
      strokeWidth: 2,
      textAlign: 'center',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const updateTextStyle = (property: string, value: any) => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      (activeObject as fabric.IText).set(property as any, value);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleSaveToFeed = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setIsSaving(true);

    try {
      // Export canvas as base64
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 1,
      });

      // Store in session storage
      sessionStorage.setItem('editedImage', dataURL);
      sessionStorage.removeItem('editorImage');

      // Navigate back to main page
      router.push('/');
    } catch (error) {
      console.error('Failed to save image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('editorImage');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1e1f2e] border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Cancel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Meme Editor</h1>
        </div>
        <button
          onClick={handleSaveToFeed}
          disabled={isSaving}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Send to Feed
            </>
          )}
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[#0b0c15] overflow-auto">
          <canvas ref={canvasRef} className="shadow-2xl" />
        </div>

        {/* Toolbar */}
        <aside className="w-full lg:w-80 bg-[#1e1f2e] border-t lg:border-t-0 lg:border-l border-white/10 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Add Text Button */}
            <div>
              <button
                onClick={addText}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Text
              </button>
            </div>

            {/* Font Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Font</label>
              <select
                value={selectedFont}
                onChange={(e) => {
                  setSelectedFont(e.target.value);
                  updateTextStyle('fontFamily', e.target.value);
                }}
                className="w-full px-3 py-2 bg-[#11121c] border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="120"
                value={fontSize}
                onChange={(e) => {
                  const size = parseInt(e.target.value);
                  setFontSize(size);
                  updateTextStyle('fontSize', size);
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateTextStyle('fill', e.target.value);
                  }}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
                <div
                  className="w-10 h-10 rounded-lg border border-white/10"
                  style={{ backgroundColor: textColor }}
                />
              </div>
            </div>

            {/* Delete Button */}
            <div>
              <button
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg font-medium transition-colors border border-red-600/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-400 mb-2">How to use:</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Click "Add Text" to insert text</li>
                <li>• Double-click text to edit</li>
                <li>• Drag text to move</li>
                <li>• Click corners to resize</li>
                <li>• Select & customize in sidebar</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0c15] flex items-center justify-center">
        <div className="text-white">Loading editor...</div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
