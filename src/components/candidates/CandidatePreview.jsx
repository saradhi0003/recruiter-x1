import React, { useState, useEffect } from "react";
import { Edit, ArrowUpRight, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const statusOptions = [
  { value: "our_bench", label: "Our Bench" },
  { value: "active", label: "Active" },
  { value: "placed", label: "Placed" },
  { value: "inactive", label: "Inactive" },
  { value: "screened", label: "Screened" },
  { value: "do_not_contact", label: "Do Not Contact" },
];

const avatarColors = [
  ["#6366F1", "#818CF8"],
  ["#3B82F6", "#60A5FA"],
  ["#8B5CF6", "#A78BFA"],
  ["#10B981", "#34D399"],
  ["#F59E0B", "#FCD34D"],
  ["#EF4444", "#F87171"],
];

function getAvatarColors(name) {
  const idx = (name?.charCodeAt(0) || 0) % avatarColors.length;
  return avatarColors[idx];
}

function Section({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #F2F2F7", paddingTop: 18, marginTop: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#AEAEB2", marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function CandidatePreview({ candidate, onEdit, onUpdated }) {
  const [updating, setUpdating] = React.useState(false);
  const [status, setStatus] = React.useState(candidate.status);

  React.useEffect(() => setStatus(candidate.status), [candidate.status]);

  const updateStatus = async (val) => {
    if (!val || val === status) return;
    setUpdating(true);
    await base44.entities.Candidate.update(candidate.id, { status: val });
    setUpdating(false);
    setStatus(val);
    onUpdated?.();
  };

  const initials = `${(candidate.first_name || "?").charAt(0)}${(candidate.last_name || "").charAt(0)}`.toUpperCase();
  const [c1, c2] = getAvatarColors(candidate.first_name);
  const score = candidate.bench_match_score || candidate.screening_score;
  const scoreDetails = candidate.screening_details || candidate.bench_score_details;

  // Parse AI analysis if available
  const strengths = scoreDetails?.strengths || scoreDetails?.matching_qualifications || [];
  const gaps = scoreDetails?.gaps || scoreDetails?.missing_qualifications || [];
  const summary = scoreDetails?.summary || scoreDetails?.explanation || "";
  const fitLabel = score >= 85 ? "Strong Fit" : score >= 70 ? "Good Fit" : score >= 50 ? "Partial Fit" : null;

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif", padding: "24px 20px" }}>

      {/* Avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(145deg, ${c1}, ${c2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff",
            boxShadow: `0 4px 16px ${c1}55`,
          }}>
            {initials}
          </div>
          {score && (
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              width: 26, height: 26, borderRadius: "50%",
              background: "#fff", border: "2px solid #30A14E",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 800, color: "#30A14E",
            }}>
              {Math.round(score)}
            </div>
          )}
        </div>

        {/* Name + link */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "#1D1D1F", letterSpacing: "-.022em", margin: 0 }}>
            {candidate.first_name} {candidate.last_name}
          </h2>
          <Link to={createPageUrl(`CandidateDetails?id=${candidate.id}`)} title="Open full profile">
            <ArrowUpRight style={{ width: 15, height: 15, color: "#86868B" }} />
          </Link>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 13, color: "#6E6E73", textAlign: "center", lineHeight: 1.4 }}>
          {[candidate.current_title, candidate.current_company, candidate.location].filter(Boolean).join(" · ")}
        </div>

        {/* Pills row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, justifyContent: "center" }}>
          {status && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "rgba(0,113,227,.10)", color: "#0071E3" }}>
              {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} Stage
            </span>
          )}
          {candidate.experience_years && (
            <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "#F2F2F7", color: "#6E6E73" }}>
              {candidate.experience_years} yrs exp
            </span>
          )}
          {candidate.availability && candidate.availability !== "negotiable" && (
            <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "#F2F2F7", color: "#6E6E73" }}>
              {candidate.availability.replace(/_/g, " ")}
            </span>
          )}
          {candidate.availability === "negotiable" && (
            <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: "#F2F2F7", color: "#6E6E73" }}>
              Open to offers
            </span>
          )}
        </div>
      </div>

      {/* AI Screening */}
      {score && (
        <Section title="AI Screening">
          <div style={{ background: "#F9F9FB", borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: "#86868B", marginBottom: 4 }}>Match Score</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                  <span style={{ fontSize: 38, fontWeight: 700, color: "#30A14E", lineHeight: 1, letterSpacing: "-.04em" }}>{Math.round(score)}</span>
                  <span style={{ fontSize: 14, color: "#86868B", fontWeight: 500 }}>/100</span>
                </div>
              </div>
              {fitLabel && (
                <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(48,161,78,.12)", color: "#30A14E" }}>
                  {fitLabel}
                </span>
              )}
            </div>
            {summary && (
              <p style={{ fontSize: 12.5, color: "#6E6E73", lineHeight: 1.6, margin: 0 }}>{summary}</p>
            )}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <Section title="Strengths">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {strengths.slice(0, 4).map((s, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#1D1D1F" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#30A14E", flexShrink: 0, marginTop: 5 }} />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <Section title="Gaps">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {gaps.slice(0, 3).map((g, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#1D1D1F" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F4820F", flexShrink: 0, marginTop: 5 }} />
                {g}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Skills */}
      {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {candidate.skills.slice(0, 12).map((s, i) => (
              <span key={i} style={{ fontSize: 11.5, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: "#F2F2F7", color: "#3C3C43" }}>
                {s}
              </span>
            ))}
            {candidate.skills.length > 12 && (
              <span style={{ fontSize: 11.5, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: "#F2F2F7", color: "#86868B" }}>
                +{candidate.skills.length - 12}
              </span>
            )}
          </div>
        </Section>
      )}

      {/* Contact */}
      <Section title="Contact">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {candidate.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1D1D1F" }}>
              <Mail style={{ width: 14, height: 14, color: "#AEAEB2", flexShrink: 0 }} />
              <a href={`mailto:${candidate.email}`} style={{ color: "#0071E3", textDecoration: "none" }}>{candidate.email}</a>
            </div>
          )}
          {candidate.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1D1D1F" }}>
              <Phone style={{ width: 14, height: 14, color: "#AEAEB2", flexShrink: 0 }} />
              {candidate.phone}
            </div>
          )}
          {candidate.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1D1D1F" }}>
              <MapPin style={{ width: 14, height: 14, color: "#AEAEB2", flexShrink: 0 }} />
              {candidate.location}
            </div>
          )}
          {candidate.linkedin_url && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <ExternalLink style={{ width: 14, height: 14, color: "#AEAEB2", flexShrink: 0 }} />
              <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" style={{ color: "#0071E3", textDecoration: "none" }}>LinkedIn Profile</a>
            </div>
          )}
        </div>
      </Section>

      {/* Update status */}
      <Section title="Update Status">
        <Select value={status} onValueChange={updateStatus} disabled={updating}>
          <SelectTrigger style={{ borderRadius: 10, fontSize: 13, border: "1px solid #E5E5EA" }}>
            <SelectValue placeholder="Change status…" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      {/* Edit button */}
      <div style={{ marginTop: 20 }}>
        <button
          data-intent="edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try { window.dispatchEvent(new Event("preview:close")); } catch {}
            window.location.href = createPageUrl(`CandidateDetails?id=${candidate.id}&mode=edit`);
          }}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: "1px solid #E5E5EA", background: "#fff", fontSize: 13.5, fontWeight: 600, color: "#1D1D1F", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          className="hover:bg-black/[.04] transition-colors"
        >
          <Edit style={{ width: 14, height: 14 }} />
          Edit Full Profile
        </button>
      </div>
    </div>
  );
}