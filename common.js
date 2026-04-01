const STORAGE_KEYS = {
  user: "ns_user",
  role: "ns_role",
  cart: "ns_cart",
  favorites: "ns_favorites",
  orders: "ns_orders",
  theme: "ns_theme",
  accounts: "ns_accounts",
  email: "ns_email"
};

function getUser(){ return localStorage.getItem(STORAGE_KEYS.user) || ""; }
function getRole(){ return localStorage.getItem(STORAGE_KEYS.role) || ""; }
function getUserEmail(){ return localStorage.getItem(STORAGE_KEYS.email) || ""; }
function setUser(name, role, email = ""){
  localStorage.setItem(STORAGE_KEYS.user, name);
  localStorage.setItem(STORAGE_KEYS.role, role);
  localStorage.setItem(STORAGE_KEYS.email, email);
}
function clearSession(){
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.email);
}
function requireCustomer(){
  const user = getUser();
  const role = getRole();
  if(!user || !["customer","admin"].includes(role)){
    window.location.href = "login.html";
  }
}
function requireAdmin(){
  if(getRole() !== "admin"){
    window.location.href = "login.html";
  }
}
function getCart(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || "[]"); }
function setCart(cart){
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartBadge();
  renderMiniCart();
}
function getFavorites(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]"); }
function setFavorites(favs){ localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favs)); }
function getOrders(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || "[]"); }
function setOrders(orders){ localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders)); }

function getAccounts(){
  const defaults = [{name:"Kund Demo", email:"kund@alexstore.se", password:"1234", role:"customer"}];
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.accounts) || "null");
  if(stored && Array.isArray(stored) && stored.length) return stored;
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(defaults));
  return defaults;
}
function setAccounts(accounts){
  localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
}

function formatPrice(value){ return Number(value).toFixed(2) + " kr"; }

function updateCartBadge(){
  document.querySelectorAll("[data-cart-badge]").forEach(badge => {
    const count = getCart().reduce((sum, item) => sum + Number(item.qty || 1), 0);
    badge.textContent = count;
  });
}
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(STORAGE_KEYS.theme, String(document.body.classList.contains("dark-mode")));
}
function initTheme(){
  if(localStorage.getItem(STORAGE_KEYS.theme) === "true"){
    document.body.classList.add("dark-mode");
  }
}
function showAlert(targetId, type, message){
  const target = document.getElementById(targetId);
  if(!target) return;
  target.innerHTML = `<div class="alert alert-${type} mt-3">${message}</div>`;
}
function initDropdownMenu(){
  const toggle = document.getElementById("moreMenuToggle");
  const menu = document.getElementById("moreMenu");
  if(!toggle || !menu) return;
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("show");
  });
  document.addEventListener("click", (e) => {
    if(!menu.contains(e.target) && e.target !== toggle){
      menu.classList.remove("show");
    }
  });
}
function initCommonUI(activePage){
  initTheme();
  updateCartBadge();
  initDropdownMenu();
  initMiniCart();
  initChatbot();
  renderProfileChip();
  initCountdown();

  const themeBtn = document.getElementById("themeBtn");
  if(themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "login.html";
    });
  }

  document.querySelectorAll("[data-page]").forEach(link => {
    if(link.dataset.page === activePage){
      link.classList.add("active");
    }
  });

  if(getRole() === "admin"){
    document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("d-none"));
  }
}
function showToast(message){
  let container = document.querySelector(".toast-container");
  if(!container){
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
  }, 1700);
  setTimeout(() => toast.remove(), 2100);
}
function flyToCart(imgElement){
  const cartBadge = document.querySelector("[data-cart-badge]");
  if(!imgElement || !cartBadge) return;
  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartBadge.getBoundingClientRect();
  const flyingImg = imgElement.cloneNode(true);
  flyingImg.classList.add("fly-img");
  flyingImg.style.top = `${imgRect.top}px`;
  flyingImg.style.left = `${imgRect.left}px`;
  document.body.appendChild(flyingImg);
  requestAnimationFrame(() => {
    flyingImg.style.top = `${cartRect.top}px`;
    flyingImg.style.left = `${cartRect.left}px`;
    flyingImg.style.width = "20px";
    flyingImg.style.height = "20px";
    flyingImg.style.opacity = "0.45";
    flyingImg.style.transform = "scale(0.6)";
  });
  setTimeout(() => flyingImg.remove(), 850);
}
function animateCartBadge(){
  const badge = document.querySelector("[data-cart-badge]");
  if(!badge) return;
  badge.classList.remove("cart-bounce", "cart-blink");
  void badge.offsetWidth;
  badge.classList.add("cart-bounce", "cart-blink");
  setTimeout(() => badge.classList.remove("cart-bounce", "cart-blink"), 700);
}
function getStatusClass(status){
  if(status === "Skickad" || status === "På väg") return "order-status-pill order-status-shipped";
  if(status === "Levererad") return "order-status-pill order-status-delivered";
  return "order-status-pill order-status-processing";
}
async function fetchProducts(){
  const res = await fetch("https://fakestoreapi.com/products");
  if(!res.ok) throw new Error("Kunde inte hämta produkter.");
  return await res.json();
}
function isFavorite(id){
  return getFavorites().some(item => item.id === id);
}
function toggleFavorite(product){
  let favs = getFavorites();
  if(favs.some(item => item.id === product.id)){
    favs = favs.filter(item => item.id !== product.id);
    showToast("Favoriten togs bort");
  } else {
    favs.push(product);
    showToast("Produkten lades till i favoriter");
  }
  setFavorites(favs);
}
function addToCart(product, imgElement = null){
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if(existing){
    existing.qty = Number(existing.qty || 1) + 1;
  } else {
    cart.push({...product, qty:1});
  }
  setCart(cart);
  if(imgElement) flyToCart(imgElement);
  animateCartBadge();
  showToast(`✔ ${product.title.slice(0, 32)} lades till i varukorgen`);
}
function changeQty(id, delta){
  const cart = getCart()
    .map(item => item.id === id ? ({...item, qty:Number(item.qty || 1) + delta}) : item)
    .filter(item => item.qty > 0);
  setCart(cart);
}
function removeFromCart(id){ setCart(getCart().filter(item => item.id !== id)); }
function truncate(text, max=90){ return text.length > max ? text.slice(0, max) + "..." : text; }

function productCard(product){
  return `
    <div class="col-md-6 col-lg-4 fade-in">
      <div class="product-card">
        <a href="product.html?id=${product.id}">
          <div class="product-media"><img src="${product.image}" alt="${product.title}"></div>
        </a>
        <div class="p-3">
          <div class="product-category mb-2">${product.category}</div>
          <a href="product.html?id=${product.id}"><div class="product-title">${product.title}</div></a>
          <div class="product-desc mb-3">${truncate(product.description, 95)}</div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="price">${formatPrice(product.price)}</span>
            <span class="small text-secondary">⭐ ${product.rating?.rate ?? 4.0}</span>
          </div>
          <div class="d-grid gap-2">
            <button class="btn btn-primary add-cart-btn" data-id="${product.id}">Lägg i varukorg</button>
            <button class="btn btn-light quick-view-btn" data-id="${product.id}">Quick view</button>
            <button class="btn ${isFavorite(product.id) ? "btn-danger active" : "btn-outline-secondary"} favorite-btn" data-id="${product.id}">
              ${isFavorite(product.id) ? "Ta bort favorit" : "Lägg till favorit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
function bindProductButtons(products){
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === Number(btn.dataset.id));
      if(!product) return;
      const card = btn.closest(".product-card");
      const img = card ? card.querySelector(".product-media img") : null;
      addToCart(product, img);
    });
  });
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === Number(btn.dataset.id));
      if(!product) return;
      toggleFavorite(product);
      btn.classList.toggle("btn-danger");
      btn.classList.toggle("btn-outline-secondary");
      btn.classList.toggle("active");
      btn.textContent = isFavorite(product.id) ? "Ta bort favorit" : "Lägg till favorit";
    });
  });
  document.querySelectorAll(".quick-view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === Number(btn.dataset.id));
      if(product) openQuickView(product);
    });
  });
}

function renderMiniCart(){
  const miniCart = document.getElementById("miniCart");
  if(!miniCart) return;
  const cart = getCart();
  if(!cart.length){
    miniCart.innerHTML = `<div class="mini-cart-empty">Varukorgen är tom.</div>`;
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  miniCart.innerHTML = `
    <h6 class="mb-3">Varukorg</h6>
    ${cart.slice(0,4).map(item => `
      <div class="mini-cart-item">
        <img class="mini-cart-thumb" src="${item.image}" alt="${item.title}">
        <div class="flex-grow-1">
          <div class="small fw-semibold">${item.title.slice(0,32)}</div>
          <div class="small">${item.qty} × ${formatPrice(item.price)}</div>
        </div>
      </div>`).join("")}
    <div class="d-flex justify-content-between mt-3 mb-3"><strong>Totalt</strong><strong>${formatPrice(total)}</strong></div>
    <div class="d-grid gap-2">
      <a href="cart.html" class="btn btn-primary">Öppna varukorg</a>
      <a href="payment.html" class="btn btn-light">Till betalning</a>
    </div>
  `;
}
function initMiniCart(){
  const cartLink = document.getElementById("cartLink");
  const miniCart = document.getElementById("miniCart");
  if(!cartLink || !miniCart) return;
  renderMiniCart();
  cartLink.addEventListener("click", (e) => {
    if(window.innerWidth > 768){
      e.preventDefault();
      renderMiniCart();
      miniCart.classList.toggle("show");
    }
  });
  document.addEventListener("click", (e) => {
    if(!miniCart.contains(e.target) && e.target !== cartLink && !cartLink.contains(e.target)){
      miniCart.classList.remove("show");
    }
  });
}

function initScrollAnimations(){
  const onScroll = () => {
    document.querySelectorAll(".fade-in").forEach(el => {
      if(el.getBoundingClientRect().top < window.innerHeight - 100){
        el.classList.add("show");
      }
    });
  };
  window.addEventListener("scroll", onScroll);
  onScroll();
}
function openQuickView(product){
  const overlay = document.getElementById("quickViewOverlay");
  if(!overlay) return;
  overlay.innerHTML = `
    <div class="quick-view-card position-relative">
      <button class="quick-view-close" id="quickViewClose">✕</button>
      <div class="row align-items-center">
        <div class="col-lg-5 text-center">
          <img src="${product.image}" alt="${product.title}" style="max-height:320px;width:100%;object-fit:contain;">
        </div>
        <div class="col-lg-7">
          <div class="product-category mb-2">${product.category}</div>
          <h2 class="h3">${product.title}</h2>
          <p class="small">${product.description}</p>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="price">${formatPrice(product.price)}</span>
            <span class="small">⭐ ${product.rating?.rate ?? 4.0}</span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button id="quickBuyBtn" class="btn btn-primary">Lägg i varukorg</button>
            <a href="product.html?id=${product.id}" class="btn btn-light">Öppna produktsida</a>
          </div>
        </div>
      </div>
    </div>
  `;
  overlay.classList.add("show");
  document.getElementById("quickViewClose").addEventListener("click", closeQuickView);
  overlay.addEventListener("click", (e) => { if(e.target === overlay) closeQuickView(); }, {once:true});
  document.getElementById("quickBuyBtn").addEventListener("click", () => {
    const img = overlay.querySelector("img");
    addToCart(product, img);
  });
}
function closeQuickView(){
  const overlay = document.getElementById("quickViewOverlay");
  if(!overlay) return;
  overlay.classList.remove("show");
  overlay.innerHTML = "";
}

function initChatbot(){
  const launcher = document.getElementById("chatbotLauncher");
  const panel = document.getElementById("chatbotPanel");
  const closeBtn = document.getElementById("chatbotClose");
  const input = document.getElementById("chatbotInput");
  const send = document.getElementById("chatbotSend");
  const messages = document.getElementById("chatbotMessages");
  if(!launcher || !panel || !messages || launcher.dataset.bound === "true") return;
  launcher.dataset.bound = "true";

  const addMsg = (text, who="bot") => {
    const div = document.createElement("div");
    div.className = `chatbot-bubble ${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };
  if(!messages.dataset.loaded){
    addMsg("Hej! Jag är Alex Assistant. Fråga om frakt, retur, betalning, orderstatus eller produkter.");
    messages.dataset.loaded = "true";
  }
  const reply = (text) => {
    const q = text.toLowerCase();
    if(q.includes("frakt")) return "Frakten är 0 kr i denna demo och visas direkt i varukorgen.";
    if(q.includes("retur")) return "Du kan säga att returer hanteras inom 14 dagar i redovisningen.";
    if(q.includes("betal")) return "Vi stödjer Kort, Klarna och Swish i checkout-demon.";
    if(q.includes("produkt")) return "Gå till Produkter-sidan för att söka, filtrera, använda quick view och lägga till favoriter.";
    if(q.includes("order")) return "Beställningar sparas lokalt och kan ses under Mina beställningar. Admin kan ändra status till Behandlas, Skickad eller Levererad.";
    return "Jag är en demo-assistent, men jag kan hjälpa till med frakt, retur, betalning, produkter och orders.";
  };
  const submit = () => {
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, "user");
    input.value = "";
    setTimeout(() => addMsg(reply(text), "bot"), 300);
  };
  launcher.addEventListener("click", () => panel.classList.toggle("show"));
  closeBtn.addEventListener("click", () => panel.classList.remove("show"));
  send.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if(e.key === "Enter") submit(); });
}


function renderProfileChip(){
  const holder = document.getElementById("profileChip");
  if(!holder) return;
  const name = getUser() || "Gäst";
  const role = getRole() === "admin" ? "Admin" : "Kund";
  holder.innerHTML = `<span>👤</span><span>Hej, ${name}</span><small>• ${role}</small>`;
}

function initCountdown(){
  const el = document.getElementById("countdown");
  if(!el) return;
  const end = new Date();
  end.setDate(end.getDate() + 3);
  end.setHours(23,59,59,999);

  const tick = () => {
    const now = new Date();
    const diff = end - now;
    if(diff <= 0){
      el.innerHTML = `<div class="small">Kampanjen är slut.</div>`;
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    el.innerHTML = `
      <div class="countdown-wrap">
        <div class="countdown-box"><strong>${days}</strong><span>dagar</span></div>
        <div class="countdown-box"><strong>${hours}</strong><span>timmar</span></div>
        <div class="countdown-box"><strong>${mins}</strong><span>minuter</span></div>
        <div class="countdown-box"><strong>${secs}</strong><span>sekunder</span></div>
      </div>`;
  };
  tick();
  setInterval(tick, 1000);
}
