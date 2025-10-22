// Data Loader for Portfolio Pages
async function loadPortfolioData() {
    try {
        const response = await fetch('data.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading portfolio data:', error);
        return null;
    }
}

// Load Projects
async function loadProjects() {
    const data = await loadPortfolioData();
    if (!data || !data.projects) return;

    const container = document.querySelector('.main-section .container');
    if (!container) return;

    container.innerHTML = '';

    data.projects.forEach(project => {
        const article = document.createElement('article');
        article.className = 'item';

        const descriptionHTML = project.description.map(desc => `<li>${desc}</li>`).join('');
        const linksHTML = project.links.map(link =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn" aria-label="${link.text}">${link.text} <i class="${link.icon}"></i></a>`
        ).join('');

        article.innerHTML = `
            <div class="box">
                <h2 class="heading">${project.title}</h2>
                <p class="date">📅 ${project.date}</p>
                <ul class="list">
                    ${descriptionHTML}
                    <li><strong>Technologies:</strong> ${project.technologies}</li>
                </ul>
                ${linksHTML}
            </div>
        `;

        container.appendChild(article);
    });
}

// Load Experience
async function loadExperience() {
    const data = await loadPortfolioData();
    if (!data || !data.experience) return;

    const container = document.querySelector('.main-section .container');
    if (!container) return;

    container.innerHTML = '';

    data.experience.forEach(exp => {
        const article = document.createElement('article');
        article.className = 'item';

        const descriptionHTML = exp.description.map(desc => `<li>${desc}</li>`).join('');

        article.innerHTML = `
            <div class="box">
                <h2 class="heading">${exp.title}</h2>
                <p class="date">
                    <span>📅 ${exp.date}</span>
                    <br>
                    <span>📍 ${exp.location}</span>
                </p>
                <ul class="list">
                    ${descriptionHTML}
                </ul>
            </div>
        `;

        container.appendChild(article);
    });
}

// Load Education
async function loadEducation() {
    const data = await loadPortfolioData();
    if (!data || !data.education) return;

    const container = document.querySelector('.main-section .container');
    if (!container) return;

    container.innerHTML = '';

    data.education.forEach(edu => {
        const article = document.createElement('article');
        article.className = 'item';

        const descriptionHTML = edu.description.map(desc => `<li>${desc}</li>`).join('');

        article.innerHTML = `
            <div class="box">
                <h2 class="heading">${edu.title}</h2>
                <p class="date">
                    <span>📅 ${edu.date}</span>
                    <br>
                    <span>📍 ${edu.location}</span>
                </p>
                <ul class="list">
                    ${descriptionHTML}
                </ul>
            </div>
        `;

        container.appendChild(article);
    });
}

// Load Certifications
async function loadCertifications() {
    const data = await loadPortfolioData();
    if (!data || !data.certifications) return;

    const container = document.querySelector('.main-section .container');
    if (!container) return;

    container.innerHTML = '';

    data.certifications.forEach(cert => {
        const article = document.createElement('article');
        article.className = 'item';

        article.innerHTML = `
            <div class="box">
                <div class="badge-container">
                    <img src="${cert.badgeImage}" alt="${cert.title} Badge" class="badge-image" loading="lazy">
                </div>
                <div class="text-container">
                    <h2 class="heading">${cert.title}</h2>
                    <p class="date">📅 Earned: ${cert.date}</p>
                    <ul class="list">
                        <li>Issued by ${cert.issuer}</li>
                        <li>${cert.description}</li>
                    </ul>
                    <a href="${cert.badgeUrl}" target="_blank" rel="noopener noreferrer" class="btn" aria-label="View ${cert.title} Badge">
                        View Badge <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;

        container.appendChild(article);
    });
}

// Load Skills
async function loadSkills() {
    const data = await loadPortfolioData();
    if (!data || !data.skills) return;

    const container = document.querySelector('.main-section .container');
    if (!container) return;

    container.innerHTML = '';

    // Technical Skills
    if (data.skills.technical) {
        const technicalArticle = document.createElement('article');
        technicalArticle.className = 'item';

        const technicalList = data.skills.technical.map(skill =>
            `<li><strong>${skill.category}:</strong> ${skill.items}</li>`
        ).join('');

        technicalArticle.innerHTML = `
            <div class="box technical-list">
                <h2 class="heading">Technical Skills</h2>
                <ul class="list">
                    ${technicalList}
                </ul>
            </div>
        `;

        container.appendChild(technicalArticle);
    }

    // Language Skills
    if (data.skills.languages) {
        const languageArticle = document.createElement('article');
        languageArticle.className = 'item';

        const languageList = data.skills.languages.map(lang =>
            `<li><strong>${lang.language}:</strong> ${lang.level}</li>`
        ).join('');

        languageArticle.innerHTML = `
            <div class="box language-list">
                <h2 class="heading">Language Skills</h2>
                <ul class="list">
                    ${languageList}
                </ul>
            </div>
        `;

        container.appendChild(languageArticle);
    }

    // Hobbies
    if (data.skills.hobbies) {
        const hobbiesArticle = document.createElement('article');
        hobbiesArticle.className = 'item';

        const hobbiesList = data.skills.hobbies.map(hobby =>
            `<li>${hobby.icon} ${hobby.name}</li>`
        ).join('');

        hobbiesArticle.innerHTML = `
            <div class="box hobbies-list">
                <h2 class="heading">Hobbies & Interests</h2>
                <ul class="list">
                    ${hobbiesList}
                </ul>
            </div>
        `;

        container.appendChild(hobbiesArticle);
    }
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
    } else if (body.classList.contains('skills-page')) {
        loadSkills();
    }
});
