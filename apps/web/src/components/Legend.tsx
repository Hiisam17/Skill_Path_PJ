import "./Legend.css";

export default function Legend() {
  return (
    <div className="legend">
      <div className="legend__title">Status Legend</div>
      <div className="legend__item">
        <div className="legend__dot legend__dot--completed" />
        <span className="legend__label">Completed</span>
      </div>
      <div className="legend__item">
        <div className="legend__dot legend__dot--in-progress" />
        <span className="legend__label">In Progress</span>
      </div>
      <div className="legend__item">
        <div className="legend__dot legend__dot--locked" />
        <span className="legend__label legend__label--locked">Locked</span>
      </div>
    </div>
  );
}
