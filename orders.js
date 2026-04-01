document.addEventListener("DOMContentLoaded", () => {
  requireCustomer();
  initCommonUI("orders");
  initScrollAnimations();

  const role = getRole();
  const allOrders = getOrders();
  const currentEmail = (getUserEmail() || "").toLowerCase();
  const currentName = (getUser() || "").toLowerCase();
  const orders = role === "admin"
    ? allOrders
    : allOrders.filter(order =>
        ((order.ownerEmail || order.customer?.email || "").toLowerCase() === currentEmail) ||
        ((order.ownerName || order.customer?.name || "").toLowerCase() === currentName)
      );
  const empty = document.getElementById("ordersEmpty");
  const container = document.getElementById("ordersContainer");

  if(!orders.length){
    empty.classList.remove("d-none");
    return;
  }
  empty.classList.add("d-none");

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
      <div class="shipping-tracker">
          <div class="shipping-step ${["Behandlas","Skickad","På väg","Levererad"].indexOf(order.status || "Behandlas") >= 0 ? "active" : ""} ${["Skickad","På väg","Levererad"].includes(order.status || "Behandlas") ? "done" : ""}">Behandlas</div>
          <div class="shipping-step ${["Skickad","På väg","Levererad"].includes(order.status || "Behandlas") ? "active" : ""} ${["På väg","Levererad"].includes(order.status || "Behandlas") ? "done" : ""}">Skickad</div>
          <div class="shipping-step ${["På väg","Levererad"].includes(order.status || "Behandlas") ? "active" : ""} ${["Levererad"].includes(order.status || "Behandlas") ? "done" : ""}">På väg</div>
          <div class="shipping-step ${["Levererad"].includes(order.status || "Behandlas") ? "active done" : ""}">Levererad</div>
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
    </div>`).join("");

  initScrollAnimations();
});
