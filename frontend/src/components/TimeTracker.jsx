import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./TimeTracker.css";

const TimeTracker = forwardRef((props, ref) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Mengekspos fungsi ke Dashboard via ref
  useImperativeHandle(ref, () => ({
    resetTimer: () => {
      setIsActive(false);
      setSeconds(0);
    },
    getSeconds: () => seconds,
  }));

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const getHours = Math.floor(totalSeconds / 3600);
    const getMinutes = Math.floor((totalSeconds % 3600) / 60);
    const getSeconds = totalSeconds % 60;
    return `${String(getHours).padStart(2, "0")}:${String(getMinutes).padStart(2, "0")}:${String(getSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="time-tracker-card">
      <h3 className="tracker-title">⏱️ Time Tracker</h3>
      <div className="tracker-display">{formatTime(seconds)}</div>
      <div className="tracker-actions">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`btn-toggle ${isActive ? "stop" : "start"}`}
        >
          {isActive ? "Stop" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}
          className="btn-reset"
        >
          Reset
        </button>
      </div>
    </div>
  );
});

export default TimeTracker;
