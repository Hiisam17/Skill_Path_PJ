import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { SkillDto } from "@/types";

interface SkillTreeProps {
  skills: SkillDto[];
  onMarkComplete: (skillId: string) => void;
}

export const SkillTree = ({ skills, onMarkComplete }: SkillTreeProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const sortedSkills = [...skills].sort((a, b) => a.orderIndex - b.orderIndex);

    const width = 720;
    const startY = 40;
    const rowHeight = 90;
    const nodeX = 40;
    const nodeRadius = 14;
    const height = Math.max(140, startY * 2 + (sortedSkills.length - 1) * rowHeight);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("background", "#ffffff");

    const rootGroup = svg.append("g").attr("transform", "translate(24, 0)");

    const links = sortedSkills.slice(0, -1).map((_, index) => ({
      fromIndex: index,
      toIndex: index + 1,
    }));

    rootGroup
      .selectAll<SVGLineElement, { fromIndex: number; toIndex: number }>("line.skill-link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "skill-link")
      .attr("x1", nodeX)
      .attr("x2", nodeX)
      .attr("y1", (d) => startY + d.fromIndex * rowHeight)
      .attr("y2", (d) => startY + d.toIndex * rowHeight)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2);

    const nodes = rootGroup
      .selectAll<SVGGElement, SkillDto>("g.skill-node")
      .data(sortedSkills, (d) => d.id)
      .enter()
      .append("g")
      .attr("class", "skill-node")
      .attr("transform", (_, index) => `translate(0, ${startY + index * rowHeight})`)
      .style("cursor", (d) => (d.status === "COMPLETED" ? "default" : "pointer"))
      .on("click", (_, skill) => {
        if (skill.status !== "COMPLETED") {
          onMarkComplete(skill.id);
        }
      });

    nodes
      .append("circle")
      .attr("cx", nodeX)
      .attr("cy", 0)
      .attr("r", nodeRadius)
      .attr("fill", (d) => (d.status === "COMPLETED" ? "#16a34a" : "#9ca3af"))
      .attr("stroke", "#0f172a")
      .attr("stroke-width", 1);

    nodes
      .append("text")
      .attr("x", nodeX + 28)
      .attr("y", -4)
      .attr("fill", "#0f172a")
      .style("font-size", "15px")
      .style("font-weight", "600")
      .text((d) => d.name);

    nodes
      .append("text")
      .attr("x", nodeX + 28)
      .attr("y", 16)
      .attr("fill", "#475569")
      .style("font-size", "12px")
      .text((d) => d.status ?? "NOT_STARTED");

    return () => {
      svg.selectAll("*").remove();
    };
  }, [skills, onMarkComplete]);

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
      <svg ref={svgRef} aria-label="Skill tree visualization" />
    </div>
  );
};
