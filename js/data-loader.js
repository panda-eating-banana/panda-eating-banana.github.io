// Data Loader for Portfolio Pages
let portfolioData = null;
let filteredProjects = [];
let selectedTechs = new Set();

async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Load Projects with Search and Filter
async function loadProjects() {
    portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.projects) return;

    filteredProjects = [...portfolioData.projects];

    // Setup filter tags
    setupFilterTags();

    // Setup search and sort controls
    setupProjectControls();

    // Initial render with default sorting applied
    filterAndRenderProjects();
}

function setupFilterTags() {
    const filterTagsContainer = document.getElementById('filterTags');
    if (!filterTagsContainer) return;

    // Extract all unique technologies
    const allTechs = new Set();
    portfolioData.projects.forEach(project => {
        const techs = project.technologies.split(',').map(t => t.trim());
        techs.forEach(tech => allTechs.add(tech));
    });

    // Create filter tag buttons
    const sortedTechs = Array.from(allTechs).sort();
    const visibleCount = 5;
    const hasMore = sortedTechs.length > visibleCount;

    filterTagsContainer.innerHTML = '<span class="filter-label">Filter by:</span>';

    sortedTechs.forEach((tech, index) => {
        const tag = document.createElement('button');
        tag.className = 'filter-tag';
        if (index >= visibleCount) {
            tag.classList.add('filter-tag-hidden');
        }
        tag.textContent = tech;
        tag.setAttribute('data-tech', tech);
        tag.addEventListener('click', () => toggleTechFilter(tech, tag));
        filterTagsContainer.appendChild(tag);
    });

    // Add expand/collapse button if there are more than visibleCount tags
    if (hasMore) {
        const expandBtn = document.createElement('button');
        expandBtn.className = 'filter-expand-btn';
        expandBtn.innerHTML = `<i class="fas fa-plus"></i> +${sortedTechs.length - visibleCount} more`;
        expandBtn.addEventListener('click', () => {
            const hiddenTags = filterTagsContainer.querySelectorAll('.filter-tag-hidden');
            const isExpanded = expandBtn.classList.contains('expanded');

            if (isExpanded) {
                hiddenTags.forEach(tag => tag.style.display = 'none');
                expandBtn.innerHTML = `<i class="fas fa-plus"></i> +${sortedTechs.length - visibleCount} more`;
                expandBtn.classList.remove('expanded');
            } else {
                hiddenTags.forEach(tag => tag.style.display = 'inline-flex');
                expandBtn.innerHTML = `<i class="fas fa-minus"></i> Show less`;
                expandBtn.classList.add('expanded');
            }
        });
        filterTagsContainer.appendChild(expandBtn);
    }
}

function toggleTechFilter(tech, button) {
    if (selectedTechs.has(tech)) {
        selectedTechs.delete(tech);
        button.classList.remove('active');
    } else {
        selectedTechs.add(tech);
        button.classList.add('active');
    }
    filterAndRenderProjects();
}

function setupProjectControls() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderProjects);
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            filterAndRenderProjects();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRenderProjects);
    }
}

function filterAndRenderProjects() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'date-desc';

    // Filter projects
    filteredProjects = portfolioData.projects.filter(project => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            project.title.toLowerCase().includes(searchTerm) ||
            project.description.some(desc => desc.toLowerCase().includes(searchTerm)) ||
            project.technologies.toLowerCase().includes(searchTerm);

        // Technology filter
        const matchesTech = selectedTechs.size === 0 ||
            Array.from(selectedTechs).some(tech =>
                project.technologies.toLowerCase().includes(tech.toLowerCase())
            );

        return matchesSearch && matchesTech;
    });

    // Sort projects
    filteredProjects.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return parseWorkshopDate(b.date) - parseWorkshopDate(a.date);
            case 'date-asc':
                return parseWorkshopDate(a.date) - parseWorkshopDate(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderProjects();
}

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;

    container.innerHTML = '';

    // Show/hide no results message
    if (filteredProjects.length === 0) {
        noResults?.classList.remove('d-none');
        resultsCount.textContent = 'No projects found';
    } else {
        noResults?.classList.add('d-none');
        resultsCount.textContent = `Showing ${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''}`;
    }

    filteredProjects.forEach((project, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        const descriptionText = project.description.join(' ');

        // Convert technologies to tags
        const techTags = project.technologies.split(',').map(tech =>
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('');

        const linksHTML = project.links.map(link =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm" onclick="event.stopPropagation()" aria-label="${link.text}"><i class="${link.icon} me-1"></i>${link.text}</a>`
        ).join('');

        const hasModal = project.modal && project.modal.detailedDescription;

        col.innerHTML = `
            <div class="project-card h-100 fade-in" style="animation-delay: ${index * 0.1}s" ${hasModal ? `onclick="openProjectModal(${project.id})"` : ''}>
                <div class="project-card-body d-flex flex-column h-100">
                    <h3 class="project-card-title">${project.title}</h3>
                    <p class="project-card-date"><i class="fas fa-calendar-alt me-2"></i>${project.date}</p>
                    <p class="project-card-description">${descriptionText}</p>
                    <div class="project-card-tags mb-3">
                        ${techTags}
                    </div>
                    <div class="project-card-footer mt-auto" onclick="event.stopPropagation()">
                        ${linksHTML}
                        ${hasModal ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openProjectModal(${project.id})"><i class="fas fa-info-circle me-1"></i>Details</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

// Load Experience
let filteredExperience = [];

async function loadExperience() {
    portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.experience) return;

    filteredExperience = [...portfolioData.experience];
    renderExperience();
}

function renderExperience() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    container.innerHTML = '';

    filteredExperience.forEach((exp, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item fade-in';
        item.style.animationDelay = `${index * 0.15}s`;

        const descriptionHTML = exp.description.map(desc => `<li>${desc}</li>`).join('');

        item.innerHTML = `
            <div class="timeline-marker">
                <i class="fas fa-briefcase"></i>
            </div>
            <div class="timeline-content">
                <h3 class="timeline-title">${exp.title}</h3>
                <div class="timeline-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${exp.date}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${exp.location}</span>
                </div>
                <ul class="custom-list">
                    ${descriptionHTML}
                </ul>
            </div>
        `;

        container.appendChild(item);
    });
}

// Load Education with Search
let filteredEducation = [];

async function loadEducation() {
    portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.education) return;

    filteredEducation = [...portfolioData.education];

    // Setup search and sort controls
    setupEducationControls();

    // Initial render
    renderEducation();
}

function setupEducationControls() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderEducation);
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            filterAndRenderEducation();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRenderEducation);
    }
}

function filterAndRenderEducation() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'date-desc';

    // Filter education
    filteredEducation = portfolioData.education.filter(edu => {
        return searchTerm === '' ||
            edu.title.toLowerCase().includes(searchTerm) ||
            edu.location.toLowerCase().includes(searchTerm) ||
            edu.description.some(desc => desc.toLowerCase().includes(searchTerm));
    });

    // Sort education
    filteredEducation.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return b.id - a.id;
            case 'date-asc':
                return a.id - b.id;
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderEducation();
}

function renderEducation() {
    const container = document.getElementById('educationContainer');
    if (!container) return;

    container.innerHTML = '';

    filteredEducation.forEach((edu, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item fade-in';
        item.style.animationDelay = `${index * 0.15}s`;

        const descriptionHTML = edu.description.map(desc => `<li>${desc}</li>`).join('');

        item.innerHTML = `
            <div class="timeline-marker">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="timeline-content">
                <h3 class="timeline-title">${edu.title}</h3>
                <div class="timeline-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${edu.date}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${edu.location}</span>
                </div>
                <ul class="custom-list">
                    ${descriptionHTML}
                </ul>
            </div>
        `;

        container.appendChild(item);
    });
}

// Load Certifications with Search and Filter
let filteredCertifications = [];
let selectedIssuers = new Set();

async function loadCertifications() {
    portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.certifications) return;

    filteredCertifications = [...portfolioData.certifications];

    // Render certification progress tracker
    renderCertificationProgress();

    // Render Pluralsight section
    renderPluralsight();

    // Setup filter tags
    setupCertificationFilterTags();

    // Setup search and sort controls
    setupCertificationControls();

    // Initial render
    renderCertifications();
}

function setupCertificationFilterTags() {
    const filterTagsContainer = document.getElementById('filterTags');
    if (!filterTagsContainer) return;

    // Extract all unique issuers
    const allIssuers = new Set();
    portfolioData.certifications.forEach(cert => {
        allIssuers.add(cert.issuer);
    });

    // Create filter tag buttons
    const sortedIssuers = Array.from(allIssuers).sort();
    filterTagsContainer.innerHTML = '<span class="filter-label">Filter by issuer:</span>';

    sortedIssuers.forEach(issuer => {
        const tag = document.createElement('button');
        tag.className = 'filter-tag';
        tag.textContent = issuer;
        tag.setAttribute('data-issuer', issuer);
        tag.addEventListener('click', () => toggleIssuerFilter(issuer, tag));
        filterTagsContainer.appendChild(tag);
    });
}

function toggleIssuerFilter(issuer, button) {
    if (selectedIssuers.has(issuer)) {
        selectedIssuers.delete(issuer);
        button.classList.remove('active');
    } else {
        selectedIssuers.add(issuer);
        button.classList.add('active');
    }
    filterAndRenderCertifications();
}

function setupCertificationControls() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderCertifications);
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            filterAndRenderCertifications();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRenderCertifications);
    }
}

function filterAndRenderCertifications() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'date-desc';

    // Filter certifications
    filteredCertifications = portfolioData.certifications.filter(cert => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            cert.title.toLowerCase().includes(searchTerm) ||
            cert.issuer.toLowerCase().includes(searchTerm) ||
            cert.description.toLowerCase().includes(searchTerm);

        // Issuer filter
        const matchesIssuer = selectedIssuers.size === 0 ||
            selectedIssuers.has(cert.issuer);

        return matchesSearch && matchesIssuer;
    });

    // Sort certifications
    filteredCertifications.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return parseCertificationDate(b.date) - parseCertificationDate(a.date);
            case 'date-asc':
                return parseCertificationDate(a.date) - parseCertificationDate(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderCertifications();
}

function renderCertificationProgress() {
    const progressSection = document.getElementById('certProgressSection');
    if (!progressSection || !portfolioData.certificationPath) return;

    const path = portfolioData.certificationPath;

    // Calculate overall progress
    const totalProgress = path.milestones.reduce((sum, m) => sum + m.progress, 0) / path.milestones.length;

    const milestonesHTML = path.milestones.map(milestone => {
        const statusIcon = milestone.status === 'completed' ? 'fa-check-circle' :
                          milestone.status === 'in-progress' ? 'fa-spinner' :
                          'fa-circle';

        const detailsHTML = milestone.details ?
            `<ul class="milestone-details">
                ${milestone.details.map(detail => `<li>${detail}</li>`).join('')}
             </ul>` : '';

        const dateInfo = milestone.completedDate ?
            `<span class="milestone-date"><i class="fas fa-calendar-check"></i> Completed: ${milestone.completedDate}</span>` :
            milestone.targetDate ?
            `<span class="milestone-date"><i class="fas fa-calendar"></i> Target: ${milestone.targetDate}</span>` : '';

        return `
            <div class="milestone-card ${milestone.status}">
                <div class="milestone-header">
                    <div class="milestone-icon" style="color: ${milestone.color}">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                    <div class="milestone-info">
                        <h3 class="milestone-title">${milestone.title}</h3>
                        <p class="milestone-description">${milestone.description}</p>
                        ${dateInfo}
                    </div>
                    <div class="milestone-progress-circle">
                        <svg viewBox="0 0 36 36" class="circular-chart">
                            <path class="circle-bg"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path class="circle"
                                stroke="${milestone.color}"
                                stroke-dasharray="${milestone.progress}, 100"
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" class="percentage">${milestone.progress}%</text>
                        </svg>
                    </div>
                </div>
                ${detailsHTML}
            </div>
        `;
    }).join('');

    progressSection.innerHTML = `
        <div class="cert-progress-container">
            <div class="progress-header">
                <h2><i class="fas fa-route"></i> ${path.title}</h2>
                <p>${path.description}</p>
                <div class="overall-progress">
                    <span class="progress-label">Overall Progress: ${Math.round(totalProgress)}%</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${totalProgress}%"></div>
                    </div>
                </div>
            </div>
            <div class="milestones-grid">
                ${milestonesHTML}
            </div>
        </div>
    `;
}

function renderPluralsight() {
    const pluralsightSection = document.getElementById('pluralsightSection');
    if (!pluralsightSection || !portfolioData.pluralsight) return;

    const ps = portfolioData.pluralsight;

    // Separate paths (planned cert prep) from actual courses/labs
    const paths = ps.courses.filter(c => c.type === 'path');
    const items = ps.courses.filter(c => c.type !== 'path');

    // Render certification paths
    const pathsHTML = paths.map(course => {
        return `
            <div class="ps-path-item">
                <div class="ps-path-info">
                    <i class="fas fa-road"></i>
                    <span>${course.title}</span>
                </div>
                <span class="ps-badge planned">Planned</span>
            </div>
        `;
    }).join('');

    // Render courses and labs
    const itemsHTML = items.map(course => {
        const typeIcon = course.type === 'lab' ? 'fa-flask' : 'fa-play-circle';
        const typeLabel = course.type === 'lab' ? 'Lab' : 'Course';
        const statusClass = course.status === 'completed' ? 'completed' :
                           course.status === 'in-progress' ? 'in-progress' : 'planned';
        const progressColor = course.status === 'completed' ? '#10b981' :
                             course.progress > 0 ? '#f59e0b' : '#6b7280';

        return `
            <div class="ps-course-row ${statusClass}">
                <div class="ps-course-info">
                    <div class="ps-course-title">${course.title}</div>
                    <div class="ps-course-meta">
                        <span class="ps-type"><i class="fas ${typeIcon}"></i> ${typeLabel}</span>
                        ${course.duration ? `<span class="ps-duration"><i class="fas fa-clock"></i> ${course.duration}</span>` : ''}
                        ${course.date ? `<span class="ps-date"><i class="fas fa-calendar"></i> ${course.date}</span>` : ''}
                    </div>
                </div>
                <div class="ps-course-progress">
                    <div class="ps-progress-bar">
                        <div class="ps-progress-fill" style="width: ${course.progress}%; background: ${progressColor}"></div>
                    </div>
                    <span class="ps-progress-text" style="color: ${progressColor}">${course.progress}%</span>
                </div>
            </div>
        `;
    }).join('');

    pluralsightSection.innerHTML = `
        <div class="pluralsight-container">
            <div class="pluralsight-header">
                <div class="pluralsight-logo">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="pluralsight-title">
                    <h2>${ps.title}</h2>
                    <p>${ps.description}</p>
                </div>
            </div>
            ${paths.length > 0 ? `
                <div class="ps-paths-section">
                    <h4><i class="fas fa-certificate"></i> Certification Paths</h4>
                    ${pathsHTML}
                </div>
            ` : ''}
            <div class="ps-courses-section">
                <h4><i class="fas fa-graduation-cap"></i> Courses & Labs</h4>
                ${itemsHTML}
            </div>
        </div>
    `;
}

function renderCertifications() {
    const container = document.getElementById('certificationsContainer');
    if (!container) return;

    container.innerHTML = '';

    filteredCertifications.forEach((cert, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        col.innerHTML = `
            <div class="cert-card fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="cert-card-header">
                    <img src="${cert.badgeImage}" alt="${cert.title} Badge" class="cert-badge-img" loading="lazy">
                    <div class="cert-card-info">
                        <h3 class="cert-card-title">${cert.title}</h3>
                        <p class="cert-card-issuer"><i class="fas fa-building me-2"></i>${cert.issuer}</p>
                    </div>
                </div>
                <div class="cert-card-body">
                    <div class="cert-card-meta">
                        <span><i class="fas fa-calendar-check me-2"></i>${cert.date}</span>
                    </div>
                    <p class="cert-card-description">${cert.description}</p>
                </div>
                <div class="cert-card-footer">
                    <a href="${cert.badgeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary w-100">
                        <i class="fas fa-external-link-alt me-2"></i>View Badge
                    </a>
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

// Load Skills
async function loadSkills() {
    const data = await loadPortfolioData();
    if (!data || !data.skills) return;

    const container = document.getElementById('skillsContainer');
    if (!container) return;

    container.innerHTML = '';

    // Technical Skills
    if (data.skills.technical) {
        const technicalSection = document.createElement('div');
        technicalSection.className = 'skills-section fade-in';

        const technicalList = data.skills.technical.map(skill =>
            `<div class="skill-item">
                <span class="skill-category">${skill.category}</span>
                <span class="skill-items">${skill.items}</span>
            </div>`
        ).join('');

        technicalSection.innerHTML = `
            <div class="skills-card">
                <div class="skills-card-header">
                    <i class="fas fa-code"></i>
                    <h2>Technical Skills</h2>
                </div>
                <div class="skills-card-body">
                    ${technicalList}
                </div>
            </div>
        `;

        container.appendChild(technicalSection);
    }

    // Language Skills
    if (data.skills.languages) {
        const languageSection = document.createElement('div');
        languageSection.className = 'skills-section fade-in';
        languageSection.style.animationDelay = '0.1s';

        const languageList = data.skills.languages.map(lang =>
            `<div class="language-item">
                <span class="language-name">${lang.language}</span>
                <span class="language-level">${lang.level}</span>
            </div>`
        ).join('');

        languageSection.innerHTML = `
            <div class="skills-card">
                <div class="skills-card-header">
                    <i class="fas fa-language"></i>
                    <h2>Language Skills</h2>
                </div>
                <div class="skills-card-body">
                    ${languageList}
                </div>
            </div>
        `;

        container.appendChild(languageSection);
    }

    // Hobbies
    if (data.skills.hobbies) {
        const hobbiesSection = document.createElement('div');
        hobbiesSection.className = 'skills-section fade-in';
        hobbiesSection.style.animationDelay = '0.2s';

        const hobbiesList = data.skills.hobbies.map(hobby =>
            `<div class="hobby-item">
                <span class="hobby-icon">${hobby.icon}</span>
                <span class="hobby-name">${hobby.name}</span>
            </div>`
        ).join('');

        hobbiesSection.innerHTML = `
            <div class="skills-card">
                <div class="skills-card-header">
                    <i class="fas fa-heart"></i>
                    <h2>Hobbies & Interests</h2>
                </div>
                <div class="skills-card-body">
                    <div class="hobbies-grid">
                        ${hobbiesList}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(hobbiesSection);
    }
}

// Load Workshops with Search and Filter
let filteredWorkshops = [];
let selectedTypes = new Set();

async function loadWorkshops() {
    portfolioData = await loadPortfolioData();
    if (!portfolioData || !portfolioData.workshops) return;

    filteredWorkshops = [...portfolioData.workshops];

    // Setup filter tags
    setupWorkshopFilterTags();

    // Setup search and sort controls
    setupWorkshopControls();

    // Initial render with default sorting applied
    filterAndRenderWorkshops();
}

function setupWorkshopFilterTags() {
    const filterTagsContainer = document.getElementById('filterTags');
    if (!filterTagsContainer) return;

    // Extract all unique types
    const allTypes = new Set();
    portfolioData.workshops.forEach(workshop => {
        allTypes.add(workshop.type);
    });

    // Create filter tag buttons
    const sortedTypes = Array.from(allTypes).sort();
    filterTagsContainer.innerHTML = '<span class="filter-label">Filter by type:</span>';

    sortedTypes.forEach(type => {
        const tag = document.createElement('button');
        tag.className = 'filter-tag';
        tag.textContent = type;
        tag.setAttribute('data-type', type);
        tag.addEventListener('click', () => toggleTypeFilter(type, tag));
        filterTagsContainer.appendChild(tag);
    });
}

function toggleTypeFilter(type, button) {
    if (selectedTypes.has(type)) {
        selectedTypes.delete(type);
        button.classList.remove('active');
    } else {
        selectedTypes.add(type);
        button.classList.add('active');
    }
    filterAndRenderWorkshops();
}

function setupWorkshopControls() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderWorkshops);
    }

    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            filterAndRenderWorkshops();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndRenderWorkshops);
    }
}

function filterAndRenderWorkshops() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortSelect')?.value || 'date-desc';

    // Filter workshops
    filteredWorkshops = portfolioData.workshops.filter(workshop => {
        // Search filter
        const matchesSearch = searchTerm === '' ||
            workshop.title.toLowerCase().includes(searchTerm) ||
            workshop.organizer.toLowerCase().includes(searchTerm) ||
            workshop.description.some(desc => desc.toLowerCase().includes(searchTerm)) ||
            workshop.location.toLowerCase().includes(searchTerm);

        // Type filter
        const matchesType = selectedTypes.size === 0 ||
            selectedTypes.has(workshop.type);

        return matchesSearch && matchesType;
    });

    // Sort workshops
    filteredWorkshops.sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return parseWorkshopDate(b.date) - parseWorkshopDate(a.date);
            case 'date-asc':
                return parseWorkshopDate(a.date) - parseWorkshopDate(b.date);
            case 'title':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });

    renderWorkshops();
}

// Parse certification date strings like "13/01/2025" (DD/MM/YYYY)
function parseCertificationDate(dateStr) {
    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1]);
        const month = parseInt(ddmmyyyy[2]) - 1;
        const year = parseInt(ddmmyyyy[3]);
        return new Date(year, month, day).getTime();
    }
    // Fallback to workshop date parser for other formats
    return parseWorkshopDate(dateStr);
}

// Parse workshop date strings like "January 2026" or "October - December 2024"
function parseWorkshopDate(dateStr) {
    const months = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3,
        'may': 4, 'june': 5, 'july': 6, 'august': 7,
        'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    // For date ranges, take the last date (e.g., "October - December 2024" -> December 2024)
    const parts = dateStr.split(' - ');
    const lastPart = parts[parts.length - 1].trim();

    // Extract month and year
    const match = lastPart.match(/([a-zA-Z]+)\s*(\d{4})/);
    if (match) {
        const month = months[match[1].toLowerCase()] || 0;
        const year = parseInt(match[2]);
        return new Date(year, month).getTime();
    }

    // Fallback: try to find just a year
    const yearMatch = lastPart.match(/(\d{4})/);
    if (yearMatch) {
        return new Date(parseInt(yearMatch[1]), 0).getTime();
    }

    return 0;
}

function renderWorkshops() {
    const container = document.getElementById('workshopsContainer');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!container) return;

    container.innerHTML = '';

    // Show/hide no results message
    if (filteredWorkshops.length === 0) {
        noResults?.classList.remove('d-none');
        if (resultsCount) resultsCount.textContent = 'No workshops or events found';
    } else {
        noResults?.classList.add('d-none');
        if (resultsCount) resultsCount.textContent = `Showing ${filteredWorkshops.length} workshop${filteredWorkshops.length !== 1 ? 's' : ''}/event${filteredWorkshops.length !== 1 ? 's' : ''}`;
    }

    filteredWorkshops.forEach((workshop, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-6';

        const descriptionHTML = workshop.description.map(desc => `<li>${desc}</li>`).join('');
        const takeawaysHTML = workshop.keyTakeaways ?
            workshop.keyTakeaways.map(takeaway => `<li>${takeaway}</li>`).join('') : '';

        const typeIcons = {
            'Workshop': 'fa-chalkboard-teacher',
            'External Expert': 'fa-user-tie',
            'Industry Visit': 'fa-building'
        };

        const typeIcon = typeIcons[workshop.type] || 'fa-calendar';

        col.innerHTML = `
            <div class="workshop-card h-100 fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="workshop-card-header">
                    <div class="workshop-type-badge">
                        <i class="fas ${typeIcon}"></i>
                        <span>${workshop.type}</span>
                    </div>
                    <h3 class="workshop-card-title">${workshop.title}</h3>
                    <p class="workshop-card-organizer"><i class="fas fa-users me-2"></i>${workshop.organizer}</p>
                </div>
                <div class="workshop-card-body">
                    <div class="workshop-card-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${workshop.date}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${workshop.location}</span>
                        <span><i class="fas fa-clock"></i> ${workshop.duration}</span>
                    </div>
                    <div class="workshop-card-description">
                        <ul class="custom-list">
                            ${descriptionHTML}
                        </ul>
                    </div>
                    ${takeawaysHTML ? `
                        <div class="workshop-takeaways">
                            <h4><i class="fas fa-lightbulb"></i> Key Takeaways</h4>
                            <ul class="custom-list">
                                ${takeawaysHTML}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        container.appendChild(col);
    });
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (body.classList.contains('projects-page')) {
        loadProjects();
    } else if (body.classList.contains('experience-page')) {
        loadExperience();
    } else if (body.classList.contains('education-page')) {
        loadEducation();
    } else if (body.classList.contains('certifications-page')) {
        loadCertifications();
    } else if (body.classList.contains('workshops-page')) {
        loadWorkshops();
    } else if (body.classList.contains('skills-page')) {
        loadSkills();
    } else if (body.classList.contains('reflection-page')) {
        loadReflection();
    }
});

// ===============================
// REFLECTION PAGE FUNCTIONS
// ===============================

async function loadReflection() {
    const data = await loadPortfolioData();
    if (!data || !data.reflection) return;

    const container = document.getElementById('reflectionContainer');
    if (!container) return;

    const reflection = data.reflection;

    const sectionsHTML = reflection.sections.map(section => `
        <div class="reflection-section">
            <div class="section-header">
                <div class="section-icon">
                    <i class="fas ${section.icon}"></i>
                </div>
                <h2>${section.title}</h2>
            </div>
            <div class="section-content">
                ${section.content.map(paragraph => `<p>${paragraph}</p>`).join('')}
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="reflection-intro">
            <h2><i class="fas fa-quote-left"></i> ${reflection.title}</h2>
            <p class="intro-text">${reflection.introduction}</p>
        </div>

        <div class="reflection-sections">
            ${sectionsHTML}
        </div>

        <div class="reflection-conclusion">
            <h2><i class="fas fa-flag-checkered"></i> Final Thoughts</h2>
            <p>${reflection.conclusion}</p>
        </div>
    `;
}

// ===============================
// PROJECT MODAL FUNCTIONS
// ===============================

let currentGalleryIndex = 0;
let currentProjectImages = [];

let projectModalInstance = null;

function openProjectModal(projectId) {
    const project = portfolioData.projects.find(p => p.id === projectId);
    if (!project || !project.modal) return;

    const modalEl = document.getElementById('projectModal');
    const modalData = project.modal;

    // Set basic info
    document.getElementById('projectModalLabel').textContent = project.title;
    document.getElementById('modalDate').textContent = project.date;
    document.getElementById('modalTech').textContent = project.technologies;
    document.getElementById('modalDescription').textContent = modalData.detailedDescription;

    // Render features
    const featuresContainer = document.getElementById('modalFeatures');
    featuresContainer.innerHTML = modalData.features.map(feature =>
        `<li>${feature}</li>`
    ).join('');

    // Render challenges
    const challengesContainer = document.getElementById('modalChallenges');
    challengesContainer.innerHTML = modalData.challenges.map(challenge =>
        `<li>${challenge}</li>`
    ).join('');

    // Render outcomes
    const outcomesContainer = document.getElementById('modalOutcomes');
    outcomesContainer.innerHTML = modalData.outcomes.map(outcome =>
        `<li>${outcome}</li>`
    ).join('');

    // Render links
    const linksContainer = document.getElementById('modalLinks');
    linksContainer.innerHTML = project.links.map(link =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary">
            <i class="${link.icon} me-2"></i>${link.text}
        </a>`
    ).join('');

    // Setup gallery
    currentProjectImages = modalData.images || [];
    currentGalleryIndex = 0;

    const gallerySection = document.getElementById('modalGallery');
    if (currentProjectImages.length > 0) {
        gallerySection.style.display = 'block';
        updateGalleryImage();
        renderThumbnails();
    } else {
        gallerySection.style.display = 'none';
    }

    // Show Bootstrap modal
    if (!projectModalInstance) {
        projectModalInstance = new bootstrap.Modal(modalEl);
    }
    projectModalInstance.show();
}

function closeProjectModal() {
    if (projectModalInstance) {
        projectModalInstance.hide();
    }
}

function updateGalleryImage() {
    if (currentProjectImages.length === 0) return;

    const mainImage = document.getElementById('galleryMainImage');
    const caption = document.getElementById('galleryCaption');
    const currentImage = currentProjectImages[currentGalleryIndex];

    mainImage.src = currentImage.url;
    mainImage.alt = currentImage.caption;
    caption.textContent = currentImage.caption;

    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentGalleryIndex);
    });
}

function renderThumbnails() {
    const thumbnailsContainer = document.getElementById('galleryThumbnails');

    if (currentProjectImages.length <= 1) {
        thumbnailsContainer.style.display = 'none';
        return;
    }

    thumbnailsContainer.style.display = 'flex';
    thumbnailsContainer.innerHTML = currentProjectImages.map((img, index) => `
        <button class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
                onclick="selectGalleryImage(${index})"
                aria-label="View image ${index + 1}">
            <img src="${img.url}" alt="${img.caption}">
        </button>
    `).join('');
}

function selectGalleryImage(index) {
    currentGalleryIndex = index;
    updateGalleryImage();
}

function navigateGallery(direction) {
    if (currentProjectImages.length === 0) return;

    currentGalleryIndex += direction;
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = currentProjectImages.length - 1;
    } else if (currentGalleryIndex >= currentProjectImages.length) {
        currentGalleryIndex = 0;
    }
    updateGalleryImage();
}

// Make modal functions globally accessible
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.selectGalleryImage = selectGalleryImage;
window.navigateGallery = navigateGallery;
