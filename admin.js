document.addEventListener("DOMContentLoaded", () => {
  requireAdmin();
  initCommonUI("admin");
  initScrollAnimations();

  const totalOrdersEl = document.getElementById("totalOrders");
  const totalRevenueEl = document.getElementById("totalRevenue");
  const cardCountEl = document.getElementById("cardCount");
  const otherCountEl = document.getElementById("otherCount");
  const emptyEl = document.getElementById("adminOrdersEmpty");
  const container = document.getElementById("adminOrdersContainer");

  function render(){
    const orders = getOrders();
    totalOrdersEl.textContent = orders.length;
    totalRevenueEl.textContent = formatPrice(orders.reduce((sum, o) => sum + Number(o.total || 0), 0));
    cardCountEl.textContent = orders.filter(o => o.paymentMethod === "Kort").length;
    otherCountEl.textContent = orders.filter(o => o.paymentMethod !== "Kort").length;

    if(!orders.length){
      emptyEl.classList.remove("d-none");
      container.innerHTML = "";
      return;
    }
    emptyEl.classList.add("d-none");

    container.innerHTML = orders.slice().reverse().map(order => `
      <div class="order-card mb-4 fade-in">
        <div class="d-flex justify-content-between flex-column flex-md-row gap-3">
          <div>
            <h3 class="mb-1">Order #${order.id}</h3>
            <div class="small">${order.date}</div>
          </div>
          <div class="text-md-end">
            <div><strong>${order.paymentMethod}</strong></div>
            <div class="${getStatusClass(order.status || 'Behandlas')} my-2">${order.status || 'Behandlas'}</div>
            <div class="price">${formatPrice(order.total)}</div>
          </div>
        </div>
        <div class="mt-3">
          <strong>Kund:</strong> ${order.customer?.name || "-"}<br>
          <span class="small">${order.customer?.email || "-"} · ${order.customer?.phone || "-"}</span><br>
          <span class="small">${order.customer?.street || "-"}, ${order.customer?.zip || ""} ${order.customer?.city || ""}</span>
        </div>
        <div class="mt-3">
          ${(order.items || []).map(item => `
            <div class="order-item d-flex justify-content-between">
              <span>${item.title} × ${item.qty}</span>
              <strong>${formatPrice(item.lineTotal)}</strong>
            </div>`).join("")}
        </div>
        <div class="mt-3">
          <label class="label">Ändra status</label>
          <select class="form-select status-select" data-id="${order.id}">
            <option value="Behandlas" ${(order.status || "Behandlas") === "Behandlas" ? "selected" : ""}>Behandlas</option>
            <option value="Skickad" ${(order.status || "Behandlas") === "Skickad" ? "selected" : ""}>Skickad</option>
            <option value="På väg" ${(order.status || "Behandlas") === "På väg" ? "selected" : ""}>På väg</option>
            <option value="Levererad" ${(order.status || "Behandlas") === "Levererad" ? "selected" : ""}>Levererad</option>
          </select>
        </div>
      </div>`).join("");

    document.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", () => {
        const orderId = Number(select.dataset.id);
        const updated = getOrders().map(order => order.id === orderId ? ({...order, status: select.value}) : order);
        setOrders(updated);
        render();
      });
    });
    initScrollAnimations();
  }

  document.getElementById("refreshAdminBtn").addEventListener("click", render);
  document.getElementById("clearOrdersBtn").addEventListener("click", () => {
    setOrders([]);
    render();
  });

  render();
});
