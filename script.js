const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

// === THEME TOGGLE ===
function setTheme(mode) {
  htmlEl.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);

  if (mode === 'dark') {
    themeIcon.textContent = '🌙';
    themeLabel.textContent = 'Dark';
  } else {
    themeIcon.textContent = '🌞';
    themeLabel.textContent = 'Light';
  }
}

// Load saved / prefers-color-scheme
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
})();

// Toggle on click
themeToggleBtn.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  setTheme(current === 'light' ? 'dark' : 'light');
});


// === HERO BUTTONS SCROLL ===
document.getElementById('startExploring').addEventListener('click', () => {
  document.getElementById('problem-list-container').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('scrollToFilters').addEventListener('click', () => {
  document.getElementById('controls').scrollIntoView({ behavior: 'smooth' });
});


// === LOAD PROBLEMS FROM data.json ===
let problems = [];
async function loadData() {
  try {
    const res = await fetch('data.json');
    problems = await res.json();
    populateThemes();
    render(problems);
  } catch (err) {
    console.error('Failed to load data.json', err);
  }
}


// === FILTERS ===
const themeSelect = document.getElementById('theme-filter');
function populateThemes() {
  const themes = Array.from(new Set(problems.map(p => p.theme))).sort();
  themes.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    themeSelect.appendChild(opt);
  });
}

const grid = document.getElementById('grid');

function render(list) {
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-head">
        <h3>${p.title}</h3>
        <span class="psid">${p.serial}</span>
          <span class="psid">${p.id}</span>
      </div>
      <div class="theme"><strong>Organization:</strong> ${p.organization}</div>
      <p>Theme: ${p.theme}</p>
      
      <div class="card-actions">
        <button class="chip primary" data-toggle="desc">See Description</button>
        <button class="chip" data-toggle="explain">Easy Explain</button>
      </div>

      <div class="toggle-content desc hidden">
        <h4>Description</h4>
        <p>${p.desc}</p>
      </div>
      <div class="toggle-content explain hidden">
        <h4>Explanation</h4>
        <p>${p.explanation}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  // Toggle sections
  grid.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', e => {
      const type = e.currentTarget.getAttribute('data-toggle');
      const card = e.currentTarget.closest('.card');
      const section = card.querySelector(`.${type}`);
      section.classList.toggle('hidden');
    });
  });
}



// === SEARCH + FILTER COMBINE ===
const search = document.getElementById('search');
function applyFilters() {
  const q = search.value.trim().toLowerCase();
  const sel = themeSelect.value;
  const filtered = problems.filter(p => {
    const matchesTheme = sel === 'all' || p.theme === sel;
    const matchesText = !q || `${p.id} ${p.title} ${p.theme}`.toLowerCase().includes(q);
    return matchesTheme && matchesText;
  });
  render(filtered);
}
themeSelect.addEventListener('change', applyFilters);
search.addEventListener('input', applyFilters);


// === START ===
loadData();
