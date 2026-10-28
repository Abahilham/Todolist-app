import React, { useState } from "react";
import "./CalendarView.css";

export default function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Nama-nama bulan & hari
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  // Menentukan hari pertama bulan ini dan jumlah hari
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigasi Bulan
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Mengelompokkan tugas berdasarkan tanggalnya
  const getTasksForDay = (day) => {
    const formattedDay = String(day).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    const dateString = `${year}-${formattedMonth}-${formattedDay}`;

    return tasks.filter((task) => {
      if (!task.due_date) return false;
      // Ambil bagian tanggalnya saja (10 karakter pertama: "YYYY-MM-DD")
      const taskDate = task.due_date.substring(0, 10);
      return taskDate === dateString;
    });
  };

  // Membuat Array Slot Hari Kalender
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null); // Slot kosong sebelum tanggal 1
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="calendar-container">
      {/* Header Kalender & Navigasi */}
      <div className="calendar-header">
        <h2>
          {monthNames[month]} {year}
        </h2>
        <div className="calendar-nav">
          <button onClick={prevMonth} className="btn-nav">
            ◀
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-today"
          >
            Hari Ini
          </button>
          <button onClick={nextMonth} className="btn-nav">
            ▶
          </button>
        </div>
      </div>

      {/* Grid Nama Hari */}
      <div className="calendar-days-header">
        {dayNames.map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Tanggal */}
      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (!day)
            return <div key={index} className="calendar-cell empty"></div>;

          const dayTasks = getTasksForDay(day);
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`calendar-cell ${isToday ? "today" : ""}`}
            >
              <div className="cell-header">
                <span className="day-number">{day}</span>
                {dayTasks.length > 0 && (
                  <span className="task-count">{dayTasks.length} tugas</span>
                )}
              </div>

              <div className="cell-tasks">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`calendar-task-chip priority-${task.priority || "medium"}`}
                  >
                    <span className="task-dot">●</span>
                    <span className="task-title-text">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
