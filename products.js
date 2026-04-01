document.addEventListener("DOMContentLoaded", async () => {
  requireCustomer();
  initCommonUI("products");
  initScrollAnimations();

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const sortFilter = document.getElementById("sortFilter");
  const loader = document.getElementById("loader");
  const gridWrap = document.getElementById("productsGrid");
  const searchDropdown = document.getElementById("searchDropdown");
  let allProducts = [];

  function render(products){
    if(!products.length){
      gridWrap.innerHTML = `<div class="empty-box">Inga produkter matchade din sökning.</div>`;
      return;
    }
    gridWrap.innerHTML = `<div class="row g-4">${products.map(productCard).join("")}</div>`;
    bindProductButtons(allProducts);
    initScrollAnimations();
  }

  function applyFilters(){
    let filtered = [...allProducts];
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    filtered = filtered.filter(p => {
      const matchText = p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      const matchCategory = category === "all" || p.category === category;
      return matchText && matchCategory;
    });

    if(sort === "price-asc") filtered.sort((a,b) => a.price - b.price);
    if(sort === "price-desc") filtered.sort((a,b) => b.price - a.price);
    if(sort === "name-asc") filtered.sort((a,b) => a.title.localeCompare(b.title));

    render(filtered);
  }

  function renderSearchDropdown(){
    const q = searchInput.value.trim().toLowerCase();
    if(!q){
      searchDropdown.classList.remove("show");
      searchDropdown.innerHTML = "";
      return;
    }
    const matches = allProducts.filter(p => p.title.toLowerCase().includes(q)).slice(0, 5);
    if(!matches.length){
      searchDropdown.innerHTML = `<div class="dropdown-link">Inga träffar</div>`;
      searchDropdown.classList.add("show");
      return;
    }
    searchDropdown.innerHTML = matches.map(p => `
      <a class="dropdown-link" href="product.html?id=${p.id}">
        <img src="${p.image}" style="width:36px;height:36px;object-fit:contain;background:#fff;border-radius:8px;padding:4px;">
        <span>${p.title.slice(0,45)}</span>
      </a>
    `).join("");
    searchDropdown.classList.add("show");
  }

  try{
    allProducts = await fetchProducts();
    loader.classList.add("d-none");
    const categories = [...new Set(allProducts.map(p => p.category))];
    categoryFilter.innerHTML = `<option value="all">Alla kategorier</option>` + categories.map(c => `<option value="${c}">${c}</option>`).join("");
    render(allProducts);
  }catch(err){
    loader.classList.add("d-none");
    gridWrap.innerHTML = `<div class="alert alert-danger">Kunde inte ladda produkter.</div>`;
  }

  searchInput.addEventListener("input", () => {
    applyFilters();
    renderSearchDropdown();
  });
  categoryFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);
  document.addEventListener("click", (e) => {
    if(!searchDropdown.contains(e.target) && e.target !== searchInput){
      searchDropdown.classList.remove("show");
    }
  });
});
