import React, { useState, useEffect } from "react";
import useToneStore from "../store/toneStore";

const ToneChangerGrid = ({ onToneChange }) => {
  const { tones } = useToneStore();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (tones.length === 0) {
      setPosition({ x: 50, y: 50 });
    } else {
      // Reconstruct grid cell from tones
      const toneMap = tones.reduce(
        (acc, { tone, weight }) => ({ ...acc, [tone]: weight }),
        { concise: 0, casual: 0, professional: 0, expanded: 0 }
      );
      let row, col;

      if (toneMap.professional === 1) { row = 0; col = 1; }
      else if (toneMap.casual === 1) { row = 2; col = 1; }
      else if (toneMap.concise === 1) { row = 1; col = 0; }
      else if (toneMap.expanded === 1) { row = 1; col = 2; }

      else if (toneMap.professional > 0 && toneMap.concise > 0) { row = 0; col = 0; }
      else if (toneMap.professional > 0 && toneMap.expanded > 0) { row = 0; col = 2; }
      else if (toneMap.casual > 0 && toneMap.concise > 0) { row = 2; col = 0; }
      else if (toneMap.casual > 0 && toneMap.expanded > 0) { row = 2; col = 2; }
      else {
        const x = toneMap.expanded * 100;
        const y = toneMap.casual * 100;
        setPosition({ x, y });
        return;
      }
      const cellSize = 100 / 3;
      setPosition({ x: (col + 0.5) * cellSize, y: (row + 0.5) * cellSize });
    }
  }, [tones]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updatePosition(e);
  };
  const handleMouseMove = (e) => { if (isDragging) updatePosition(e); };
  const handleMouseUp = () => {
    setIsDragging(false);
    const { row, col } = getCell(position.x, position.y);
    const weights = calculateWeights(row, col);

    if (row === 1 && col === 1) {
      setPosition({ x: 50, y: 50 });
      onToneChange([]);
      return;
    }

    const cellSize = 100 / 3;
    setPosition({ x: (col + 0.5) * cellSize, y: (row + 0.5) * cellSize });

    const result = Object.entries(weights)
      .filter(([_, w]) => w > 0)
      .map(([tone, w]) => ({ tone, weight: parseFloat((w).toFixed(2)) }))
      .sort((a, b) => b.weight - a.weight);

    onToneChange(result);
  };


  const handleTouchStart = (e) => { setIsDragging(true); updatePositionTouch(e); };
  const handleTouchMove = (e) => { if (isDragging) { updatePositionTouch(e); e.preventDefault(); } };
  const handleTouchEnd = () => { handleMouseUp(); };

  const updatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), rect.height);
    setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };
  const updatePositionTouch = (e) => {
    if (e.touches && e.touches[0]) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(Math.max(0, e.touches[0].clientX - rect.left), rect.width);
      const y = Math.min(Math.max(0, e.touches[0].clientY - rect.top), rect.height);
      setPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    }
  };

  const getCell = (xPct, yPct) => {
    const idx = val => Math.min(2, Math.floor(val / (100 / 3)));
    return { row: idx(yPct), col: idx(xPct) };
  };

  const calculateWeights = (row, col) => {
    const w = { concise: 0, casual: 0, professional: 0, expanded: 0 };
    if (row === 1 && col === 1) return w;

    // Top row -> professional
    if (row === 0) {
      if (col === 1) w.professional = 1;
      if (col === 0) { w.professional = 0.5; w.concise = 0.5; }
      if (col === 2) { w.professional = 0.5; w.expanded = 0.5; }
    }
    // Middle row -> concise/expanded
    if (row === 1) {
      if (col === 0) w.concise = 1;
      if (col === 2) w.expanded = 1;
    }
    // Bottom row -> casual
    if (row === 2) {
      if (col === 1) w.casual = 1;
      if (col === 0) { w.casual = 0.5; w.concise = 0.5; }
      if (col === 2) { w.casual = 0.5; w.expanded = 0.5; }
    }
    return w;
  };

  const getLabelOpacity = (tone) => {
    const cond = {
      professional: position.y < 50,
      casual: position.y > 50,
      concise: position.x < 50,
      expanded: position.x > 50,
    };
    return cond[tone] ? "opacity-100 font-bold" : "opacity-50";
  };

  // Cell highlight
  const getQuadrantHighlight = (q) => {
    const p = position;
    const on = {
      topLeft: p.x < 33.33 && p.y < 33.33,
      topCenter: p.x >= 33.33 && p.x <= 66.66 && p.y < 33.33,
      topRight: p.x > 66.66 && p.y < 33.33,
      middleLeft: p.x < 33.33 && p.y >= 33.33 && p.y <= 66.66,
      center: p.x > 33.33 && p.x < 66.66 && p.y > 33.33 && p.y < 66.66,
      middleRight: p.x > 66.66 && p.y >= 33.33 && p.y <= 66.66,
      bottomLeft: p.x < 33.33 && p.y > 66.66,
      bottomCenter: p.x >= 33.33 && p.x <= 66.66 && p.y > 66.66,
      bottomRight: p.x > 66.66 && p.y > 66.66,
    };
    return on[q] ? "bg-slate-700/30" : "";
  };

  return (
    <div className="w-full h-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-700">
      <div
        className="relative w-full h-full cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3x3 grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("topLeft")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("topCenter")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("topRight")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("middleLeft")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("center")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("middleRight")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("bottomLeft")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("bottomCenter")}`} />
          <div className={`border border-slate-700/50 ${getQuadrantHighlight("bottomRight")}`} />
        </div>
        {/* Labels */}
        <div className="absolute inset-0 text-xs font-medium text-slate-300 flex items-center justify-center pointer-events-none">
          <span className={`absolute top-3 left-1/2 transform -translate-x-1/2 ${getLabelOpacity("professional")}`}>Professional</span>
          <span className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 ${getLabelOpacity("casual")}`}>Casual</span>
          <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 -rotate-90 ${getLabelOpacity("concise")}`}>Concise</span>
          <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 ${getLabelOpacity("expanded")}`}>Expanded</span>
          {/* Reset badge when not center */}
          {!getQuadrantHighlight("center") && (
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-700 px-3 py-1 rounded-full text-white text-xs font-medium">
              Reset Tones
            </span>
          )}
        </div>
        {/* Draggable marker */}
        <div
          className={`absolute w-6 h-6 rounded-full ${getQuadrantHighlight("center")
            ? "bg-slate-500 shadow-slate-500/50"
            : "bg-indigo-500 shadow-indigo-500/50"
            } transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg transition-all duration-300 ease-in-out outline outline-2 outline-white/30`}
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        />
      </div>
    </div>
  );
};

export default ToneChangerGrid;
