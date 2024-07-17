// alert-manager.js

class Alert {
  constructor(message, type, manager) {
    this.message = message;
    this.type = type;
    this.manager = manager;
    this.counter = 1;
    this.element = this.createElement();
    this.startTimeout();
  }

  createElement() {
    const alertElement = document.createElement("div");
    alertElement.className = `alert alert-${this.type}`;
    alertElement.innerHTML = `
      <span class="message">${this.message}</span>
      <span class="counter">${this.counter}</span>
      <span class="close">&times;</span>
    `;

    alertElement.querySelector(".close").addEventListener("click", () => {
      this.dismiss();
    });

    document.getElementById("alertContainer").appendChild(alertElement);
    return alertElement;
  }

  incrementCounter() {
    this.counter += 1;
    this.element.querySelector(".counter").textContent = this.counter;
  }

  startTimeout() {
    this.timeoutId = setTimeout(() => {
      this.dismiss();
    }, 3000);
  }

  resetTimeout() {
    clearTimeout(this.timeoutId);
    this.startTimeout();
  }

  dismiss() {
    this.element.remove();
    this.manager.removeAlert(this);
  }
}

class AlertManager {
  constructor() {
    this.alerts = [];
  }

  show(message, type = "info") {
    const existingAlert = this.alerts.find((alert) => alert.type === type);

    if (existingAlert) {
      existingAlert.incrementCounter();
      existingAlert.resetTimeout();
      existingAlert.element.style.animation = "none";
      existingAlert.element.offsetHeight; // Trigger reflow
      existingAlert.element.style.animation = "fade-in 0.5s";
    } else {
      const alert = new Alert(message, type, this);
      this.alerts.push(alert);
    }
  }

  removeAlert(alert) {
    this.alerts = this.alerts.filter((a) => a !== alert);
  }
}
