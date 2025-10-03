const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

// Projets fictifs (fallback + R&D interne)
const LOCAL_PROJECTS = [
  {
    id: 'p-waas',
    title: 'WarpSpeed Analytics',
    client: 'Concept interne',
    image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind'],
    date: '2024',
    description: "Dashboard temps réel pour données marketing, charts interactifs et thèmes dynamiques.",
    features: ['SSR + CSR hybride', 'Dark mode', 'Export PDF'],
    link: '#'
  },
  {
    id: 'p-gastro',
    title: 'GastroCity',
    client: 'FoodTech',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Next.js', 'Node.js', 'MongoDB'],
    date: '2025',
    description: 'Marketplace de restaurants avec paiements et livraison temps réel.',
    features: ['Checkout', 'Cartes interactives', 'i18n'],
    link: '#'
  },
  {
    id: 'p-luna',
    title: 'Luna Cosmetics',
    client: 'E‑commerce',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Shopify', 'React', 'GraphQL'],
    date: '2023',
    description: 'Boutique headless performante (Hydrogen), Core Web Vitals optimisés.',
    features: ['PWA', 'Recherche instantanée', 'CMS headless'],
    link: '#'
  },
  {
    id: 'p-musee',
    title: 'Musée Virtuel 3D',
    client: 'Culture',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Three.js', 'WebGL'],
    date: '2024',
    description: 'Galerie immersive avec parcours guidé et audio description.',
    features: ['Accessibilité', 'Animations 60fps', 'Lazy loading'],
    link: '#'
  },
  {
    id: 'p-green',
    title: 'GreenTrack',
    client: 'Greentech',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Vue', 'Firebase'],
    date: '2022',
    description: "Suivi d'empreinte carbone pour PME avec scoring et recommandations.",
    features: ['Auth', 'Notifications', 'Charts'],
    link: '#'
  },
  {
    id: 'p-sound',
    title: 'SoundWave',
    client: 'Média',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Svelte', 'Supabase'],
    date: '2025',
    description: 'Plateforme de podcasts avec lecteur offline et playlists.',
    features: ['Service Worker', 'Streaming HLS', 'Analytics'],
    link: '#'
  },
  {
    id: 'p-health',
    title: 'HealthNow',
    client: 'Santé',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Angular', 'NestJS', 'PostgreSQL'],
    date: '2024',
    description: 'Prise de rendez‑vous et téléconsultation sécurisée (RGPD).',
    features: ['WebRTC', '2FA', 'Audit logs'],
    link: '#'
  },
  {
    id: 'p-travel',
    title: 'TravelQuest',
    client: 'Tourisme',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    technologies: ['Next.js', 'Prisma', 'PostgreSQL'],
    date: '2023',
    description: 'Comparateur de séjours avec cartes et favoris.',
    features: ['SSG + ISR', 'Auth social', 'Cartes'],
    link: '#'
  }
];

let allProjects = [];
let allTechnologies = [];
let currentFilter = 'all';

// DOM
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const projectsGrid = document.getElementById('projects-grid');
const filtersContainer = document.getElementById('filters');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// ==========================================
// Helpers UI
// ==========================================
function showLoader(){ if(loader) loader.style.display = 'block'; }
function hideLoader(){ if(loader) loader.style.display = 'none'; }
function showError(){ if(errorMessage) errorMessage.style.display = 'block'; }
function hideError(){ if(errorMessage) errorMessage.style.display = 'none'; }
function setYear(){ const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); }

// Theme toggle
(function themeInit(){
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if(saved) document.documentElement.setAttribute('data-theme', saved);
  toggle?.addEventListener('click', ()=>{
    const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
  });
})();

// ==========================================
// Chargement des projets (avec merge fallback)
// ==========================================
async function loadProjects(){
  try{
    showLoader(); hideError();
    const response = await fetch(API_URL, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP '+response.status);
    const data = await response.json();
    const apiProjects = Array.isArray(data?.projects) ? data.projects : [];
    const apiTechnos = Array.isArray(data?.technologies) ? data.technologies : [];

    // Merge avec nos projets fictifs (en tête pour montrer notre style)
    allProjects = [...LOCAL_PROJECTS, ...apiProjects];
    allTechnologies = Array.from(new Set([...(apiTechnos), ...allProjects.flatMap(p=>p.technologies)]));
  }catch(e){
    console.warn('Chargement échoué, utilisation du fallback', e);
    showError();
    allProjects = [...LOCAL_PROJECTS];
    allTechnologies = Array.from(new Set(allProjects.flatMap(p=>p.technologies)));
  }finally{
    hideLoader();
    createFilters(allTechnologies);
    displayProjects(allProjects);
  }
}

// ==========================================
// Affichage
// ==========================================
function displayProjects(projects){
  if(!projectsGrid) return;
  projectsGrid.innerHTML = '';

  const results = projects.filter(p => currentFilter==='all' || p.technologies.includes(currentFilter));

  if(results.length === 0){
    noResults.style.display = 'block';
    return;
  } else {
    noResults.style.display = 'none';
  }

  const fragment = document.createDocumentFragment();
  results.forEach(project => fragment.appendChild(createProjectCard(project)));
  projectsGrid.appendChild(fragment);

  // Lazy load images
  const imgs = projectsGrid.querySelectorAll('img[loading="lazy"]');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target; img.src = img.dataset.src; obs.unobserve(img);
        }
      });
    });
    imgs.forEach(img=>io.observe(img));
  } else {
    imgs.forEach(img=> img.src = img.dataset.src);
  }
}

function createProjectCard(project){
  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('data-id', project.id);
  card.innerHTML = `
    <img data-src="${project.image}" alt="${project.title}" class="project-image" loading="lazy" />
    <div class="project-content">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-client">${project.client}${project.date ? ' • '+project.date : ''}</p>
      <div class="project-technologies">${(project.technologies||[]).map(t=>`<span class="tech-badge">${t}</span>`).join('')}</div>
      <button class="btn-details" aria-label="Voir les détails de ${project.title}">Voir détails</button>
    </div>`;

  card.querySelector('.btn-details')?.addEventListener('click', ()=> openModal(project));
  card.addEventListener('keydown', (e)=>{ if(e.key==='Enter') openModal(project); });
  card.tabIndex = 0;
  return card;
}

function createFilters(technologies){
  if(!filtersContainer) return;
  filtersContainer.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'Toutes';
  allBtn.setAttribute('role','tab');
  allBtn.addEventListener('click', ()=> setFilter('all', allBtn));
  filtersContainer.appendChild(allBtn);

  technologies.sort().forEach(tech=>{
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = tech;
    btn.setAttribute('role','tab');
    btn.addEventListener('click', ()=> setFilter(tech, btn));
    filtersContainer.appendChild(btn);
  });
}

function setFilter(tech, btn){
  currentFilter = tech;
  filtersContainer.querySelectorAll('.filter-btn').forEach(b=> b.classList.remove('active'));
  btn.classList.add('active');
  displayProjects(allProjects);
}

// ==========================================
// Modal
// ==========================================
function openModal(project){
  if(!modal || !modalBody) return;
  modalBody.innerHTML = `
    <img src="${project.image}" alt="${project.title}" class="modal-image" />
    <h3 id="modal-title">${project.title}</h3>
    <div class="modal-meta">${project.client} ${project.date? '• '+project.date:''}</div>
    <p class="modal-description">${project.description || ''}</p>
    ${project.features ? `<div class="modal-features"><h4>Fonctionnalités</h4><ul>${project.features.map(f=>`<li>${f}</li>`).join('')}</ul></div>` : ''}
    ${project.link ? `<a class="modal-link" href="${project.link}" target="_blank" rel="noopener">Voir le projet</a>`:''}
  `;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}

function closeModal(){
  modal?.classList.remove('active');
  modal?.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e)=>{
  if(e.target?.classList?.contains('modal-close')) closeModal();
  if(e.target === modal) closeModal();
});

document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

// ==========================================
// Init
// ==========================================
window.addEventListener('DOMContentLoaded', ()=>{
  setYear();
  loadProjects();
});