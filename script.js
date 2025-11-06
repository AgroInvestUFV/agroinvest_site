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
  
  // Chamada para carregar o Conteúdo Dinâmico
  if (typeof fetchContent !== 'undefined') {
      fetchContent();
  }
   

    // Carregar Notícias
    if (typeof fetchNews !== 'undefined') {
        fetchNews();
    }
});

// Funcionalidade para as abas de conteúdo
// Funcionalidade para as abas de conteúdo
function openTab(tabId, buttonElement) {
    // 1. Esconde todos os conteúdos
    document.querySelectorAll('.tab-content-dynamic').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none'; // Usado para garantir que não ocupe espaço
    });

    // 2. Desativa todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // 3. Exibe o conteúdo desejado
    const targetContent = document.getElementById(tabId + '-content');
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block'; // Mostra o conteúdo
    }

    // 4. Ativa o botão
    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Se chamado sem o botão (ex: na inicialização), procura pelo botão
        const autoButton = document.querySelector(`.tab-button[data-tab-id="${tabId}"]`);
        if (autoButton) {
             autoButton.classList.add('active');
        }
    }
}

// --- FUNÇÃO PARA CARREGAR O CONTEÚDO DINÂMICO ---
async function fetchContent() {
    const tabsContainer = document.getElementById('content-tabs-container');
    const displayArea = document.getElementById('content-display-area');

    if (!tabsContainer || !displayArea) return;

    tabsContainer.innerHTML = '<p>Carregando conteúdo...</p>';

    try {
        const response = await fetch('/content.json');

        if (!response.ok) {
             tabsContainer.innerHTML = '<p style="color: red;">Não foi possível carregar a base de conteúdo (content.json).</p>';
             return;
        }

        const contentData = await response.json();
        let tabsHtml = '';
        let contentHtml = '';
        let firstTabId = '';

        contentData.forEach((item, index) => {
            // 1. Cria o HTML do Botão
            const isActive = index === 0;
            if (index === 0) {
                firstTabId = item.id;
            }

            tabsHtml += `
                <button 
                    class="tab-button" 
                    data-tab-id="${item.id}"
                    onclick="openTab('${item.id}', this)">
                    ${item.title}
                </button>
            `;

            // 2. Cria o HTML do Conteúdo
            contentHtml += `
                <div id="${item.id}-content" class="tab-content-dynamic tab-content" style="display: none;">
                    ${item.html_content}
                </div>
            `;
        });

        // 3. Insere no HTML
        tabsContainer.innerHTML = tabsHtml;
        displayArea.innerHTML = contentHtml;

        // 4. Ativa a primeira aba por padrão
        if (firstTabId) {
            openTab(firstTabId);
        }

    } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        tabsContainer.innerHTML = '<p style="color: red;">Falha ao processar o conteúdo.</p>';
    }
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
async function initLogisticaMap() {
  // ====== CONFIG ======
  const SHEET_ID  = '1Od8M31I6WNJsBBYXb0uWgou5el3C616n';
  const SHEET_GID = '1325738157'; // gid da aba "Dados Relatório (BI)"
  const buildTsvUrl = (id, gid) =>
    `https://docs.google.com/spreadsheets/d/${id}/export?format=tsv&gid=${gid}`;

  // ====== HELPERS ======
  const normalizeKey = (s) => (s || '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const parseNumberBR = (val) => {
    if (val == null) return null;
    if (typeof val === 'number') return val;
    let s = String(val).trim();
    s = s.replace(/[\u2212\u2012\u2013\u2014]/g, '-').replace(/\s+/g, '');
    s = s.replace(/[^\d.,-]/g, '');
    if (!s) return null;
    const norm = s.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
    const n = Number(norm);
    return Number.isFinite(n) ? n : null;
  };

  function parseTSV(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    return lines.map(line => line.split('\t'));
  }

  function tsvToObjects(text) {
    const matrix = parseTSV(text).filter(row => row.length && row.some(x => x !== ''));
    if (!matrix.length) return [];
    const headers = matrix[0].map(h => (h || '').toString().trim());
    const out = [];
    for (let r = 1; r < matrix.length; r++) {
      const obj = {};
      const line = matrix[r];
      for (let c = 0; c < headers.length; c++) {
        obj[headers[c]] = line[c] !== undefined ? line[c] : null;
      }
      out.push(obj);
    }
    return out;
  }

  const pick = (row, wantedKeys) => {
    const map = {};
    Object.keys(row).forEach(k => { map[normalizeKey(k)] = k; });
    for (const target of wantedKeys) {
      const keyNorm = normalizeKey(target);
      const hit = Object.keys(map).find(n => n === keyNorm);
      if (hit) return row[map[hit]];
    }
    for (const target of wantedKeys) {
      const keyNorm = normalizeKey(target);
      const hit = Object.keys(map).find(n => n.includes(keyNorm));
      if (hit) return row[map[hit]];
    }
    return null;
  };

  // ====== MAPA BASE ======
  const el = document.getElementById('mapa-agrolog');
  if (!el) return;

  const map = L.map('mapa-agrolog').setView([-14.235, -51.9253], 5);
  window.mapInstance = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  }).addTo(map);

  const infoPanel = document.getElementById('porto-info-panel');
  const fmt = new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' });

  const showMaintenance = (msg = 'Este setor está em manutenção.') => {
    infoPanel.innerHTML = `
      <h3>Logística</h3>
      <p style="font-size:.95em;color:#555">${msg}</p>
    `;
  };

  function updateInfoPanel(p) {
    infoPanel.innerHTML = `
      <h3>${p.nome || 'Porto'}</h3>
      <p style="font-size:.9em;color:#555">Tipo: ${p.tipo_porto || '—'}</p>
      <p style="font-size:.9em;color:#555">Volumes (${p.unidade || 'Ton/Ano'})</p>
      <ul>
        <li><span>Soja Exportada:</span> <span>${p.volume_soja != null ? fmt.format(p.volume_soja) : 'N/A'}</span></li>
        <li><span>Milho Exportado:</span> <span>${p.volume_milho != null ? fmt.format(p.volume_milho) : 'N/A'}</span></li>
        <li><span>Fertilizante Importado:</span> <span>${p.volume_fertilizantes != null ? fmt.format(p.volume_fertilizantes) : 'N/A'}</span></li>
      </ul>
    `;
  }

  // ====== BUSCA TSV ======
  let rows = null;
  try {
    const res = await fetch(buildTsvUrl(SHEET_ID, SHEET_GID));
    if (!res.ok) {
      showMaintenance(`Falha ao acessar a planilha (HTTP ${res.status}). Verifique o compartilhamento e o GID.`);
      console.warn('HTTP error', res.status, await res.text());
      return;
    }
    const tsv = await res.text();
    rows = tsvToObjects(tsv);
  } catch (e) {
    showMaintenance(`Erro de rede ao buscar a planilha (TSV). Veja o console.`);
    console.warn('Fetch/TSV error', e);
    return;
  }

  // ====== NORMALIZAÇÃO ======
  let features = null;
  if (Array.isArray(rows) && rows.length) {
    features = rows.map(r => {
      const nome  = pick(r, ['Nome do Porto']);
      const soja  = parseNumberBR(pick(r, ['Movimentação de Soja (t)', 'Movimentacao de Soja']));
      const milho = parseNumberBR(pick(r, ['Movimentação de Milho (t)', 'Movimentacao de Milho']));
      const fert  = parseNumberBR(pick(r, ['Movimentação Fertilizantes (t)', 'Movimentacao Fertilizantes']));
      let lon = parseNumberBR(pick(r, ['Coordenadas (X)', 'Longitude', 'X']));
      let lat = parseNumberBR(pick(r, ['Coordenadas (Y)', 'Latitude', 'Y']));
      const tipo  = pick(r, ['Tipo de Porto', 'Tipo']);
      const unidade = 'Ton/Ano';

      if (!(Number.isFinite(lon) && Number.isFinite(lat))) return null;
      if (lon > 0 && lon <= 100) lon = -lon;

      return {
        type: 'Feature',
        properties: { nome, unidade, volume_soja: soja, volume_milho: milho, volume_fertilizantes: fert, tipo_porto: tipo },
        geometry: { type: 'Point', coordinates: [lon, lat] }
      };
    }).filter(Boolean);
  }

  if (!features || !features.length) {
    const sample = rows && rows[0] ? Object.keys(rows[0]).join(' | ') : '(sem linhas)';
    showMaintenance(`Sem dados válidos. Confira cabeçalhos e coordenadas. Detectei: ${sample}`);
    console.warn('Primeira linha detectada:', rows && rows[0]);
    return;
  }

  // ====== DESENHO ======
  const totalVol = f => (f.properties.volume_soja || 0) + (f.properties.volume_milho || 0) + (f.properties.volume_fertilizantes || 0);
  const max = Math.max(...features.map(totalVol)) || 1;

  features.forEach(f => {
    const [lon, lat] = f.geometry.coordinates;
    const peso = totalVol(f) / max;
    const r = 6 + Math.round(14 * Math.sqrt(peso));

    const marker = L.circleMarker([lat, lon], {
      radius: r,
      weight: 2,
      color: '#ffffff',
      fillColor: '#007bff',
      fillOpacity: 0.9
    }).addTo(map);

    marker.on('click', () => {
      updateInfoPanel(f.properties);
      map.flyTo([lat, lon], 8);
    });

    const tipo = f.properties.tipo_porto ? ` · ${f.properties.tipo_porto}` : '';
    marker.bindTooltip(`${f.properties.nome || 'Porto'}${tipo} — ${fmt.format(totalVol(f))} ${f.properties.unidade || ''}`);
  });

  // ====== AUTO AJUSTE DE ZOOM ======
  const latlngs = features.map(f => [f.geometry.coordinates[1], f.geometry.coordinates[0]]);
  if (latlngs.length) {
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds.pad(0.08));
  }
}








