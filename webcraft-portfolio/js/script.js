// ==========================================
// CONFIGURATION
// ==========================================
const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

// Variables globales
let allProjects = [];
let allTechnologies = [];
let currentFilter = 'all';

// ==========================================
// ÉLÉMENTS DOM
// ==========================================
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const projectsGrid = document.getElementById('projects-grid');
const filtersContainer = document.getElementById('filters');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// ==========================================
// CHARGEMENT DES PROJETS
// ==========================================
async function loadProjects() {
    try {
        // Afficher le loader
        showLoader();
        hideError();

        // Requête AJAX
        const response = await fetch(API_URL);

        // Vérifier le statut HTTP
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Parser le JSON
        const data = await response.json();

        // Stocker les données
        allProjects = data.projects;
        allTechnologies = data.technologies;

        // Afficher les projets et filtres
        displayProjects(allProjects);
        createFilters(allTechnologies);

    } catch (error) {
        console.error('Erreur de chargement:', error);
        showError();
    } finally {
        hideLoader();
    }
}

// ==========================================
// AFFICHAGE DES PROJETS
// ==========================================
function displayProjects(projects) {
    // Réinitialiser la grille
    projectsGrid.innerHTML = '';

    // Vérifier s'il y a des résultats
    if (projects.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }

    // Créer les cartes de projet
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

// ==========================================
// CRÉATION D'UNE CARTE PROJET
// ==========================================
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-id', project.id);

    // Générer les badges de technologies
    const techBadges = project.technologies
        .map(tech => `<span class="tech-badge">${tech}</span>`)
        .join('');

    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-image">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-client">${project.client}</p>
            <div class="project-technologies">
                ${techBadges}
            </div>
            <button class="btn-details" aria-label="Voir les détails de ${project.title}">
                Voir détails