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

                // 3. (IMPORTANTE PARA MAPAS) Garante que o mapa recalcule o tamanho ao ser exibido
                if (targetId === 'logistica' && typeof initLogisticaMap !== 'undefined') {
                     // Adiciona um pequeno delay para a seção ter tempo de aparecer antes de invalidar o mapa
                     setTimeout(() => {
                         // O Leaflet precisa ser invalidado ao tornar o mapa visível
                         if (window.mapInstance) {
                             window.mapInstance.invalidateSize();
                         }
                     }, 100); 
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

    // --- CHAMADAS DE INICIALIZAÇÃO UNIFICADAS ---

    // Ativa a primeira aba de conteúdo por padrão (Função do Bloco 2)
    const firstTabButton = document.querySelector('.content-tabs .tab-button');
    if (firstTabButton) {
        firstTabButton.click(); 
    }

    // Carregar Notícias
    if (typeof fetchNews !== 'undefined') {
        fetchNews();
    }

    // Inicializar o Mapa
    if (typeof initLogisticaMap !== 'undefined') {
        initLogisticaMap(); 
    }

    // A lógica de preços CEPEA foi removida/comentada, então não precisa de chamada.
});

// Funcionalidade para as abas de conteúdo dentro da seção "Nosso Conteúdo" (Mantida inalterada)
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


// --- FUNCIONALIDADE PARA A SEÇÃO LOGÍSTICA (MAPA) ---
// MOVEMOS A VARIÁVEL map para o window.mapInstance para usarmos no clique
window.mapInstance = null; // Variável global para guardar a instância do mapa

function initLogisticaMap() {
    // 1. Verifica se o elemento do mapa existe
    if (!document.getElementById('mapa-agrolog')) return;

    // Se já foi inicializado, apenas retorna
    if (window.mapInstance) return; 

    // Inicializa o mapa, centralizado no Brasil
    const map = L.map('mapa-agrolog').setView([-14.235, -51.9253], 5);
    window.mapInstance = map; // Salva a instância na variável global

    // Adiciona a camada de tiles (fundo do mapa)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
    }).addTo(map);

    const infoPanel = document.getElementById('porto-info-panel');

    // Função para exibir as informações no painel
    function updateInfoPanel(properties) {
        // Exemplo: O GeoJSON DEVE ter propriedades como 'nome', 'volume_soja', etc.
        let htmlContent = `
            <h3>${properties.nome || 'Porto Desconhecido'}</h3>
            <p style="font-size: 0.9em; color: #555;">Volumes de Carga (Dados Integrados):</p>
            <ul>
                <li><span>Soja Exportada:</span> <span>${properties.volume_soja ? properties.volume_soja.toLocaleString('pt-BR') : 'N/A'} ${properties.unidade || 'Ton'}</span></li>
                <li><span>Milho Exportado:</span> <span>${properties.volume_milho ? properties.volume_milho.toLocaleString('pt-BR') : 'N/A'} ${properties.unidade || 'Ton'}</span></li>
                <li><span>Açúcar Exportado:</span> <span>${properties.volume_acucar ? properties.volume_acucar.toLocaleString('pt-BR') : 'N/A'} ${properties.unidade || 'Ton'}</span></li>
                <li><span>Importação Total:</span> <span>${properties.volume_importacao ? properties.volume_importacao.toLocaleString('pt-BR') : 'N/A'} ${properties.unidade || 'Ton'}</span></li>
            </ul>
            <p style="font-size: 0.8em; margin-top: 10px; color: #777;">Dados em ${properties.unidade || 'Toneladas'}.</p>
        `;
        infoPanel.innerHTML = htmlContent;
    }

    // --- 2. Carregamento do GeoJSON de Portos ---
    fetch('portos.geojson') // O GeoJSON deve estar na raiz do seu projeto
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar portos.geojson. Verifique o nome do arquivo.');
            return response.json();
        })
        .then(portosGeoJSON => {
            L.geoJSON(portosGeoJSON, {
                pointToLayer: function (feature, latlng) {
                    // Usa o ícone customizado definido no CSS
                    const portoIcon = L.divIcon({
                        className: 'custom-porto-icon',
                        iconSize: [18, 18],
                        html: '<div></div>'
                    });
                    return L.marker(latlng, { icon: portoIcon });
                },
                onEachFeature: function (feature, layer) {
                    // Adiciona a interatividade de clique
                    layer.on('click', function() {
                        updateInfoPanel(feature.properties);
                        map.flyTo(layer.getLatLng(), 8); // Move o mapa e dá zoom no porto
                    });
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Erro no processamento do mapa de Portos:', error);
            infoPanel.innerHTML = '<p style="color: red;">Erro ao carregar dados geográficos. Certifique-se de que o arquivo <b>portos.geojson</b> está na raiz do projeto e tem o formato correto.</p>';
        });
}


// --- A FUNÇÃO fetchNews() DEVE ESTAR AQUI TAMBÉM ---
// (Como você não enviou o código dela, ela está faltando na análise final,
// mas vou presumir que você a colará abaixo do initLogisticaMap.)

// Exemplo (cole a sua versão correta aqui):
/*
async function fetchNews() {
    // ... sua lógica de leitura do news.json ...
}
*/