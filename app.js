const API_URL = 'http://localhost:3000/api/login'; 
let dadosAtuais = null;
let patchSelecionado = 'infinity';
let tipoAlvoSelecionado = 'patch';

async function fazerLogin() {
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('/api/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            dadosAtuais = dados; // <--- AQUI ESTAVA A FALTAR! Guarda os links globais
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('home-screen').classList.remove('hidden');
        } else {
            alert(dados.mensagem || dados.error || 'Erro ao fazer login.');
        }
    } catch (erro) {
        alert('Não foi possível conectar ao servidor da API.');
    }
}

function abrirDetalhes(tipo) {
    patchSelecionado = tipo;
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('details-screen').classList.remove('hidden');

    const coverArt = document.getElementById('active-game-cover');

    // Atribui o nome exato da capa correspondente em formato PNG
    if(tipo === 'infinity') {
        document.getElementById('detalhe-titulo').innerText = 'Mega Patch Infinity';
        document.getElementById('txt-cusa').innerText = 'CUSA99999';
        coverArt.src = 'infinity.png';
    } else if(tipo === 'legends') {
        document.getElementById('detalhe-titulo').innerText = 'The Legends Collection';
        document.getElementById('txt-cusa').innerText = 'CUSA11154';
        coverArt.src = 'legends.png';
    } else if(tipo === 'worldcup') {
        document.getElementById('detalhe-titulo').innerText = 'World Cup 2026 Edition';
        document.getElementById('txt-cusa').innerText = 'CUSA10007';
        coverArt.src = 'worldcup.png';
    }
}

function voltarHome() {
    document.getElementById('details-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
}

function selecionarAlvo(tipo) {
    tipoAlvoSelecionado = tipo;
    const rowBase = document.getElementById('row-base');
    const rowPatch = document.getElementById('row-patch');
    const radBase = document.getElementById('radio-base');
    const radPatch = document.getElementById('radio-patch');

    if(tipo === 'base') {
        rowBase.classList.add('active-dl');
        radBase.classList.add('selected');
        rowPatch.classList.remove('active-dl');
        radPatch.classList.remove('selected');
    } else {
        rowPatch.classList.add('active-dl');
        radPatch.classList.add('selected');
        rowBase.classList.remove('active-dl');
        radBase.classList.remove('selected');
    }
}

function iniciarDownloadDireto() {
    if (!dadosAtuais || !dadosAtuais.links) {
        alert('Links de download não carregados.');
        return;
    }

    const linkFinal = dadosAtuais.links[patchSelecionado][tipoAlvoSelecionado];
    
    if(!linkFinal) {
        alert('Este link específico ainda não foi configurado no servidor.');
        return;
    }
    
    document.getElementById('progresso-status').innerText = 'A enviar pacote para o gestor do PS4...';
    
    // Cria um iframe invisível para forçar o navegador a descarregar o binário em segundo plano sem abrir o texto na tela
    const iframeInvisivel = document.createElement('iframe');
    iframeInvisivel.style.display = 'none';
    iframeInvisivel.src = linkFinal;
    document.body.appendChild(iframeInvisivel);

    // Remove o iframe após alguns segundos para limpar a memória da consola
    setTimeout(() => {
        document.body.removeChild(iframeInvisivel);
        document.getElementById('progresso-status').innerText = 'Download disparado! Verifique as notificações do PS4.';
    }, 5000);
}
function sair() {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('telefone').value = '';
    document.getElementById('senha').value = '';
}
