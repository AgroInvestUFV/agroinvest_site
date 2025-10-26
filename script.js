// VARIÁVEL GLOBAL PARA GUARDAR A INSTÂNCIA DO MAPA
window.mapInstance = null;
let mapInitialized = false; // Flag para garantir que inicializa só uma vez

// --- FUNCIONALIDADE PRINCIPAL E NAVEGAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {

    // Funcionalidade de navegação entre seções
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // 1. Controle da navegação (links ativos)
            navLinks.forEach(link => link.classList.remove('active-nav'));
            this.classList.add('active-nav');

            const targetId = this.getAttribute('href').substring(1);

            // 2. Controle das seções (mostrar/esconder)
            sections.forEach(section => {
                section.classList.remove('active-section');
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active-section');

                // 3. (RESOLVE O PROBLEMA DO MAPA) Inicializa ou recalcula o mapa
                if (targetId === 'logistica' && typeof initLogisticaMap !== 'undefined') {
                     // Adiciona um pequeno delay para a seção ter tempo de aparecer
                     setTimeout(() => {
                         // Verifica se o Leaflet está carregado E se o mapa não foi inicializado
                         if (typeof L !== 'undefined' && !mapInitialized) {
                            initLogisticaMap();
                            mapInitialized = true;
                        } else if (window.mapInstance) {
                            // Se já inicializado, apenas garante que o tamanho está correto
                            window.mapInstance.invalidateSize(); 
                        }
                     }, 50);
                }
            }

            // 4. Rolagem suave para a seção
            document.getElementById(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Abrir a seção 'home' por padrão no carregamento e ativar o link de navegação correspondente
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('active-section');
        const homeNavLink = document.querySelector('nav ul li a[href="#home"]');
        if (homeNavLink) {
            homeNavLink.classList.add('active-nav');
        }
    }

    // --- CHAMADAS DE INICIALIZAÇÃO SECUNDÁRIAS ---

    // Ativa a primeira aba de conteúdo por padrão
    const firstTabButton = document.querySelector('.content-tabs .tab-button');
    if (firstTabButton) {
        firstTabButton.click(); 
    }

    // Carregar Notícias
    if (typeof fetchNews !== 'undefined') {
        fetchNews();
    }
});

// Funcionalidade para as abas de conteúdo
function openTab(evt, tabName) {
    let i, tabcontent, tabbuttons;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// --- FUNÇÃO PARA AS NOTÍCIAS (REQUER O ARQUIVO news.json) ---
async function fetchNews() {
    const newsContainer = document.getElementById('news-feed-container');
    if (!newsContainer) return; 

    newsContainer.innerHTML = '<p>Carregando notícias do feed...</p>';

    try {
        const response = await fetch('/news.json');

        if (!response.ok) {
             newsContainer.innerHTML = '<p style="color: blue;">Em breve: Notícias atualizadas diariamente! (Arquivo news.json não encontrado ou vazio).</p>';
             return;
        }

        const newsData = await response.json();
        newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

        let htmlContent = '';

        if (newsData.length === 0) {
            htmlContent = '<p>Nenhuma notícia disponível no momento.</p>';
        } else {
            newsData.forEach(item => {
                const formattedDate = new Date(item.date).toLocaleDateString('pt-BR');

                const imageHtml = item.image_url 
                    ? `<img src="${item.image_url}" alt="${item.title}" class="news-image">`
                    : '';

                htmlContent += `
                    <div class="news-item">
                        ${imageHtml}
                        <h3>${item.title}</h3>
                        <div class="news-meta">
                            <span>Data: ${formattedDate}</span>
                            <span>Autor: ${item.author}</span>
                        </div>
                        <p class="news-summary">${item.summary}</p>
                        ${item.link_url ? `<p><a href="${item.link_url}">${item.link_text || 'Saiba Mais'} &rarr;</a></p>` : ''}
                    </div>
                `;
            });
        }
        newsContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Erro ao buscar notícias:", error);
        newsContainer.innerHTML = '<p style="color: red;">Não foi possível carregar o feed de notícias. Verifique o console para detalhes.</p>';
    }
}


// --- FUNCIONALIDADE PARA A SEÇÃO LOGÍSTICA (MAPA) ---
function initLogisticaMap() {
    // DADOS SIMULADOS (Para garantir que o mapa funcione sem o portos.geojson)
    const portosDataSimulados = [
        {
            nome: "Porto de Santos (SP)",
            lat: -23.9455,
            lon: -46.3364,
            volume_soja: 22500000,
            volume_milho: 15800000,
            volume_acucar: 8100000,
            volume_importacao: 5000000,
            unidade: "Ton/Ano"
        },
        {
            nome: "Porto de Paranaguá (PR)",
            lat: -25.5039,
            lon: -48.5146,
            volume_soja: 16200000,
            volume_milho: 9300000,
            volume_acucar: 0,
            volume_importacao: 3500000,
            unidade: "Ton/Ano"
        },
        {
            nome: "Porto de Rio Grande (RS)",
            lat: -32.0354,
            lon: -52.0963,
            volume_soja: 10900000,
            volume_milho: 0,
            volume_acucar: 0,
            volume_importacao: 1500000,
            unidade: "Ton/Ano"
        },
        {
            nome: "Porto de Itaqui (MA)",
            lat: -2.5714,
            lon: -44.3411,
            volume_soja: 7800000,
            volume_milho: 5000000,
            volume_acucar: 0,
            volume_importacao: 2500000,
            unidade: "Ton/Ano"
        }
    ];

    // 1. Verifica se o elemento do mapa existe
    if (!document.getElementById('mapa-agrolog')) return;

    // Inicializa o mapa, centralizado no Brasil
    const map = L.map('mapa-agrolog').setView([-14.235, -51.9253], 5);
    window.mapInstance = map; // Salva a instância globalmente

    // Adiciona a camada de tiles (fundo do mapa)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map);

    const infoPanel = document.getElementById('porto-info-panel');
    const formatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' });

    // Função para exibir as informações no painel
    function updateInfoPanel(properties) {
        let htmlContent = `
            <h3>${properties.nome || 'Porto Desconhecido'}</h3>
            <p style="font-size: 0.9em; color: #555;">Volumes de Carga (Dados Simulados - ${properties.unidade}):</p>
            <ul>
                <li><span>Soja Exportada:</span> <span>${properties.volume_soja ? formatter.format(properties.volume_soja) : 'N/A'}</span></li>
                <li><span>Milho Exportado:</span> <span>${properties.volume_milho ? formatter.format(properties.volume_milho) : 'N/A'}</span></li>
                <li><span>Açúcar Exportado:</span> <span>${properties.volume_acucar ? formatter.format(properties.volume_acucar) : 'N/A'}</span></li>
                <li><span>Importação Total:</span> <span>${properties.volume_importacao ? formatter.format(properties.volume_importacao) : 'N/A'}</span></li>
            </ul>
        `;
        infoPanel.innerHTML = htmlContent;
    }

    // --- Adicionando Marcadores Simulados ---
    portosDataSimulados.forEach(porto => {
        const marker = L.marker([porto.lat, porto.lon]).addTo(map);

        const portoIcon = L.divIcon({
            className: 'custom-porto-icon',
            iconSize: [18, 18],
            html: '<div></div>'
        });
        marker.setIcon(portoIcon);

        marker.on('click', function() {
            updateInfoPanel(porto);
            map.flyTo(marker.getLatLng(), 8);
        });
    });

}