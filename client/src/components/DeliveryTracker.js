import React, { useEffect, useState } from "react";

export default function DeliveryTracker({ order }) {
  const currentStatus = order.status;
  const [animateStage, setAnimateStage] = useState(null);

  const stages = ["Paid", "Preparing", "Out for Delivery", "Delivered"];
  const currentStageIndex = stages.indexOf(currentStatus);

  // Trigger animation when status changes
  useEffect(() => {
    setAnimateStage(currentStageIndex);
    const timer = setTimeout(() => setAnimateStage(null), 800);
    return () => clearTimeout(timer);
  }, [currentStageIndex]);

  const getStageIcon = (stage) => {
    switch (stage) {
      case "Paid":
        return "💳";
      case "Preparing":
        return "👨‍🍳";
      case "Out for Delivery":
        return "🚚";
      case "Delivered":
        return "✅";
      default:
        return "⏳";
    }
  };

  const getProgressPercentage = () => {
    return ((currentStageIndex + 1) / stages.length) * 100;
  };

  const isStageComplete = (index) => index <= currentStageIndex;
  const isCurrentStage = (index) => index === currentStageIndex;

  return (
    <div
      className="delivery-tracker"
      style={{
        background: "#f8f9fa",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "1.1em" }}>
          📍 Delivery Tracking
        </h4>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          position: "relative",
          height: "6px",
          background: "#e0e0e0",
          borderRadius: "3px",
          marginBottom: "30px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${getProgressPercentage()}%`,
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "3px",
            transition: "width 0.8s ease-in-out",
          }}
        />
      </div>

      {/* Status Stages */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {stages.map((stage, index) => (
          <div
            key={stage}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Stage Icon/Circle */}
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: isStageComplete(index)
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5em",
                marginBottom: "10px",
                boxShadow: isCurrentStage(index)
                  ? "0 0 0 4px rgba(102, 126, 234, 0.3)"
                  : "none",
                animation: isCurrentStage(index) ? "pulse 2s infinite" : "none",
                transition: "all 0.5s ease",
                zIndex: 1,
                opacity: animateStage === index ? 0 : 1,
                transform: animateStage === index ? "scale(1.2)" : "scale(1)",
              }}
              key={`stage-${index}-${currentStatus}`}
            >
              {getStageIcon(stage)}
            </div>

            {/* Stage Label */}
            <div
              style={{
                fontSize: "0.75em",
                color: isStageComplete(index) ? "#333" : "#999",
                fontWeight: isCurrentStage(index) ? "bold" : "normal",
                textAlign: "center",
                maxWidth: "80px",
              }}
            >
              {stage}
            </div>

            {/* Animated vehicle for Out for Delivery */}
            {isCurrentStage(index) && stage === "Out for Delivery" && (
              <div
                style={{
                  position: "absolute",
                  bottom: "70px",
                  fontSize: "2em",
                  animation: "bounce 1s infinite",
                }}
              >
                🚚
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ETA Display */}
      {currentStatus !== "Delivered" && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#fff",
            borderRadius: "8px",
            textAlign: "center",
            border: "1px dashed #ddd",
          }}
        >
          <p style={{ margin: 0, color: "#666", fontSize: "0.9em" }}>
            {currentStatus === "Paid" && "⏰ Estimated time: 30-40 minutes"}
            {currentStatus === "Preparing" && "⏰ Estimated time: 20-30 minutes"}
            {currentStatus === "Out for Delivery" &&
              "⏰ Estimated time: 10-15 minutes"}
          </p>
        </div>
      )}

      {/* Completion Message */}
      {currentStatus === "Delivered" && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          🎉 Your order has been delivered! Enjoy your meal!
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
}
