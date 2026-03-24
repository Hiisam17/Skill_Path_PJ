/**
 * RoadmapPage Component
 * Displays the user's selected roadmap
 * Shows roadmap level and name
 * Navigation to skill tree page
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { RoadmapDto } from "@/types";

/**
 * RoadmapPage Component
 * Fetches user's currently selected roadmap from GET /users/roadmap
 * Displays roadmap details and navigation button to view skills
 *
 * @returns {JSX.Element} Roadmap display
 */
export const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState<RoadmapDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmap = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        setRoadmap(null);
        // TODO: Fetch user's selected roadmap from GET /users/roadmap
        // const response = await api.get<RoadmapDto>('/users/roadmap');
        // setRoadmap(response.data);
        throw new Error("Not implemented");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load roadmap";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  if (isLoading) {
    return <div>Loading roadmap...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!roadmap) {
    return <div>No roadmap selected</div>;
  }

  return (
    <div>
      <h1>Your Roadmap</h1>
      <div>
        <h2>Roadmap ID: {roadmap.id}</h2>
        <p>Career Path ID: {roadmap.careerPathId}</p>
        <p>Level: {roadmap.level}</p>
        <button onClick={() => navigate("/dashboard")}>View Skills</button>
      </div>
    </div>
  );
};
