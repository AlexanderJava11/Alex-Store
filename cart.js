document.addEventListener("DOMContentLoaded", () => {
  requireCustomer();
  initCommonUI("cart");
  initScrollAnimations();

  const emptyBox = document.getElementById("cartEmpty");
  const cartList = document.getElementById("cartList");
  const itemsCount = document.getElementById("cartItemsCount");
  const totalEl = document.getElementById("cartTotal");
  const clearBtn = document.getElementById("clearCartBtn");

  function renderCart(){
    const cart = getCart();
    if(!cart.length){
      emptyBox.classList.remove("d-none");
      cartList.innerHTML = "";
      itemsCount.textContent = "0";
      totalEl.textContent = "0.00 kr";
      return;
    }
    emptyBox.classList.add("d-none");
    let total = 0;
    let count = 0;

    cartList.innerHTML = cart.map(item => {
      total += item.price * item.qty;
      count += item.qty;
      return `
        <div class="panel mb-3 fade-in">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex gap-3 align-items-center">
              <img src="${item.image}" alt="${item.title}" style="width:72px;height:72px;object-fit:contain;background:#fff;border-radius:12px;padding:8px;">
              <div>
                <div class="fw-bold">${item.title}</div>
                <div class="small">${item.category}</div>
                <div class="price mt-1">${formatPrice(item.price)}</div>
              </div>
            </div>
            <div class="d-flex flex-column align-items-md-end gap-2">
              <div class="d-flex align-items-center gap-2">
                <button class="qty-btn minus-btn" data-id="${item.id}">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn plus-btn" data-id="${item.id}">+</button>
              </div>
              <div class="fw-bold">Radtotal: ${formatPrice(item.price * item.qty)}</div>
              <button class="btn btn-danger remove-btn" data-id="${item.id}">Ta bort</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    itemsCount.textContent = count;
    totalEl.textContent = formatPrice(total);
    document.querySelectorAll(".plus-btn").forEach(btn => btn.addEventListener("click", () => { changeQty(Number(btn.dataset.id), 1); renderCart(); }));
    document.querySelectorAll(".minus-btn").forEach(btn => btn.addEventListener("click", () => { changeQty(Number(btn.dataset.id), -1); renderCart(); }));
    document.querySelectorAll(".remove-btn").forEach(btn => btn.addEventListener("click", () => { removeFromCart(Number(btn.dataset.id)); renderCart(); }));
    initScrollAnimations();
  }

  clearBtn.addEventListener("click", () => {
    setCart([]);
    renderCart();
  });

  renderCart();
});
