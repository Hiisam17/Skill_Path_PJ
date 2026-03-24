/**
 * CareerPathPage Component
 * List all available career paths
 * User can select a career path to start a roadmap
 */

import { useState, useEffect } from "react";
import type { CareerPathDto } from "@/types";

/**
 * CareerPathPage Component
 * Fetches list of career paths from backend
 * Displays each as a card with description
 * On selection, calls POST /users/select-roadmap and navigates to /roadmap
 *
 * @returns {JSX.Element} Career path selection list
 */
export const CareerPathPage = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPathDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const fetchCareerPaths = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        setCareerPaths([]);
        // TODO: Fetch career paths from GET /career-paths
        // const response = await api.get<CareerPathDto[]>('/career-paths');
        // setCareerPaths(response.data);
        throw new Error("Not implemented");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load career paths";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareerPaths();
  }, []);

  /**
   * Handle career path selection
   * TODO: Call POST /users/select-roadmap with careerPathId
   * TODO: Navigate to /roadmap on success
   */
  const handleSelect = async (careerPathId: string): Promise<void> => {
    try {
      setSelectedId(careerPathId);
      // TODO: await api.post('/users/select-roadmap', { careerPathId } as SelectRoadmapDto);
      // TODO: navigate('/roadmap');
      throw new Error("Not implemented");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to select career path";
      setError(message);
      setSelectedId(null);
    }
  };

  if (isLoading) {
    return <div>Loading career paths...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Choose Your Career Path</h1>
      <div>
        {careerPaths.map((cp) => (
          <div
            key={cp.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px",
            }}
          >
            <h3>{cp.name}</h3>
            <p>{cp.description}</p>
            <button
              onClick={() => handleSelect(cp.id)}
              disabled={selectedId !== null}
            >
              {selectedId === cp.id ? "Selecting..." : "Select"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
