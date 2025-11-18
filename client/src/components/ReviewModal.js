import React, { useState } from "react";

export default function ReviewModal({ dish, restaurantId, orderId, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ dishName: dish.name, rating, comment, restaurantId, orderId });
      onClose();
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          maxWidth: 500,
          width: "100%",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Rate "{dish.name}"</h3>

        {/* Star Rating */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", letterSpacing: "4px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  cursor: "pointer",
                  color: star <= (hoverRating || rating) ? "#ffc107" : "#ddd",
                  transition: "color 0.15s ease",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <p style={{ margin: "8px 0", color: "#666", fontSize: "0.9rem" }}>
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Comment */}
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Share your experience (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: "0.95rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: rating === 0 ? "#ccc" : "#ff385c",
                color: "#fff",
                cursor: rating === 0 ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
