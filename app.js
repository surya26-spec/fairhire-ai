/* === app.js — FairHire AI Bias Detection Engine === */

// ── Bias word banks ──
const GENDER_BIAS_WORDS = [
  'he','him','his','she','her','hers','himself','herself',
  'manpower','mankind','chairman','salesman','stewardess',
  'actress','waiter','waitress','policeman','fireman',
  'handyman','craftsman','sportsmanship','brotherhood','sisterhood',
  'male-dominated','female-dominated','alpha','dominant','aggressive',
  'nurturing','bossy','emotional','hysterical','feisty'
];

const ELITE_COLLEGES = [
  'iit','nit','iim','bits pilani','harvard','mit','stanford','oxford',
  'cambridge','yale','princeton','columbia','wharton','insead',
  'lse','caltech','carnegie mellon','uc berkeley'
];

const ELITE_COMPANIES = [
  'goldman sachs','mckinsey','bcg','bain','google','meta','apple',
  'microsoft','amazon','jpmorgan','morgan stanley','deloitte','kpmg',
  'pwc','ey','accenture','blackrock','ubs','barclays','citibank'
];

const LOCATION_BIAS = [
  'mumbai only','delhi only','bangalore only','only in metros',
  'must be based in','relocation required','local candidates preferred',
  'only tier 1','metro city','silicon valley','new york based'
];

const AGE_BIAS = [
  'young professional','fresh graduate','recent graduate','digital native',
  'millennial','gen z','older worker','experienced professional',
  '20s','30s','under 30','over 40','young and dynamic'
];

const NEUTRAL_SUGGESTIONS = {
  'he': 'they',
  'him': 'them',
  'his': 'their',
  'she': 'they',
  'her': 'them / their',
  'hers': 'theirs',
  'himself': 'themselves',
  'herself': 'themselves',
  'manpower': 'workforce / human resources',
  'mankind': 'humankind / humanity',
  'chairman': 'chairperson',
  'salesman': 'sales representative',
  'stewardess': 'flight attendant',
  'actress': 'actor',
  'waiter': 'server',
  'waitress': 'server',
  'policeman': 'police officer',
  'fireman': 'firefighter',
  'handyman': 'maintenance technician',
  'craftsman': 'skilled tradesperson',
  'bossy': 'assertive',
  'emotional': 'empathetic',
  'aggressive': 'results-driven',
  'dominant': 'leadership-oriented',
};

// ── Sample Resume ──
const SAMPLE_RESUME = `John Smith
Email: john.smith@email.com | Mumbai, India

OBJECTIVE
He is a strong and aggressive leader seeking a manpower-management role in a top-tier firm.

EDUCATION
IIT Delhi — B.Tech Computer Science (2019–2023)
• GPA: 8.9/10

EXPERIENCE
Goldman Sachs — Software Engineer (2023–Present)
• He led a team of 10 engineers and managed all manpower allocation
• Established himself as a dominant technical voice in his department
• Streamlined processes and improved efficiency by 35%

SKILLS
• Python, Java, React, Node.js
• Strong leadership and sportsmanship
• Local candidates preferred for Mumbai office

ACHIEVEMENTS
• Winner of IIT Delhi Hackathon 2022
• Selected for Goldman Sachs Chairman's Award
• Ranked top 5% among 200 analysts

REFERENCES
Available upon request. Must be based in Mumbai or willing to relocate.`;

// ── DOM refs ──
const resumeInput   = document.getElementById('resume-input');
const charCount     = document.getElementById('char-count');
const analyzeBtn    = document.getElementById('analyze-btn');
const btnText       = document.getElementById('btn-text');
const btnSpinner    = document.getElementById('btn-spinner');
const resultsContent   = document.getElementById('results-content');
const placeholderState = document.getElementById('placeholder-state');
const overallBadge  = document.getElementById('overall-badge');

// ── Char counter ──
resumeInput.addEventListener('input', () => {
  const len = resumeInput.value.length;
  charCount.textContent = `${len.toLocaleString()} character${len !== 1 ? 's' : ''}`;
});

// ── Load sample ──
function loadSample() {
  resumeInput.value = SAMPLE_RESUME;
  resumeInput.dispatchEvent(new Event('input'));
}

// ── Clear ──
function clearInput() {
  resumeInput.value = '';
  charCount.textContent = '0 characters';
  placeholderState.classList.remove('hidden');
  resultsContent.classList.add('hidden');
  overallBadge.classList.add('hidden');
}

// ── Analyze ──
function analyzeResume() {
  const text = resumeInput.value.trim();
  if (!text) {
    resumeInput.focus();
    resumeInput.style.borderColor = '#ef4444';
    setTimeout(() => resumeInput.style.borderColor = '', 1500);
    return;
  }

  // Show loading
  analyzeBtn.disabled = true;
  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');

  // Simulate AI processing delay
  setTimeout(() => {
    const report = detectBias(text);
    renderReport(report);

    analyzeBtn.disabled = false;
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
  }, 1600);
}

// ── Core detection ──
function detectBias(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/);

  const foundGender = [];
  const foundEducation = [];
  const foundLocation = [];
  const foundAge = [];

  // Gender
  GENDER_BIAS_WORDS.forEach(w => {
    if (words.includes(w) || lower.includes(w)) {
      if (!foundGender.includes(w)) foundGender.push(w);
    }
  });

  // Education
  ELITE_COLLEGES.forEach(c => {
    if (lower.includes(c)) {
      if (!foundEducation.includes(c)) foundEducation.push(c);
    }
  });

  // Location
  LOCATION_BIAS.forEach(l => {
    if (lower.includes(l)) {
      if (!foundLocation.includes(l)) foundLocation.push(l);
    }
  });

  // Age
  AGE_BIAS.forEach(a => {
    if (lower.includes(a)) {
      if (!foundAge.includes(a)) foundAge.push(a);
    }
  });

  // Score calculation (100 = perfectly fair, 0 = heavily biased)
  const genderScore  = Math.max(0, 100 - foundGender.length * 14);
  const eduScore     = Math.max(0, 100 - foundEducation.length * 18);
  const locScore     = Math.max(0, 100 - foundLocation.length * 22);
  const ageScore     = Math.max(0, 100 - foundAge.length * 18);

  const overallScore = Math.round(
    (genderScore * 0.35) + (eduScore * 0.30) + (locScore * 0.25) + (ageScore * 0.10)
  );

  // Build issues
  const issues = [];
  if (foundGender.length > 0) {
    issues.push({
      type: 'Gender Bias',
      icon: '⚧',
      color: '#ef4444',
      text: `Found ${foundGender.length} gender-coded term(s): `,
      highlight: foundGender.slice(0,5).map(w => `"${w}"`).join(', '),
      detail: ' — These may trigger algorithmic bias in screening systems.'
    });
  }
  if (foundEducation.length > 0) {
    issues.push({
      type: 'Education Bias',
      icon: '🎓',
      color: '#f59e0b',
      text: `Elite institution preference detected: `,
      highlight: foundEducation.slice(0,3).map(w => w.toUpperCase()).join(', '),
      detail: ' — Highlights that may filter otherwise qualified candidates.'
    });
  }
  if (foundLocation.length > 0) {
    issues.push({
      type: 'Location Bias',
      icon: '📍',
      color: '#f97316',
      text: `Geographic restriction detected: `,
      highlight: foundLocation.slice(0,2).map(w => `"${w}"`).join(', '),
      detail: ' — Excludes remote/tier-2 candidates unfairly.'
    });
  }
  if (foundAge.length > 0) {
    issues.push({
      type: 'Age Bias',
      icon: '🕐',
      color: '#a78bfa',
      text: `Age-coded language detected: `,
      highlight: foundAge.slice(0,2).map(w => `"${w}"`).join(', '),
      detail: ' — May violate equal opportunity hiring laws.'
    });
  }
  if (issues.length === 0) {
    issues.push({
      type: 'No Issues Found',
      icon: '✅',
      color: '#22c55e',
      text: 'Excellent! No significant bias markers were detected.',
      highlight: '',
      detail: ' The resume appears to use fair, skill-focused language.'
    });
  }

  // Build suggestions
  const suggestions = [];
  foundGender.forEach(w => {
    if (NEUTRAL_SUGGESTIONS[w]) {
      suggestions.push({
        icon: '✍️',
        text: `Replace "${w}" with `,
        fix: `"${NEUTRAL_SUGGESTIONS[w]}"`
      });
    }
  });
  if (foundEducation.length > 0) {
    suggestions.push({
      icon: '🎯',
      text: 'Reframe education section to highlight ',
      fix: 'skills, GPA, and projects rather than institution name alone'
    });
  }
  if (foundLocation.length > 0) {
    suggestions.push({
      icon: '🌐',
      text: 'Replace location restrictions with ',
      fix: '"Open to remote/hybrid work arrangements"'
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      icon: '🌟',
      text: 'Great language choices! Continue using ',
      fix: 'skill-based, identity-neutral descriptions throughout.'
    });
  }

  return {
    overallScore,
    dimensions: [
      { label: 'Gender Bias', score: genderScore,  found: foundGender.length },
      { label: 'Education',   score: eduScore,     found: foundEducation.length },
      { label: 'Location',    score: locScore,     found: foundLocation.length },
      { label: 'Age Language',score: ageScore,     found: foundAge.length },
    ],
    issues,
    suggestions
  };
}

function getScoreColor(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

function getVerdict(score) {
  if (score >= 80) return { label: '✅ Low Bias', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' };
  if (score >= 55) return { label: '⚠️ Moderate Bias', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' };
  return { label: '🚨 High Bias Detected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' };
}

function getExplain(score) {
  if (score >= 80) return 'This resume uses largely neutral, skill-focused language. Minor improvements may still help.';
  if (score >= 55) return 'Several bias indicators found. Applying the suggestions below will significantly improve fairness.';
  return 'Multiple strong bias markers detected. This resume is likely to be filtered unfairly by AI screening systems.';
}

// ── Render ──
function renderReport(report) {
  // Show results
  placeholderState.classList.add('hidden');
  resultsContent.classList.remove('hidden');

  // Overall badge
  const v = getVerdict(report.overallScore);
  overallBadge.textContent = v.label;
  overallBadge.style.color = v.color;
  overallBadge.style.background = v.bg;
  overallBadge.style.border = `1px solid ${v.border}`;
  overallBadge.classList.remove('hidden');

  // Score ring animation
  const circle = document.getElementById('main-score-circle');
  const circumference = 364;
  const offset = circumference - (report.overallScore / 100) * circumference;
  document.getElementById('big-score-num').textContent = report.overallScore;
  const scoreColor = getScoreColor(report.overallScore);
  circle.style.stroke = scoreColor;
  setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);

  // Verdict
  document.getElementById('score-verdict').textContent = v.label;
  document.getElementById('score-verdict').style.color = v.color;
  document.getElementById('score-explain').textContent = getExplain(report.overallScore);

  // Breakdown bars
  const barsEl = document.getElementById('breakdown-bars');
  barsEl.innerHTML = '';
  report.dimensions.forEach((d, i) => {
    const color = getScoreColor(d.score);
    const row = document.createElement('div');
    row.className = 'breakdown-bar-row';
    row.innerHTML = `
      <span class="bb-label">${d.label}</span>
      <div class="bb-track">
        <div class="bb-fill" id="bb-${i}" style="width:0%;background:${color}"></div>
      </div>
      <span class="bb-val" style="color:${color}">${d.score}</span>
    `;
    barsEl.appendChild(row);
    setTimeout(() => {
      document.getElementById(`bb-${i}`).style.width = `${d.score}%`;
    }, 200 + i * 100);
  });

  // Issues
  const issuesList = document.getElementById('issues-list');
  issuesList.innerHTML = '';
  report.issues.forEach((iss, i) => {
    const el = document.createElement('div');
    el.className = 'issue-item';
    el.style.animationDelay = `${i * 0.08}s`;
    el.innerHTML = `
      <span class="issue-icon">${iss.icon}</span>
      <div class="issue-text">
        <strong style="color:${iss.color}">${iss.type}:</strong>
        ${iss.text}<span class="issue-highlight">${iss.highlight}</span>${iss.detail}
      </div>
    `;
    issuesList.appendChild(el);
  });

  // Suggestions
  const sugList = document.getElementById('suggestions-list');
  sugList.innerHTML = '';
  report.suggestions.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'suggestion-item';
    el.style.animationDelay = `${i * 0.08}s`;
    el.innerHTML = `
      <span class="sug-icon">${s.icon}</span>
      <div class="sug-text">${s.text}<span class="sug-fix">${s.fix}</span></div>
    `;
    sugList.appendChild(el);
  });

  // Scroll to results
  document.getElementById('output-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Intersection Observer for animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-item, .tech-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
