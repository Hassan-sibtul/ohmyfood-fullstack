import React, { useEffect, useState } from "react";

export default function Toast({ message, visible, duration = 2500, onClose }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const t = setTimeout(() => {
        setShow(false);
        onClose && onClose();
      }, duration);
      return () => clearTimeout(t);
    }
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: "0.95rem",
        boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        zIndex: 9999,
        opacity: show ? 1 : 0,
        transition: "opacity 300ms ease, transform 300ms ease",
        animation: "toast-fade 300ms ease",
        maxWidth: 360,
        textAlign: "center",
      }}
    >
      {message}
      <style>{`
        @keyframes toast-fade {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
