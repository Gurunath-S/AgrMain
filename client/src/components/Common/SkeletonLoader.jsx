import React from "react";
import "./SkeletonLoader.css";

const SkeletonLoader = ({ type = "table", rows = 5, cols = 4, fields = 4, count = 3 }) => {
  const pulseClass = "skeleton-pulse";

  // Table Skeleton
  if (type === "table") {
    return (
      <div className="skeleton-table-container">
        {/* Header row */}
        <div className="skeleton-table-header">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`th-${i}`} className={`skeleton-bar header-bar ${pulseClass}`} />
          ))}
        </div>
        
        {/* Table Body rows */}
        <div className="skeleton-table-body">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={`tr-${r}`} className="skeleton-table-row">
              {Array.from({ length: cols }).map((_, c) => {
                // Varying widths for natural text feel
                const widthStyle = c === 0 ? "40%" : c === cols - 1 ? "60%" : "80%";
                return (
                  <div key={`td-${r}-${c}`} className="skeleton-cell">
                    <div 
                      className={`skeleton-bar body-bar ${pulseClass}`} 
                      style={{ width: widthStyle }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Form Skeleton
  if (type === "form") {
    return (
      <div className="skeleton-form-container">
        <div className="skeleton-form-grid">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={`field-${i}`} className="skeleton-form-field">
              {/* Field Label */}
              <div className={`skeleton-bar label-bar ${pulseClass}`} />
              {/* Field Input Box */}
              <div className={`skeleton-input-box ${pulseClass}`} />
            </div>
          ))}
        </div>
        {/* Action Button */}
        <div className={`skeleton-btn ${pulseClass}`} />
      </div>
    );
  }

  // Card Grid Skeleton
  if (type === "card") {
    return (
      <div className="skeleton-cards-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={`card-${i}`} className="skeleton-card">
            {/* Card Image / Circle Area */}
            <div className={`skeleton-card-thumbnail ${pulseClass}`} />
            {/* Card Text lines */}
            <div className="skeleton-card-content">
              <div className={`skeleton-bar title-bar ${pulseClass}`} />
              <div className={`skeleton-bar text-bar ${pulseClass}`} style={{ width: "85%" }} />
              <div className={`skeleton-bar text-bar ${pulseClass}`} style={{ width: "55%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
