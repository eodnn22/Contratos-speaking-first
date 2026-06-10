const WHATSAPP_NUMBER = "5541988854801";
const form = document.getElementById('contractForm');
const canvas = document.getElementById('canvasAssinatura');
const ctx = canvas.getContext('2d');
const progressBar = document.getElementById('progress');
const hiddenBase64 = document.getElementById('assinaturaBase64');
let drawing = false;

// Configuração do estilo do traço
ctx.strokeStyle = "#1a237e";
ctx.lineWidth = 3;

function desenharLinhaGuia() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(350, 150);
    ctx.stroke();
    ctx.strokeStyle = "#1a237e";
    ctx.lineWidth = 3;
}
desenharLinhaGuia();

// --- Lógica de Upload de Arquivo ---
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            hiddenBase64.value = event.target.result;
            alert("Assinatura anexada com sucesso!");
        };
        reader.readAsDataURL(file);
    }
});

// --- Lógica de Desenho no Canvas ---
function startDrawing(e) { 
    drawing = true; 
    ctx.beginPath(); 
}

function stopDrawing() { drawing = false; }

function draw(e) {
    if (!drawing) return;
    // Previne comportamento padrão (scroll) em touch
    if (e.cancelable) e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

document.getElementById('btnLimpar').onclick = () => {
    desenharLinhaGuia();
    hiddenBase64.value = ""; // Limpa a assinatura caso tenha sido anexado arquivo
};

// --- Validação e Fluxo ---
function validarCampos() {
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

document.getElementById('radioNao').onclick = () => {
    document.getElementById('btnWhatsApp').classList.remove('hidden');
    document.getElementById('areaConfirmacao').classList.add('hidden');
    document.getElementById('areaAssinatura').classList.add('hidden');
    progressBar.style.width = "25%";
};

document.getElementById('radioSim').onclick = () => {
    document.getElementById('btnWhatsApp').classList.add('hidden');
    document.getElementById('areaConfirmacao').classList.remove('hidden');
    progressBar.style.width = "50%";
};

document.getElementById('btnAssinar').onclick = () => {
    if (!validarCampos()) return;
    if (!document.getElementById('termos').checked) return alert("Confirme que leu os termos.");
    
    document.getElementById('areaAssinatura').classList.remove('hidden');
    progressBar.style.width = "75%";
};

document.getElementById('btnWhatsApp').onclick = () => {
    if (!form.nome.value) return alert("Preencha seu nome primeiro.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Olá, meu nome é ${form.nome.value}. Gostaria de receber meu contrato.`, '_blank');
};

// --- Envio Final ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    // Se o usuário não anexou arquivo, captura o que está no canvas
    if (!hiddenBase64.value) {
        hiddenBase64.value = canvas.toDataURL('image/png');
    }

    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.innerText = "Enviando...";
    btnEnviar.disabled = true;
    progressBar.style.width = "100%";

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: new FormData(form)
        });

        if (response.ok) {
            document.querySelector('.container').innerHTML = `
                <div style="text-align:center; padding: 40px;">
                    <h2 style="color: #27ae60;">✓ Sucesso!</h2>
                    <p>Contrato assinado e enviado.</p>
                </div>
            `;
        } else {
            throw new Error("Erro no envio");
        }
    } catch (err) {
        alert("Erro ao enviar o formulário.");
        btnEnviar.innerText = "Enviar Assinatura";
        btnEnviar.disabled = false;
    }
});