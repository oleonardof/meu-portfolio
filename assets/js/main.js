// Função executada quando o conteúdo da página está pronto
document.addEventListener('DOMContentLoaded', () => {

    // --- SCRIPTS GLOBAIS (para todas as páginas) ---

    // 1. Lógica do Modo Escuro (Dark Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        htmlElement.classList.toggle('dark', isDark);
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Aplica o tema salvo ou o preferido pelo sistema
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    // 2. Lógica do Menu Mobile
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Fecha o menu mobile ao clicar em um link
        document.querySelectorAll('#mobileMenu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // 3. Lógica do Botão "Voltar ao Topo"
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.onscroll = () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        };
        backToTopBtn.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }

    // 4. Lógica de Scroll Suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            } else if (targetId === '#') {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // 5. Atualização dinâmica do ano no rodapé
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
    

    // --- SCRIPTS ESPECÍFICOS POR PÁGINA ---

    // 1. Script do Formulário de Contato (só roda se encontrar o form na página)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const successMessage = document.getElementById('formSuccess');
        const submitButton = document.getElementById('submit-button');

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => { object[key] = value; });
            
            object.message = `Assunto do Usuário: ${object.assunto_usuario}\n\nMensagem:\n${object.message}`;
            const json = JSON.stringify(object);

            submitButton.disabled = true;
            submitButton.innerHTML = "Enviando...";

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    successMessage.classList.remove('hidden');
                    contactForm.reset();
                    contactForm.style.display = 'none';
                } else {
                    console.error('Erro:', jsonResponse);
                    alert('Ops! Algo deu errado: ' + jsonResponse.message);
                }
            })
            .catch(error => {
                console.error('Erro de conexão:', error);
                alert('Houve um problema de conexão. Por favor, tente novamente.');
            })
            .finally(() => {
                if (contactForm.style.display !== 'none') {
                    submitButton.disabled = false;
                    submitButton.innerHTML = "Enviar Mensagem";
                }
            });
        });
    }

    // 2. Script das Barras de Habilidades e Gráfico (só rodam na index.html)
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        // Animação das barras
        const animateSkillBars = () => {
            document.querySelectorAll('.skill-bar').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => { bar.style.width = width; }, 100);
            });
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkillBars();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(skillsSection);

        // Gráfico Chart.js
        const ctx = document.getElementById('chartLanguages');
        if(ctx) {
            const chartLanguages = new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Power BI', 'SQL', 'Python', 'Excel'],
                    datasets: [{
                        data: [50, 20, 5, 25],
                        backgroundColor: ['#F97316', '#10B981', '#F59E0B', '#8B5CF6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 20,
                                color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563'
                            }
                        }
                    }
                }
            });
            // Observa mudança de tema para atualizar cor da legenda
            new MutationObserver(() => {
                chartLanguages.options.plugins.legend.labels.color = document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#4B5563';
                chartLanguages.update();
            }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // 3. Script para clique nos cards de projeto (funciona na index e na projects)
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const data = link.dataset;
            const params = new URLSearchParams({
                title: data.title,
                description: data.description,
                icon: data.icon,
                tech: data.tech,
                github: data.github,
                powerbi: data.powerbi
            });
            window.location.href = `project_detail.html?${params.toString()}`;
        });
    });

    // 4. Script para preencher a página de detalhes do projeto
    if (document.getElementById('project-detail-title')) {
        const params = new URLSearchParams(window.location.search);
        const title = params.get('title');
        const description = params.get('description');
        const iconClass = params.get('icon');
        const githubUrl = params.get('github');
        const powerbiEmbedUrl = params.get('powerbi');
        const techStack = params.get('tech');

        if (title) document.getElementById('project-detail-title').textContent = `Detalhes: ${title}`;
        if (title) document.getElementById('project-title').textContent = title;
        if (description) document.getElementById('project-description').textContent = description;
        if (iconClass) document.getElementById('project-icon').className = `${iconClass} text-7xl text-orange-600 dark:text-orange-400`;

        const githubLink = document.getElementById('project-github-link');
        if (githubUrl && githubUrl !== '#') {
            githubLink.href = githubUrl;
            githubLink.style.display = 'flex';
        } else {
            githubLink.style.display = 'none';
        }

        const powerbiEmbedArea = document.getElementById('powerbi-embed-area');
        const noPowerbiMessage = document.getElementById('no-powerbi-message');
        if (powerbiEmbedUrl && powerbiEmbedUrl.startsWith('http')) {
            if (noPowerbiMessage) noPowerbiMessage.style.display = 'none';
            const iframe = document.createElement('iframe');
            iframe.src = powerbiEmbedUrl;
            iframe.title = `Dashboard Power BI: ${title}`;
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowFullScreen', 'true');
            powerbiEmbedArea.appendChild(iframe);
        } else {
             if(noPowerbiMessage) noPowerbiMessage.style.display = 'flex';
        }

        const techStackContainer = document.getElementById('project-tech-stack');
        if (techStack) {
            techStack.split(',').forEach(tech => {
                const span = document.createElement('span');
                span.className = 'bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full dark:bg-orange-900/50 dark:text-orange-300';
                span.textContent = tech.trim();
                techStackContainer.appendChild(span);
            });
        }
    }

    // LÓGICA DO AVISO DE COOKIES
    const banner = document.getElementById('cookie-consent-banner');
    const acceptBtn = document.getElementById('cookie-consent-button');

    // Verifica se o cookie de consentimento existe
    const hasConsent = getCookie('cookie_consent_accepted');

    if (!hasConsent && banner) {
        // Mostra o banner se não houver consentimento
        setTimeout(() => {
            banner.classList.add('active');
        }, 500);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            // Define o cookie para expirar em 1 ano
            setCookie('cookie_consent_accepted', 'true', 365);
            banner.classList.remove('active');
        });
    }

    // Funções auxiliares para manipular cookies
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
});