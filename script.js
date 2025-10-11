document.addEventListener('DOMContentLoaded', () => {
    // Funcionalidade de navegação entre seções
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove a classe 'active-nav' de todos os links de navegação
            navLinks.forEach(link => link.classList.remove('active-nav'));
            // Adiciona a classe 'active-nav' ao link clicado
            this.classList.add('active-nav');

            const targetId = this.getAttribute('href').substring(1);

            // Remove a classe 'active-section' de todas as seções
            sections.forEach(section => {
                section.classList.remove('active-section');
            });
            // Adiciona a classe 'active-section' à seção alvo para mostrá-la
            document.getElementById(targetId).classList.add('active-section');

            // Rolagem suave para a seção
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

    // Carregar preços ao iniciar
 //   fetchPrices();
    // Atualizar preços a cada 10 minutos (600000 ms) - Você pode ajustar a frequência
 //   setInterval(fetchPrices, 600000); 
});

// Funcionalidade para as abas de conteúdo dentro da seção "Nosso Conteúdo"
function openTab(evt, tabName) {
    let i, tabcontent, tabbuttons;

    // Esconde todo o conteúdo das abas
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    // Remove a classe 'active' de todos os botões de aba
    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
    }

    // Mostra o conteúdo da aba clicada e ativa o botão correspondente
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Abrir a primeira aba de conteúdo por padrão ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const firstTabButton = document.querySelector('.content-tabs .tab-button');
    if (firstTabButton) {
        firstTabButton.click(); // Simula o clique no primeiro botão de aba
    }
});

// --- Funcionalidade para a aba de preços ---
// async function fetchPrices() {
//    const pricesContainer = document.getElementById('prices-container');
//    const lastUpdatedTime = document.getElementById('last-updated-time');
//    pricesContainer.innerHTML = '<p>Carregando dados de preços...</p>'; // Mensagem de carregamento

//    try {
        // Faz a requisição para o seu arquivo prices.json
//        const response = await fetch('/prices.json');

 //       // Verifica se a requisição foi bem-sucedida (status 200 OK)
//        if (!response.ok) {
//            throw new Error(`Erro HTTP! Status: ${response.status}`);
//        }

//        const pricesToDisplay = await response.json(); // Converte a resposta para JSON

//        let htmlContent = '';
//        pricesToDisplay.forEach(item => {
            // Usa o campo 'direction' para adicionar a classe CSS correspondente ('up', 'down', 'unchanged')
//            const changeClass = item.direction === 'up' ? 'up' : (item.direction === 'down' ? 'down' : 'unchanged');
//            htmlContent += `
//                <div class="price-item">
 //                   <strong>${item.name}:</strong> 
//                    <span class="price-value-change">
 //                       ${item.value} 
 //                       (<span class="change ${changeClass}">${item.change}</span>)
 //                   </span>
 //               </div>
 //           `;
//        });
//        pricesContainer.innerHTML = htmlContent; // Insere o HTML gerado no contêiner de preços
//        lastUpdatedTime.textContent = new Date().toLocaleString('pt-BR'); // Atualiza o horário da última atualização

//    } catch (error) {
//        console.error("Erro ao buscar preços:", error);
//        pricesContainer.innerHTML = '<p>Não foi possível carregar os preços no momento. Verifique o arquivo prices.json.</p>';
//        lastUpdatedTime.textContent = 'Erro na atualização';
//    }
//}