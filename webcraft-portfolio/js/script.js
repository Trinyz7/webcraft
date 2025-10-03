// --- Config
const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

// Fallback simple (utilisé uniquement si l’API échoue)
const LOCAL_PROJECTS = [
  { id:'p-1', title:'WarpSpeed Analytics', client:'Concept interne', image:'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop', technologies:['React','TypeScript'], date:'2024', description:'Dashboard temps réel.', features:['Dark mode','Export PDF'], link:'#' },
  { id:'p-2', title:'GastroCity', client:'FoodTech', image:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop', technologies:['Next.js','MongoDB'], date:'2025', description:'Marketplace de restaurants.', features:['Checkout','Cartes'], link:'#' }
];

// --- Éléments
const $ = s => document.querySelector(s);
const loader = $('#loader');
const errorBox = $('#error-message');
const grid = $('#projects-grid');
const filters = $('#filters');
const noResults = $('#no-results');
const modal = $('#modal');
const modalBody = $('#modal-body');
const yearEl = $('#year');
const themeToggle = $('#theme-toggle');

// --- État
let ALL = [], TECHS = [], FILTER = 'all';

// --- Utilitaires UI
const show = (el, on=true) => el && (el.style.display = on ? 'block':'none');

// --- Thème + année
function initTheme() {
  const root = document.documentElement;
  root.dataset.theme = localStorage.getItem('theme') || root.dataset.theme || 'light';
  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  });
}
function setYear(){ if (yearEl) yearEl.textContent = new Date().getFullYear(); }

// --- Chargement des projets
async function loadProjects() {
  show(loader, true); show(errorBox, false);
  try {
    const r = await fetch(API_URL, { cache:'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const apiProjects = Array.isArray(data?.projects) ? data.projects : [];
    const apiTechs = Array.isArray(data?.technologies) ? data.technologies : [];
    ALL = [...apiProjects];                         // simple : pas de fusion si API OK
    TECHS = [...new Set([...apiTechs, ...ALL.flatMap(p => p.technologies || [])])].sort();
  } catch (e) {
    console.warn('API indisponible → fallback local', e);
    show(errorBox, true);
    ALL = [...LOCAL_PROJECTS];
    TECHS = [...new Set(ALL.flatMap(p => p.technologies || []))].sort();
  } finally {
    show(loader, false);
    renderFilters();
    renderProjects();
  }
}

// --- Rendu
function renderFilters() {
  if (!filters) return;
  filters.innerHTML = `<button class="filter-btn ${FILTER==='all'?'active':''}" data-tech="all">Toutes</button>` +
    TECHS.map(t => `<button class="filter-btn" data-tech="${t}">${t}</button>`).join('');
}

function renderProjects() {
  if (!grid) return;
  const list = ALL.filter(p => FILTER==='all' || (p.technologies||[]).includes(FILTER));
  show(noResults, list.length === 0);
  grid.innerHTML = list.map(p => `
    <article class="project-card" data-id="${p.id}">
      <img src="${p.image}" loading="lazy" alt="${p.title}" class="project-image">
      <div class="project-content">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-client">${p.client}${p.date ? ' • ' + p.date : ''}</p>
        <div class="project-technologies">
          ${(p.technologies||[]).map(t => `<span class="tech-badge">${t}</span>`).join('')}
        </div>
        <button class="btn-details" aria-label="Voir les détails de ${p.title}">Voir détails</button>
      </div>
    </article>
  `).join('');
}

// --- Modal
function openModal(p) {
  if (!modal || !modalBody) return;
  modalBody.innerHTML = `
    <img src="${p.image}" alt="${p.title}" class="modal-image">
    <h3 id="modal-title">${p.title}</h3>
    <div class="modal-meta">${p.client}${p.date ? ' • ' + p.date : ''}</div>
    ${p.description ? `<p class="modal-description">${p.description}</p>` : ''}
    ${p.features ? `<div class="modal-features"><h4>Fonctionnalités</h4><ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul></div>` : ''}
    ${p.link ? `<a class="modal-link" href="${p.link}" target="_blank" rel="noopener">Voir le projet</a>` : ''}
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal?.classList.remove('active');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// --- Événements (délégation très simple)
document.addEventListener('click', e => {
  const f = e.target.closest('.filter-btn');
  if (f && filters.contains(f)) {
    FILTER = f.dataset.tech;
    filters.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b===f));
    return renderProjects();
  }
  if (e.target.classList.contains('btn-details')) {
    const card = e.target.closest('.project-card');
    const p = ALL.find(x => String(x.id) === card.dataset.id);
    return openModal(p);
  }
  if (e.target.classList.contains('modal-close') || e.target === modal) return closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// --- Start
window.addEventListener('DOMContentLoaded', () => {
  setYear();
  initTheme();
  loadProjects();
});
