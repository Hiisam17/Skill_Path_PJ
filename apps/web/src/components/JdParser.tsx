import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseJdGap } from "@/services/gapService";
import type { ParseJdResponse } from "@/services/gapService";
import { isAuthenticated } from "@/services/api";
import "./JdParser.css";

export const JdParser: React.FC = () => {
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ParseJdResponse | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("");
  const navigate = useNavigate();

  const charCount = jdText.length;
  const isValid = charCount >= 50;

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isValid) return;

    if (!isAuthenticated()) {
      alert("Vui lòng đăng nhập để phân tích JD bằng AI.");
      navigate("/login");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg("");
    setResult(null);
    setSelectedRoadmap("");

    try {
      const res = await parseJdGap(jdText);
      setResult(res);

      if (res.roadmapPath) {
        navigateToRoadmap(res, res.roadmapPath);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể phân tích JD, thử lại sau";
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const navigateToRoadmap = (res: ParseJdResponse, path: string) => {
    if (res.isNewUser) {
      alert("Lưu ý: Kết quả dựa trên lộ trình bạn đã hoàn thành trong app. Bạn có thể đã có kinh nghiệm trước đó chưa được tính.");
    }
    
    localStorage.setItem("activeGapAnalysis", JSON.stringify({
      roadmapPath: path,
      jobTitle: "Custom JD",
      companyName: "Thị trường",
      gapNodes: res.gapSkillIds,
      matchScore: res.matchScore,
      summary: res.summary,
    }));

    navigate(path);
  };

  const handleManualNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!result || !selectedRoadmap) return;
    navigateToRoadmap(result, selectedRoadmap);
  };

  return (
    <div className="jd-parser-container">
      <h3>Hoặc paste JD bất kỳ từ ngoài thị trường</h3>
      <div className="jd-parser-input-wrapper">
        <textarea
          className="jd-textarea"
          placeholder="Paste job description từ TopDev, ITviec, LinkedIn... (tối thiểu 50 ký tự)"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          disabled={isAnalyzing}
          rows={6}
        />
        <div className="jd-parser-footer">
          <span className={`char-count ${isValid ? 'valid' : ''}`}>
            {charCount}/50 ký tự
          </span>
          <button 
            type="button"
            className={`btn-analyze-jd ${isAnalyzing ? 'loading' : ''}`}
            onClick={handleAnalyze} 
            disabled={!isValid || isAnalyzing}
          >
            {isAnalyzing ? "Đang phân tích..." : "Phân tích JD"}
          </button>
        </div>
      </div>
      
      {errorMsg && <div className="jd-error-toast">{errorMsg}</div>}

      {result && !result.roadmapPath && (
        <div className="jd-manual-select">
          <div className="jd-manual-info">
            <h4>Không thể tự động nhận diện lộ trình từ JD này.</h4>
            <p className="jd-summary">{result.summary}</p>
            <div className="jd-score-badge">Match Score: {result.matchScore}%</div>
          </div>
          <div className="jd-select-actions">
            <select 
              value={selectedRoadmap} 
              onChange={(e) => setSelectedRoadmap(e.target.value)}
              className="roadmap-select"
            >
              <option value="">-- Chọn lộ trình phù hợp --</option>
              <option value="/roadmaps/1">Frontend Developer</option>
              <option value="/roadmaps/Backend">Backend Developer</option>
              <option value="/roadmaps/3">DevOps Engineer</option>
            </select>
            <button 
              type="button"
              className="btn-navigate" 
              onClick={handleManualNavigate}
              disabled={!selectedRoadmap}
            >
              Xem lộ trình
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
