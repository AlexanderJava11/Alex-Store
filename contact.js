document.addEventListener("DOMContentLoaded", () => {
  requireCustomer();
  initCommonUI("contact");
  initScrollAnimations();

  const form = document.getElementById("contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessageText").value.trim();

    if(name.length < 2) return showAlert("contactMessage", "danger", "Ange ett giltigt namn.");
    if(!email.includes("@")) return showAlert("contactMessage", "danger", "Ange en giltig e-postadress.");
    if(subject.length < 2) return showAlert("contactMessage", "danger", "Ange ett ämne.");
    if(message.length < 5) return showAlert("contactMessage", "danger", "Skriv ett längre meddelande.");

    showAlert("contactMessage", "success", "Tack! Vi har tagit emot ditt meddelande.");
    form.reset();
  });
});
