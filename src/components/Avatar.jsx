const COLORS = ["#d8e7d5", "#f1d9ce", "#d8def2", "#f0e6c9"];

export default function Avatar({ name, small = false }) {
  const color = COLORS[name.charCodeAt(0) % COLORS.length];

  return (
    <div
      className={`avatar${small ? " avatar-small" : ""}`}
      style={{ "--avatar-color": color }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
