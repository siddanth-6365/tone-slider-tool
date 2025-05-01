import React, { useState, useEffect } from "react";
import useToneStore from "../store/toneStore";

const ToneChangerGrid = ({ onToneChange }) => {
  const { tones } = useToneStore();
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);

  // Initialize position based on stored tones
  useEffect(() => {
    if (tones.length > 0) {
      // Find the expanded and casual weights to determine position
      const expandedTone = tones.find(t => t.tone === "expanded");
      const casualTone = tones.find(t => t.tone === "casual");
      
      const expandedWeight = expandedTone ? expandedTone.weight : 0;
      const casualWeight = casualTone ? casualTone.weight : 0;
      
      // Only update if we have valid weights
      if (expandedWeight > 0 || casualWeight > 0) {
        setPosition({
          x: expandedWeight * 100,
          y: casualWeight * 100
        });
      } else if (tones.length === 0) {
        // Reset to center if no tones
        setPosition({ x: 50, y: 50 });
      }
    } else {
      // Reset to center if no tones
      setPosition({ x: 50, y: 50 });
    }
  }, [tones]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isInCenterCell()) {
      setPosition({ x: 50, y: 50 });
      onToneChange([]);
    } else {
      onToneChange(getTones());
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updatePosition(e);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    updatePositionTouch(e);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      updatePositionTouch(e);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

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

  const isInCenterCell = () => {
    return (
      position.x > 33.33 &&
      position.x < 66.66 &&
      position.y > 33.33 &&
      position.y < 66.66
    );
  };

  const getTones = () => {
    const conciseWeight = 1 - position.x / 100;
    const casualWeight = position.y / 100;
    const professionalWeight = 1 - casualWeight;
    const expandedWeight = position.x / 100;

    const getWeight = (weight) => {
      return isInCenterCell() ? 0 : parseFloat(weight.toFixed(2));
    };

    const tones = [
      { tone: "concise", weight: getWeight(conciseWeight) },
      { tone: "casual", weight: getWeight(casualWeight) },
      { tone: "professional", weight: getWeight(professionalWeight) },
      { tone: "expanded", weight: getWeight(expandedWeight) },
    ];

    return tones.filter(t => t.weight > 0).sort((a, b) => b.weight - a.weight);
  };

  const getLabelOpacity = (quadrant) => {
    const thresholds = {
      professional: position.y < 50,
      casual: position.y >= 50,
      concise: position.x < 50,
      expanded: position.x >= 50,
    };
    
    if (thresholds[quadrant]) {
      return thresholds[quadrant] ? "opacity-100 font-bold" : "opacity-50";
    }
    
    return "opacity-50";
  };

  const getQuadrantHighlight = (quadrant) => {
    const isActive = {
      topLeft: position.x < 33.33 && position.y < 33.33,
      topCenter: position.x >= 33.33 && position.x <= 66.66 && position.y < 33.33,
      topRight: position.x > 66.66 && position.y < 33.33,
      middleLeft: position.x < 33.33 && position.y >= 33.33 && position.y <= 66.66,
      center: isInCenterCell(),
      middleRight: position.x > 66.66 && position.y >= 33.33 && position.y <= 66.66,
      bottomLeft: position.x < 33.33 && position.y > 66.66,
      bottomCenter: position.x >= 33.33 && position.x <= 66.66 && position.y > 66.66,
      bottomRight: position.x > 66.66 && position.y > 66.66,
    };

    return isActive[quadrant] ? "bg-slate-700/30" : "";
  };

  return (
    <div className="w-full h-full aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-700">
      <div
        className="relative w-full h-full cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
        
        <div className="absolute top-0 left-0 w-full h-full text-xs font-medium text-slate-300 flex items-center justify-center pointer-events-none">
          <span
            className={`absolute top-3 left-1/2 transform -translate-x-1/2 transition-opacity ${getLabelOpacity(
              "professional"
            )}`}
          >
            Professional
          </span>
          <span
            className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-opacity ${getLabelOpacity(
              "casual"
            )}`}
          >
            Casual
          </span>
          <span
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 -rotate-90 transition-opacity ${getLabelOpacity(
              "concise"
            )}`}
          >
            Concise
          </span>
          <span
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 transition-opacity ${getLabelOpacity(
              "expanded"
            )}`}
          >
            Expanded
          </span>
          {isInCenterCell() && (
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-700 px-3 py-1 rounded-full text-white text-xs font-medium">
              Reset Tones
            </span>
          )}
        </div>
        
        <div
          className={`absolute w-6 h-6 rounded-full ${
            isInCenterCell() ? "bg-slate-500 shadow-slate-500/50" : "bg-indigo-500 shadow-indigo-500/50"
          } transform -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-lg transition-all duration-300 ease-in-out outline outline-2 outline-white/30`}
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        />
      </div>
    </div>
  );
};

export default ToneChangerGrid;