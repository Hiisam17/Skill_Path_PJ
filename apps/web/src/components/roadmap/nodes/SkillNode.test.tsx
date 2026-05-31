import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SkillNode from "./SkillNode";
import SectionNode from "./SectionNode";

vi.mock("reactflow", () => ({
  Handle: () => <span data-testid="flow-handle" />,
  Position: {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right",
  },
}));

describe("roadmap flow nodes", () => {
  it("renders completed skill node with completed visual state", () => {
    const { container } = render(
      <SkillNode
        id="101"
        type="skillNode"
        selected={false}
        dragging={false}
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
        data={{ label: "react", status: "COMPLETED" }}
      />,
    );

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-cyan-400");
  });

  it("renders highlighted missing skill node from JD analysis", () => {
    const { container } = render(
      <SkillNode
        id="102"
        type="skillNode"
        selected={false}
        dragging={false}
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
        data={{ label: "TypeScript", isHighlighted: true }}
      />,
    );

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-rose-400");
  });

  it("renders section progress based on completed and total skill counts", () => {
    render(
      <SectionNode
        id="section-1"
        type="sectionNode"
        selected={false}
        dragging={false}
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
        data={{ title: "Frontend Basics", completedCount: 2, totalCount: 4 }}
      />,
    );

    expect(screen.getByText("Frontend Basics")).toBeInTheDocument();
    expect(screen.getAllByTestId("flow-handle")).toHaveLength(4);
  });
});
