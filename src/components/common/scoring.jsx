
export function normalizeText(t = "") {
  return (t || "").toLowerCase().replace(/[^a-z0-9+.#\s-]/g, " ");
}

export function countOccurrences(text, phrase) {
  if (!text || !phrase) return 0;
  const pattern = phrase
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  const re = new RegExp(`\\b${pattern}\\b`, "gi");
  const m = text.match(re);
  return m ? m.length : 0;
}

const SOFT_SKILLS = [
  "communication","leadership","collaboration","teamwork","problem solving","adaptability",
  "time management","creativity","critical thinking","ownership","stakeholder management",
  "mentoring","presentation","attention to detail"
];

const EDUCATION_TERMS = [
  "phd","doctorate","masters","master","msc","mba","bachelors","bachelor","bs","ba","associate","bootcamp"
];
const EDUCATION_RANK = { phd:5, doctorate:5, masters:4, master:4, msc:4, mba:4, bachelors:3, bachelor:3, bs:3, ba:3, associate:2, bootcamp:1 };

export function extractEducationLevel(text) {
  const n = normalizeText(text);
  let best = { term: null, rank: 0 };
  for (const term of EDUCATION_TERMS) {
    if (n.includes(term) && (EDUCATION_RANK[term] || 0) > best.rank) {
      best = { term, rank: EDUCATION_RANK[term] || 0 };
    }
  }
  return best.rank;
}

export function tokenizeSkills(text) {
  const n = normalizeText(text);
  const tokens = n.split(/\s+/).filter(Boolean);
  return Array.from(new Set(tokens));
}

// Add simple stemmer and synonyms to improve matching
function stem(word = "") {
  return word.replace(/(ing|ed|es|s)$/i, "").toLowerCase();
}

const SYNONYMS = {
  javascript: ["js", "node", "nodejs", "node.js", "ecmascript"],
  typescript: ["ts"],
  react: ["reactjs", "react.js"],
  "react native": ["reactnative"],
  "next.js": ["nextjs", "next"],
  "express": ["expressjs", "express.js"],
  "postgres": ["postgresql", "postgre"],
  "mysql": ["mariadb"],
  "aws": ["amazon web services", "lambda", "ec2", "s3"],
  "gcp": ["google cloud"],
  "azure": ["microsoft azure"],
  "docker": ["containers", "containerization"],
  "kubernetes": ["k8s"],
  "ci/cd": ["cicd", "continuous integration", "continuous delivery"],
};

function expandSkill(skill = "") {
  const base = skill.toLowerCase();
  const alts = SYNONYMS[base] || [];
  return Array.from(new Set([base, ...alts].map(stem))); // Use Set to avoid duplicate stems
}

function parseYearsRequirement(text = "") {
  const m = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?|y)\s*(?:of\s+)?(?:experience|exp)/i);
  return m ? Number(m[1]) : 0;
}

function totalExperienceYears(resumeData) {
  const exps = Array.isArray(resumeData?.experiences) ? resumeData.experiences : [];
  let months = 0;
  exps.forEach(e => {
    const s = e?.start_date ? new Date(e.start_date) : null;
    const end = e?.end_date ? new Date(e.end_date) : new Date(); // If end_date is null, assume current date
    if (s && !isNaN(s.getTime()) && end && !isNaN(end.getTime()) && end > s) {
      months += (end.getFullYear() - s.getFullYear()) * 12 + (end.getMonth() - s.getMonth());
    }
  });
  return Math.max(0, Math.round(months / 12));
}

export function computeScore({ resumeData, resumeText, jdText, requiredSkills = [], preferredSkills = [] }) {
  const jdN = normalizeText(jdText || "");
  const resN = normalizeText(
    resumeText ||
    [
      resumeData?.headline,
      resumeData?.summary,
      (resumeData?.skills || []).join(" "),
      ...(resumeData?.experiences || []).map(e => [e.role, e.company, (e.bullets || []).join(" ")].join(" ")),
      ...(resumeData?.education || []).map(e => [e.school, e.degree, e.major].join(" ")),
      ...(resumeData?.projects || []).map(p => [p.name, (p.description || []).join(" ")].join(" "))
    ].filter(Boolean).join(" ")
  );

  const hardSkills = Array.from(new Set([...(resumeData?.skills || []), ...(requiredSkills || [])]))
    .map(s => s.trim()).filter(Boolean);

  const preferred = Array.from(new Set(preferredSkills)).map(s => s.trim()).filter(Boolean);

  const softSkills = SOFT_SKILLS;

  const resumeTitle = (resumeData?.headline || resumeData?.experiences?.[0]?.role || "").toLowerCase();

  // Count with synonyms and simple stemming
  const hardStats = hardSkills.map(skill => {
    const variants = expandSkill(skill);
    const jdFreq = variants.reduce((sum, v) => sum + countOccurrences(jdN, v), 0);
    const resFreq = variants.reduce((sum, v) => sum + countOccurrences(resN, v), 0);
    return { skill, jd_frequency: jdFreq, resume_frequency: resFreq };
  });

  const softStats = softSkills.map(skill => ({
    skill,
    jd_frequency: countOccurrences(jdN, skill),
    resume_frequency: countOccurrences(resN, skill)
  }));

  // Preferred skills (lower weight)
  const prefStats = preferred.map(skill => {
    const variants = expandSkill(skill);
    const jdFreq = variants.reduce((sum, v) => sum + countOccurrences(jdN, v), 0);
    const resFreq = variants.reduce((sum, v) => sum + countOccurrences(resN, v), 0);
    return { skill, jd_frequency: jdFreq, resume_frequency: resFreq };
  });

  const hardTotal = hardStats.reduce((a, s) => a + (s.jd_frequency > 0 ? 1 : 0), 0);
  const hardMatched = hardStats.reduce((a, s) => a + (s.jd_frequency > 0 && s.resume_frequency > 0 ? 1 : 0), 0);
  let hardScore = hardTotal === 0 ? 100 : Math.round((hardMatched / hardTotal) * 100);

  const softTotal = softStats.reduce((a, s) => a + (s.jd_frequency > 0 ? 1 : 0), 0);
  const softMatched = softStats.reduce((a, s) => a + (s.jd_frequency > 0 && s.resume_frequency > 0 ? 1 : 0), 0);
  const softScore = softTotal === 0 ? 100 : Math.round((softMatched / softTotal) * 100);

  const prefTotal = prefStats.reduce((a, s) => a + (s.jd_frequency > 0 ? 1 : 0), 0);
  const prefMatched = prefStats.reduce((a, s) => a + (s.jd_frequency > 0 && s.resume_frequency > 0 ? 1 : 0), 0);
  const preferredScore = prefTotal === 0 ? 100 : Math.round((prefMatched / prefTotal) * 100);

  const eduJD = extractEducationLevel(jdN);
  const eduRes = extractEducationLevel(resN);
  const educationScore = eduJD === 0 ? 100 : (eduRes >= eduJD ? 100 : Math.round((eduRes / eduJD) * 100));

  let titleScore = 0;
  if (!resumeTitle) {
    titleScore = 0;
  } else {
    const words = resumeTitle.split(/\s+/).filter(w => w.length > 2);
    const matched = words.filter(w => jdN.includes(w)).length;
    titleScore = words.length ? Math.round((matched / words.length) * 100) : 0;
  }

  const jdTokens = tokenizeSkills(jdN);
  const resTokens = tokenizeSkills(resN);
  const common = jdTokens.filter(t => resTokens.includes(t));
  const otherScore = jdTokens.length === 0 ? 100 : Math.round((common.length / jdTokens.length) * 100);

  // Recency + experience fit adjustments
  const requiredYears = parseYearsRequirement(jdText || "");
  const totalYears = totalExperienceYears(resumeData);
  const expFit = requiredYears === 0 ? 100 : Math.max(40, Math.min(100, Math.round((totalYears / requiredYears) * 100)));

  // Boost hard score if skills also appear in latest role/last 18 months
  const recentText = normalizeText((resumeData?.experiences || [])
    .slice(0, 2) // Consider top 2 experiences for recency
    .map(e => [e.role, e.company, (e.bullets || []).join(" ")].filter(Boolean).join(" "))
    .filter(Boolean).join(" "));

  const recentBoosts = hardStats.filter(s => s.resume_frequency > 0 && s.jd_frequency > 0 && expandSkill(s.skill).some(v => countOccurrences(recentText, v) > 0)).length;
  const boostFactor = hardTotal ? (recentBoosts / hardTotal) : 0;
  hardScore = Math.min(100, Math.round(hardScore * (1 + 0.15 * boostFactor)));

  const weights = { hard: 0.38, preferred: 0.07, soft: 0.15, education: 0.12, title: 0.08, other: 0.10, experience: 0.10 };
  const overall = Math.round(
    hardScore * weights.hard +
    preferredScore * weights.preferred +
    softScore * weights.soft +
    educationScore * weights.education +
    titleScore * weights.title +
    otherScore * weights.other +
    expFit * weights.experience
  );

  const missingHard = hardStats
    .filter(s => s.jd_frequency > 0 && s.resume_frequency === 0)
    .map(s => s.skill);
  const missingPreferred = prefStats
    .filter(s => s.jd_frequency > 0 && s.resume_frequency === 0)
    .map(s => s.skill);

  const suggestions = [];
  if (missingHard.length) suggestions.push(`Add hard skills: ${missingHard.slice(0, 6).join(", ")}`);
  if (missingPreferred.length) suggestions.push(`Optional but helpful: ${missingPreferred.slice(0, 6).join(", ")}`);
  if (expFit < 80 && requiredYears > 0 && totalYears < requiredYears) suggestions.push(`Highlight ${requiredYears}+ years experience; currently detected ~${totalYears} years.`);
  if (educationScore < 100 && eduJD > 0) suggestions.push(`Education appears below requirement. Provide degree details or certifications.`);
  if (titleScore < 50 && resumeTitle.length > 0) suggestions.push(`Align headline/role with target job title for better ATS match.`);
  if (overall < 60) suggestions.push(`Review the job description carefully and tailor your resume to match keywords.`);

  return {
    overall_score: overall,
    category_scores: {
      hard_skills: hardScore,
      preferred_skills: preferredScore,
      soft_skills: softScore,
      education: educationScore,
      job_titles: titleScore,
      other_keywords: otherScore,
      experience_fit: expFit
    },
    hard_stats: hardStats,
    soft_stats: softStats,
    preferred_stats: prefStats,
    missing_hard_skills: missingHard,
    missing_preferred_skills: missingPreferred,
    insights: {
      required_years: requiredYears,
      detected_years: totalYears,
      suggestions
    }
  };
}
