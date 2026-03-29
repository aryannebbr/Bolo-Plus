 const API_URL = 'http://localhost:3000/api/receitas';

// 1. CARREGAR BOLOS LOCAIS
async function carregarReceitas() {
    const container = document.getElementById('receitas-container');
    try {
        const res = await fetch(API_URL);
        const receitas = await res.json();
        container.innerHTML = '';

        receitas.forEach(bolo => {
            const card = document.createElement('div');
            card.className = 'card';
            const btn = bolo.fixo ? "" : `<button class="btn-excluir" onclick="deletarBolo(${bolo.id})"><i class="fas fa-trash"></i> Remover</button>`;

            card.innerHTML = `
                <img src="${bolo.imagem}">
                <div class="card-content">
                    <h3 style="margin-top:0">${bolo.nome}</h3>
                    <span class="badge"><i class="fas fa-clock"></i> ${bolo.tempoPreparo}</span>
                    <span class="badge"><i class="fas fa-layer-group"></i> ${bolo.dificuldade}</span>
                    <p style="color:#666; font-size:0.9rem">${bolo.descricao}</p>
                    ${btn}
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) { console.error("Erro local"); }
}

// 2. BUSCAR RECEITA DA API EXTERNA (TheMealDB)
async function buscarReceitaAleatoria() {
    const display = document.getElementById('sugestao-chef');
    const btn = document.getElementById('btn-sugestao');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';
    
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        const prato = data.meals[0];

        display.innerHTML = `
            <div class="receita-externa">
                <h2 style="font-family: 'Playfair Display', serif;">${prato.strMeal}</h2>
                <img src="${prato.strMealThumb}" style="width: 150px; border-radius: 50%; border: 4px solid #d2691e; margin-bottom: 15px;">
                <div style="margin-bottom: 15px;">
                    <a href="${prato.strYoutube}" target="_blank" class="badge" style="background:#ff0000; color:white; text-decoration:none">
                        <i class="fab fa-youtube"></i> Ver no YouTube
                    </a>
                </div>
                <button onclick="location.reload()" style="background:none; border:none; color:#d2691e; cursor:pointer; font-size:0.8rem; text-decoration:underline">
                    Quero outra sugestão
                </button>
            </div>
        `;
    } catch (error) {
        display.innerHTML = "<p>Chef indisponível.</p>";
    }
}

// 3. EVENTOS (CADASTRO, DELETE, BUSCA)
document.getElementById('form-bolo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const novo = {
        nome: document.getElementById('nome').value,
        tempoPreparo: document.getElementById('tempo').value,
        dificuldade: document.getElementById('dificuldade').value,
        imagem: document.getElementById('imagem').value,
        descricao: document.getElementById('descricao').value
    };
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo)
    });
    document.getElementById('form-bolo').reset();
    carregarReceitas();
});

async function deletarBolo(id) {
    if(confirm("Deseja remover?")) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if(res.status === 403) alert("Receita protegida!");
        carregarReceitas();
    }
}

document.getElementById('input-busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
        const titulo = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = titulo.includes(termo) ? "block" : "none";
    });
});

carregarReceitas();