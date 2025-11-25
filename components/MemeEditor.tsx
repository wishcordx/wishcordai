'use client';

import { useState, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { supabase } from '@/lib/supabase';

interface MemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string | null;
  onSaveToFeed: (imageUrl: string, imagePath: string) => void;
}

export default function MemeEditor({
  isOpen,
  onClose,
  initialImage,
  onSaveToFeed,
}: MemeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  
  // Text styling controls
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    // Create fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#1e1f22',
    });

    fabricCanvasRef.current = canvas;

    // Load initial image if provided
    if (initialImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const fabricImage = new fabric.Image(img);
        const scale = Math.min(
          800 / img.width,
          600 / img.height
        );
        fabricImage.scale(scale);
        fabricImage.set({
          left: 400,
          top: 300,
          originX: 'center',
          originY: 'center',
          selectable: false,
        });
        canvas.add(fabricImage);
        canvas.renderAll();
      };
      img.src = initialImage;
    }

    // Selection event listeners
    canvas.on('selection:created', (e: any) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e: any) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [isOpen, initialImage]);

  // Add text to canvas
  const addText = (preset?: 'top' | 'bottom') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Your Text Here', {
      left: preset === 'top' || preset === 'bottom' 
        ? canvas.width! / 2 
        : 100,
      top: preset === 'top' 
        ? 50 
        : preset === 'bottom' 
        ? canvas.height! - 80 
        : 100,
      fontSize: fontSize,
      fill: textColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      fontFamily: fontFamily,
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  // Update selected text styling
  const updateTextStyle = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();

    if (activeObject && activeObject.type === 'i-text') {
      (activeObject as fabric.IText).set({
        fontSize,
        fill: textColor,
        stroke: strokeColor,
        strokeWidth,
        fontFamily,
      });
      canvas?.renderAll();
    }
  };

  useEffect(() => {
    updateTextStyle();
  }, [fontSize, textColor, strokeColor, strokeWidth, fontFamily]);

  // Delete selected object
  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();

    if (activeObject) {
      canvas?.remove(activeObject);
      canvas?.renderAll();
    }
  };

  // Download meme
  const downloadMeme = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = `wish-meme-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  // Share meme (Web Share API)
  // Save to feed
  const saveToFeed = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isSaving) return;

    setIsSaving(true);

    try {
      // Convert canvas to blob
      const dataURL = canvas.toDataURL({ format: 'png', quality: 0.9, multiplier: 1 });
      const blob = await (await fetch(dataURL)).blob();

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const filePath = `wish-memes/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wish-memes')
        .upload(filePath, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wish-memes')
        .getPublicUrl(filePath);

      // Call parent callback with image data
      onSaveToFeed(publicUrl, filePath);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save meme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">🎨 Meme Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl px-3 py-1"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 h-auto lg:h-[calc(100vh-200px)]">
          {/* Canvas Area - Left side on desktop, top on mobile */}
          <div className="lg:col-span-2 overflow-auto max-h-[50vh] lg:max-h-full">
            <div className="bg-[#1a1b1e] rounded-lg p-4 border border-[#0f1011]">
              <canvas ref={canvasRef} className="border-2 border-[#0f1011] rounded-lg mx-auto max-w-full" />
            </div>
          </div>

          {/* Controls Panel - Right side on desktop, bottom on mobile */}
          <div className="space-y-4 overflow-y-auto max-h-[50vh] lg:max-h-full">
            {/* Add Text Buttons */}
            <div className="bg-[#1e1f22] rounded-lg p-4 border border-[#0f1011]">
              <h3 className="text-white font-semibold mb-3">Add Text</h3>
              <div className="space-y-2">
                <button
                  onClick={() => addText('top')}
                  className="w-full px-4 py-2 bg-[#202225] hover:bg-[#2a2b2f] text-white rounded-lg transition-colors"
                >
                  ➕ Top Text
                </button>
                <button
                  onClick={() => addText('bottom')}
                  className="w-full px-4 py-2 bg-[#202225] hover:bg-[#2a2b2f] text-white rounded-lg transition-colors"
                >
                  ➕ Bottom Text
                </button>
                <button
                  onClick={() => addText()}
                  className="w-full px-4 py-2 bg-[#202225] hover:bg-[#2a2b2f] text-white rounded-lg transition-colors"
                >
                  ➕ Custom Text
                </button>
              </div>
            </div>

            {/* Text Styling */}
            <div className="bg-[#1e1f22] rounded-lg p-4 border border-[#0f1011]">
              <h3 className="text-white font-semibold mb-3">Text Style</h3>
              <div className="space-y-3">
                {/* Font Size */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 bg-[#202225] text-white rounded-lg border border-[#0f1011]"
                  >
                    <option value="Impact">Impact (Classic)</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Comic Sans MS">Comic Sans</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>

                {/* Text Color */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Stroke Color */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Outline Color</label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Stroke Width */}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Outline Width: {strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {selectedObject && (
              <button
                onClick={deleteSelected}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                🗑️ Delete Selected
              </button>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={downloadMeme}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                ⬇️ Download
              </button>
              <button
                onClick={saveToFeed}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '⏳ Saving...' : '📮 Send to Feed'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
