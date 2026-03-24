/**
 * ProgressBar Component
 * Displays user's learning progress as a visual bar with percentage
 *
 * Props:
 * - completed: Number of completed skills
 * - total: Total number of skills
 */

interface ProgressBarProps {
  completed: number;
  total: number;
}

/**
 * ProgressBar Component
 * Shows progress bar and text: "X/Y skills completed (XX%)"
 * Re-renders automatically when props change
 *
 * @param {ProgressBarProps} props - completed and total counts
 * @returns {JSX.Element} Progress bar visualization
 */
export const ProgressBar = ({ completed, total }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <h3>Your Progress</h3>
      <div
        style={{
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: "#4caf50",
            height: "30px",
            borderRadius: "4px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <p>
        {completed}/{total} skills completed ({percentage}%)
      </p>
    </div>
  );
};
