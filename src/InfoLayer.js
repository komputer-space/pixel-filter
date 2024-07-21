export class InfoLayer {
  constructor() {
    this.infoLayerElement = document.getElementById("info-layer");
    this.infoElement = this.infoLayerElement.querySelector(".info");

    this.setActive(false);
  }

  setActive(val) {
    this.infoLayerElement.style.display = val ? "flex" : "none";
    if (!val) this.infoElement.innerText = "";
  }

  showLoadingIndicator(percentage) {
    this.infoElement.innerText = "loading … " + percentage + "%";
  }

  showInfo(info) {
    this.infoElement.innerText = info;
  }
}
