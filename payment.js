document.addEventListener("DOMContentLoaded", () => {
  requireCustomer();
  initCommonUI("payment");
  initScrollAnimations();

  const paymentMethod = document.getElementById("paymentMethod");
  const paymentDetails = document.getElementById("paymentDetails");
  const form = document.getElementById("checkoutForm");
  const validateBtn = document.getElementById("validateBtn");

  function setCheckoutStep(step){
    document.querySelectorAll("#checkoutProgress .progress-step").forEach((el, idx) => {
      const n = idx + 1;
      el.classList.remove("active","done");
      if(n < step) el.classList.add("done");
      if(n === step) el.classList.add("active");
    });
  }

  function renderSummary(){
    const cart = getCart();
    let itemCount = 0;
    let total = 0;
    document.getElementById("paymentItems").innerHTML = cart.map(item => {
      itemCount += item.qty;
      total += item.price * item.qty;
      return `<div class="d-flex justify-content-between mb-2"><span>${item.title} × ${item.qty}</span><strong>${formatPrice(item.price * item.qty)}</strong></div>`;
    }).join("");
    document.getElementById("paymentItemCount").textContent = itemCount;
    document.getElementById("paymentSubtotal").textContent = formatPrice(total);
    document.getElementById("paymentTotal").textContent = formatPrice(total);
  }

  function renderPaymentFields(){
    setCheckoutStep(paymentMethod.value ? 2 : 1);
    const method = paymentMethod.value;
    if(method === "Kort"){
      paymentDetails.innerHTML = `
        <div class="panel mt-3 fade-in">
          <div class="d-flex align-items-center gap-2 mb-3"><span style="font-size:1.2rem;">💳</span><strong>Kortbetalning</strong></div>
          <div class="checkout-card-anim mb-3" style="padding:22px;border-radius:22px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#fff;transform:rotate(-2deg);box-shadow:var(--shadow-lg);">
            <div class="small" style="color:rgba(255,255,255,.8)">Alex Store Card</div>
            <div style="font-size:1.1rem;letter-spacing:.1em;margin-top:18px;">•••• •••• •••• 1234</div>
            <div class="d-flex justify-content-between mt-3"><span>MM/ÅÅ</span><span>CVC</span></div>
          </div>
          <label class="label" for="cardNumber">Kortnummer</label>
          <input id="cardNumber" class="form-control" type="text" placeholder="1234 5678 9012 3456">
          <div class="row mt-3">
            <div class="col-md-6">
              <label class="label" for="cardExpiry">Giltigt till</label>
              <input id="cardExpiry" class="form-control" type="text" placeholder="MM/ÅÅ">
            </div>
            <div class="col-md-6">
              <label class="label" for="cardCvc">CVC</label>
              <input id="cardCvc" class="form-control" type="text" placeholder="123">
            </div>
          </div>
        </div>`;
    } else if(method === "Swish"){
      paymentDetails.innerHTML = `<div class="panel mt-3 text-center fade-in"><p class="mb-2"><strong>Swisha till:</strong> 123 456 78 90</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=swish-1234567890" alt="Swish QR" style="border-radius:14px;"></div>`;
    } else if(method === "Klarna"){
      paymentDetails.innerHTML = `<div class="panel mt-3 fade-in"><strong>Klarna valt</strong><p class="small mt-2 mb-0">Köp nu och betala senare i denna demo.</p></div>`;
    } else {
      paymentDetails.innerHTML = "";
    }
    initScrollAnimations();
  }

  function validateForm(){
    const cart = getCart();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const street = document.getElementById("street").value.trim();
    const zip = document.getElementById("zip").value.trim();
    const city = document.getElementById("city").value.trim();

    if(!cart.length) return "Varukorgen är tom.";
    if(name.length < 2 || name.length > 50) return "Namn måste vara mellan 2 och 50 tecken.";
    if(!email.includes("@") || email.length > 50) return "E-post måste innehålla @ och vara max 50 tecken.";
    if(!/^[0-9\-()\s]+$/.test(phone) || phone.length > 20) return "Telefonnummer är ogiltigt.";
    if(street.length < 2 || street.length > 50) return "Gatuadress måste vara mellan 2 och 50 tecken.";
    if(!/^\d{5}$/.test(zip)) return "Postnummer måste vara exakt 5 siffror.";
    if(city.length < 2 || city.length > 20) return "Ort måste vara mellan 2 och 20 tecken.";
    if(!paymentMethod.value) return "Välj ett betalsätt.";

    if(paymentMethod.value === "Kort"){
      const cardNumber = document.getElementById("cardNumber")?.value.trim() || "";
      const cardExpiry = document.getElementById("cardExpiry")?.value.trim() || "";
      const cardCvc = document.getElementById("cardCvc")?.value.trim() || "";
      if(cardNumber.length < 13) return "Ange ett giltigt kortnummer.";
      if(cardExpiry.length < 4) return "Ange kortets giltighetstid.";
      if(cardCvc.length < 3) return "Ange ett giltigt CVC.";
    }
    return "";
  }

  function placeOrder(){
    const error = validateForm();
    if(error){
      showAlert("checkoutMessage", "danger", error);
      document.getElementById("receipt").innerHTML = "";
      return;
    }

    showAlert("checkoutMessage", "info", "Behandlar betalning...");
    const cart = getCart();
    const orders = getOrders();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const customer = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      street: document.getElementById("street").value.trim(),
      zip: document.getElementById("zip").value.trim(),
      city: document.getElementById("city").value.trim()
    };

    setTimeout(() => {
      const order = {
        id: Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString("sv-SE"),
        paymentMethod: paymentMethod.value,
        status: "Behandlas",
        ownerName: getUser(),
        ownerEmail: getUserEmail() || customer.email,
        itemCount,
        total: Number(total.toFixed(2)),
        customer,
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          qty: item.qty,
          lineTotal: Number((item.price * item.qty).toFixed(2))
        }))
      };
      orders.push(order);
      setOrders(orders);
      setCart([]);

      setCheckoutStep(3);
      showAlert("checkoutMessage", "success", "Köpet genomfördes.");
      document.getElementById("receipt").innerHTML = `
        <div class="panel mt-3 fade-in">
          <h3>Kvitto</h3>
          <p><strong>Order-ID:</strong> #${order.id}</p>
          <p><strong>Datum:</strong> ${order.date}</p>
          <p><strong>Betalsätt:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> <span class="${getStatusClass(order.status)}">${order.status}</span></p>
          <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        </div>
      `;
      form.reset();
      paymentDetails.innerHTML = "";
      setCheckoutStep(1);
  renderSummary();
      initScrollAnimations();
    }, 700);
  }

  paymentMethod.addEventListener("change", renderPaymentFields);
  validateBtn.addEventListener("click", () => {
    const error = validateForm();
    if(error) showAlert("checkoutMessage", "danger", error);
    else showAlert("checkoutMessage", "success", "Alla fält är korrekt ifyllda.");
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    placeOrder();
  });

  setCheckoutStep(1);
  renderSummary();
});
