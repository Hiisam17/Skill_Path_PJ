import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { SkillDto } from "@/types";
import "./SkillTree.css";

interface SkillTreeProps {
  skills: SkillDto[];
  onMarkComplete: (skillId: string) => void;
}

export const SkillTree = ({ skills, onMarkComplete }: SkillTreeProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !skills.length) {
      return;
    }

    const sortedSkills = [...skills].sort((a, b) => a.orderIndex - b.orderIndex);

    const nodeWidth = 240;
    const nodeHeight = 80;
    const rowHeight = 140;
    const colWidth = 280;
    const startX = 40;
    const startY = 40;

    // Calculate grid layout: 2 columns
    const nodePositions = sortedSkills.map((skill, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      return {
        x: startX + col * colWidth,
        y: startY + row * rowHeight,
        skill,
      };
    });

    const width = startX * 2 + colWidth * 2;
    const height = startY * 2 + Math.ceil(sortedSkills.length / 2) * rowHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("background", "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)");

    // Draw connecting lines
    const lines = nodePositions.slice(0, -1).map((pos, idx) => {
      const nextPos = nodePositions[idx + 1];
      return { from: pos, to: nextPos };
    });

    svg
      .selectAll<SVGLineElement, (typeof lines)[0]>("line.connection")
      .data(lines)
      .enter()
      .append("line")
      .attr("class", "connection")
      .attr("x1", (d) => d.from.x + nodeWidth / 2)
      .attr("y1", (d) => d.from.y + nodeHeight)
      .attr("x2", (d) => d.to.x + nodeWidth / 2)
      .attr("y2", (d) => d.to.y)
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Draw nodes
    const nodeGroups = svg
      .selectAll<SVGGElement, (typeof nodePositions)[0]>("g.skill-node-group")
      .data(nodePositions, (d) => d.skill.id)
      .enter()
      .append("g")
      .attr("class", "skill-node-group")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    // Node background (rectangle)
    nodeGroups
      .append("rect")
      .attr("class", "skill-node-bg")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d) => {
        if (d.skill.status === "COMPLETED") return "#10b981";
        return "#3b82f6";
      })
      .attr("stroke", (d) => {
        if (d.skill.status === "COMPLETED") return "#059669";
        return "#2563eb";
      })
      .attr("stroke-width", 2)
      .style("transition", "all 0.3s ease")
      .style("opacity", 0.95);

    // Checkmark icon for completed skills
    nodeGroups
      .filter((d) => d.skill.status === "COMPLETED")
      .append("text")
      .attr("class", "checkmark")
      .attr("x", nodeWidth - 16)
      .attr("y", 16)
      .attr("text-anchor", "end")
      .attr("fill", "white")
      .attr("font-size", "20px")
      .text("✓");

    // Skill name
    nodeGroups
      .append("text")
      .attr("class", "skill-name")
      .attr("x", 12)
      .attr("y", 28)
      .attr("fill", "white")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text((d) => d.skill.name);

    // Skill status/description
    nodeGroups
      .append("text")
      .attr("class", "skill-status")
      .attr("x", 12)
      .attr("y", 52)
      .attr("fill", (d) => {
        if (d.skill.status === "COMPLETED") return "rgba(255,255,255,0.9)";
        return "rgba(219,234,254,0.9)";
      })
      .attr("font-size", "11px")
      .attr("text-anchor", "start")
      .text((d) => {
        if (d.skill.status === "COMPLETED") return "Completed ✓";
        return "In Progress";
      });

    // Interactive layer (invisible rect for hover/click)
    nodeGroups
      .append("rect")
      .attr("class", "skill-node-interact")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 8)
      .attr("fill", "transparent")
      .style("cursor", (d) =>
        d.skill.status === "COMPLETED" ? "default" : "pointer"
      )
      .on("mouseenter", (_, d) => {
        setHoveredSkill(d.skill.id);
        d3.select(svgRef.current)
          ?.selectAll(".skill-node-group")
          .filter((p: any) => p.skill.id === d.skill.id)
          .selectAll(".skill-node-bg")
          .transition()
          .duration(200)
          .attr("filter", "drop-shadow(0 4px 12px rgba(0,0,0,0.15))");
      })
      .on("mouseleave", () => {
        setHoveredSkill(null);
        d3.select(svgRef.current)
          ?.selectAll(".skill-node-bg")
          .transition()
          .duration(200)
          .attr("filter", "drop-shadow(0 0px 0px rgba(0,0,0,0))");
      })
      .on("click", (_, d) => {
        if (d.skill.status !== "COMPLETED") {
          onMarkComplete(d.skill.id);
        }
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [skills, onMarkComplete, hoveredSkill]);

  return (
    <div className="skill-tree-container">
      <div className="skill-tree-header">
        <h2>Learning Path</h2>
        <p>Click a skill to mark it as complete</p>
      </div>
      <svg ref={svgRef} className="skill-tree-svg" aria-label="Skill tree visualization" />
    </div>
  );
};
