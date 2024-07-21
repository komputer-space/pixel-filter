export class ParameterInput {
  constructor(applyParameterCallback) {
    this.applyParameterCallback = applyParameterCallback;
    this.guiSlider = document.getElementById("parameter-slider");
    this.guiSlider.oninput = (e) => this.processInput(e);
    this.value = 50;
  }

  processInput(e) {
    this.value = this.guiSlider.value;
    this.applyParameterCallback(this.value);
  }
}
