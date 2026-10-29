
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const cards = Array.from(document.querySelectorAll(".game-card"));
const resultCount = document.getElementById("result-count");
const emptyState = document.getElementById("empty-state");

function filterCatalog() {
  const query = (searchInput.value || "").trim().toLocaleLowerCase("pt-BR");
  const category = categorySelect.value;
  let visible = 0;

  cards.forEach((card) => {
    const name = (card.dataset.name || "").toLocaleLowerCase("pt-BR");
    const cardCategory = card.dataset.category || "";
    const matchesSearch = name.includes(query);
    const matchesCategory = category === "all" || cardCategory === category;
    const show = matchesSearch && matchesCategory;

    card.hidden = !show;
    if (show) visible += 1;
  });

  resultCount.textContent = `${visible} ${visible === 1 ? "coleção" : "coleções"}`;
  emptyState.hidden = visible !== 0;
}

searchInput.addEventListener("input", filterCatalog);
categorySelect.addEventListener("change", filterCatalog);

document.getElementById("year").textContent = new Date().getFullYear();
filterCatalog();
