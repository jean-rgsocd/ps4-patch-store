const API_URL = 'http://localhost:3000/api/login'; 
let dadosAtuais = null;
let patchSelecionado = 'infinity';
let tipoAlvoSelecionado = 'patch';

async function fazerLogin() {
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('senha').value;

    if (!telefone || !senha) { alert('Preencha o telefone e a senha!'); return; }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefone, senha })
        });
        const data = await response.json();

        if (response.ok) {
            dadosAtuais = data; 
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('home-screen').classList.remove('hidden');
        } else {
            alert(data.error || 'Erro ao realizar login.');
        }
    } catch (e) {
        alert('Não foi possível conectar ao servidor da API.');
    }
}

function abrirDetalhes(tipo) {
    patchSelecionado = tipo;
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('details-screen').classList.remove('hidden');

    const coverArt = document.getElementById('active-game-cover');

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

// Envio direto via API do GoldHEN RPI na porta 9090 da consola
async function iniciarDownloadDireto() {
    if (!dadosAtuais || !dadosAtuais.links) {
        alert('Links de download não carregados.');
        return;
    }

    const linkFinal = dadosAtuais.links[patchSelecionado][tipoAlvoSelecionado];
    
    if(!linkFinal) {
        alert('Este link específico ainda não foi configurado no servidor.');
        return;
    }
    
    document.getElementById('progresso-status').innerText = 'A enviar comando para o instalador do PS4...';

    // Obtém o IP atual do próprio PS4 onde a aplicação está a correr no browser
    const ps4Ip = window.location.hostname || '127.0.0.1';
    const rpiPort = 9090; // Porta padrão do Remote Package Installer do GoldHEN

    const payloadRPI = {
        type: 'install',
        pkgs: [linkFinal]
    };

    try {
        // Envia o pacote de forma assíncrona para o gestor interno da consola
        const response = await fetch(`http://${ps4Ip}:${rpiPort}/api/pkg`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadRPI)
        });

        if (response.ok) {
            document.getElementById('progresso-status').innerText = 'Sucesso! O download começou em segundo plano no PS4.';
        } else {
            // Plano de contingência caso o RPI direto precise de confirmação por rota web
            dispararFallbackNativo(linkFinal);
        }
    } catch (error) {
        // Se falhar a conexão local direta, usa o método de redirecionamento limpo
        dispararFallbackNativo(linkFinal);
    }
}

function dispararFallbackNativo(url) {
    document.getElementById('progresso-status').innerText = 'A disparar gestor de pacotes do sistema...';
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
        document.body.removeChild(iframe);
        document.getElementById('progresso-status').innerText = 'Verifique as notificações de transferência na consola.';
    }, 4000);
}

function sair() {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('telefone').value = '';
    document.getElementById('senha').value = '';
}
