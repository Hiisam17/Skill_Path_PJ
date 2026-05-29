import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/lib/axios";
import SkillsTreePage from "./SkillsTreePage";

vi.mock("reactflow", async () => {
  const React = await import("react");

  return {
    default: (props: {
      nodes: Array<{
        id: string;
        type?: string;
        data?: Record<string, unknown>;
      }>;
      onNodeClick?: (event: React.MouseEvent, node: unknown) => void;
    }) =>
      React.createElement(
        "div",
        { "data-testid": "skill-tree-canvas" },
        props.nodes.map((node) =>
          React.createElement(
            "button",
            {
              key: node.id,
              type: "button",
              onClick: (event: React.MouseEvent) =>
                props.onNodeClick?.(event, node),
            },
            String(
              node.data?.label ??
                node.data?.title ??
                node.data?.name ??
                node.id,
            ),
          ),
        ),
      ),
    Background: () =>
      React.createElement("div", { "data-testid": "flow-background" }),
    Handle: () => React.createElement("span", { "data-testid": "flow-handle" }),
    Position: {
      Top: "top",
      Bottom: "bottom",
      Left: "left",
      Right: "right",
    },
    PanOnScrollMode: {
      Vertical: "vertical",
    },
    useNodesState: (initialNodes: unknown[]) => {
      const [nodes, setNodes] = React.useState(initialNodes);
      return [nodes, setNodes, vi.fn()];
    },
    useEdgesState: (initialEdges: unknown[]) => {
      const [edges, setEdges] = React.useState(initialEdges);
      return [edges, setEdges, vi.fn()];
    },
  };
});

vi.mock("@/lib/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/utils/layout", () => ({
  getLayoutedElements: (nodes: unknown[], edges: unknown[]) => ({
    nodes,
    edges,
  }),
}));

vi.mock("@/services/progressSyncService", () => ({
  getPendingStatusForRoadmapSkill: vi.fn(() => undefined),
}));

vi.mock("@/components/roadmap/ResourceDrawer", () => ({
  ResourceDrawer: ({
    isOpen,
    isLoading,
    data,
  }: {
    isOpen: boolean;
    isLoading: boolean;
    data: { title?: string } | null;
  }) =>
    isOpen ? (
      <aside aria-label="resource drawer">
        {isLoading ? "Loading detail" : data?.title}
      </aside>
    ) : null,
}));

vi.mock("@/components/roadmap/RoadmapLegend", () => ({
  default: () => <div data-testid="roadmap-legend" />,
}));

const mockedApiClient = vi.mocked(apiClient, true);

function renderSkillTree() {
  return render(
    <MemoryRouter initialEntries={["/roadmaps/Frontend"]}>
      <Routes>
        <Route path="/roadmaps/:title" element={<SkillsTreePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SkillsTreePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  it("renders skill tree nodes from roadmap flow API data", async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        title: "Frontend Developer",
        nodes: [
          { id: "section-1", type: "sectionNode", data: { title: "Basics" } },
          {
            id: "101",
            type: "skillNode",
            data: { roadmapSkillId: 101, label: "React", status: "COMPLETED" },
          },
        ],
        edges: [{ id: "edge-1", source: "section-1", target: "101" }],
      },
    });

    renderSkillTree();

    expect(await screen.findByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Basics")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("opens node detail drawer when a skill node is clicked", async () => {
    mockedApiClient.get
      .mockResolvedValueOnce({
        data: {
          title: "Frontend Developer",
          nodes: [
            {
              id: "101",
              type: "skillNode",
              data: { roadmapSkillId: 101, label: "React" },
            },
          ],
          edges: [],
        },
      })
      .mockResolvedValueOnce({
        data: { title: "React resources" },
      });

    renderSkillTree();

    await userEvent.click(await screen.findByRole("button", { name: "React" }));

    await waitFor(() => {
      expect(mockedApiClient.get).toHaveBeenCalledWith("/roadmaps/101/detail");
    });
    expect(await screen.findByText("React resources")).toBeInTheDocument();
  });
});
