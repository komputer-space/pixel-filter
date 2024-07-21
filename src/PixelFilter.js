import { PaperScope } from "paper";
import * as FILTERS from "canvas-filters";

import { ParameterInput } from "./ParameterInput";
import { FileImporter } from "./FileImporter";
import { InfoLayer } from "./InfoLayer";

const PAPER = new PaperScope();

export class PixelFilter {
  constructor(canvas) {
    this.transparencyMode = false;
    this.freeze = false;
    this.idle = false;

    this.exampleIndex = 0;
    this.examples = ["computer"];

    this.importer = new FileImporter(this);

    this.infoLayer = new InfoLayer();

    // -------

    this.canvas = canvas;
    PAPER.setup(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.willReadFrequently = true;
    this.imageData;
    this.currentFilterIndex = 0;

    this.raster;
    this.imgSize;

    this.filterTool = new PAPER.Tool();
    this.activeTool = this.filterTool;
    this.filterTool.onKeyDown = (e) => this.filterToolKeyDown(e);
    this.filterTool.onMouseDown = (e) => this.filterToolMouseDown(e);

    document.onload = this.loadNewImage("/examples/computer.png");

    this.parameterInput = new ParameterInput(this.setParameter.bind(this));
  }

  // --- CORE METHODS

  update() {}

  resize(width, height) {}

  setViewMode(value) {
    this.freeze = value;
  }

  setTransparencyMode(value) {
    this.transparencyMode = value;
  }

  setIdleMode(value) {
    this.idle = value;
  }

  loadNewExample() {
    console.log("loading next example");
    this.exampleIndex++;
    if (this.exampleIndex >= this.examples.length) this.exampleIndex = 0;
  }

  // --- INPUTS

  filterToolKeyDown(e) {
    if (!isNaN(Number(e.key))) {
      this.applyFilter(Number(e.key));
    } else if (e.key == "enter") {
      this.bakeFilter();
    }
  }

  filterToolMouseDown(e) {}

  replaceImage(newImage) {
    PAPER.project.clear();
    this.loadNewImage(newImage);
  }

  drawImage(imageData) {
    // PAPER.project.clear();
    console.log(imageData);
    console.log(this.raster);
    const raster = new PAPER.Raster({
      position: PAPER.view.center,
      size: this.imgSize,
    });
    this.raster.remove();
    this.raster = raster;
    this.raster.putImageData(imageData);
    this.raster.selected = true;
    console.log(raster);
    // raster.setImageData(imageData);
  }

  async loadNewImage(imgSrc) {
    const raster = new PAPER.Raster({
      source: imgSrc,
      position: PAPER.view.center,
    });
    this.raster = raster;
    this.raster.selected = true;

    raster.onLoad = () => {
      this.bakeFilter();
      this.adaptImage(raster);
    };
    // raster.onLoad(() => {
    //   const canvasSize = PAPER.view.size;
    //   console.log(raster.image);
    //   const aspectRatio = raster.image.width / raster.image.height;
    //   console.log(raster.image.width);
    //   console.log(aspectRatio);

    //   if (aspectRatio > 1) {
    //     // landscape
    //     console.log("ls");
    //     raster.size = new PAPER.Size(
    //       canvasSize.width,
    //       canvasSize.height / aspectRatio
    //     );
    //   } else {
    //     // portrait
    //     console.log("pt");
    //     raster.size = new PAPER.Size(
    //       aspectRatio * canvasSize.width,
    //       canvasSize.height
    //     );
    //   }
    // });
  }

  adaptImage(raster) {
    console.log(raster);
    const canvasSize = PAPER.view.size;
    console.log(canvasSize);

    this.imgSize = new PAPER.Size(raster.image.width, raster.image.height);
    const aspectRatio = raster.image.width / raster.image.height;
    console.log(raster.image.width);
    console.log(aspectRatio);

    if (aspectRatio > 1) {
      // landscape
      console.log("ls");
      raster.size = new PAPER.Size(
        canvasSize.width,
        canvasSize.width / aspectRatio
      );
      console.log(raster.size);
    } else {
      // portrait
      console.log("pt");
      raster.size = new PAPER.Size(
        aspectRatio * canvasSize.height,
        canvasSize.height
      );
      console.log(raster.size);
    }
  }

  setParameter(value) {
    // console.log(value);
    this.setFilter(this.currentFilterIndex, value);
  }

  applyFilter(index) {
    this.setFilter(index, this.parameterInput.value);
    this.currentFilterIndex = index;
  }

  setFilter(index, parameterVal) {
    // parameter val = [0-1]
    const imageData = this.imageData;
    switch (index) {
      case 1:
        var filtered = FILTERS.Dither(imageData, parameterVal * 10);
        break;
      case 2:
        var filtered = FILTERS.Emboss(imageData);
        break;
      case 3:
        var filtered = FILTERS.Binarize(imageData, parameterVal);

        break;
      case 4:
        var filtered = FILTERS.ColorTransformFilter(
          imageData,
          1,
          1,
          parameterVal * 10,
          1,
          0,
          0,
          0,
          0
        );
        break;
      case 5:
        var filtered = FILTERS.Solarize(imageData);
        break;
      case 6:
        var filtered = FILTERS.GaussianBlur(imageData, parameterVal * 100);
        break;
      case 7:
        var filtered = FILTERS.Sharpen(imageData, 5);
        break;
      case 8:
        var filtered = FILTERS.Mosaic(imageData, parameterVal * 100 + 5);
        break;
      default:
        return;
    }
    // this.raster.setImageData(filtered);
    this.drawImage(filtered);

    // console.log(this.raster);
    // this.adaptImage(this.raster);

    // console.log(filtered);
    // const raster = new PAPER.Raster({
    //   source: filtered,
    //   position: PAPER.view.center,
    // });
  }

  bakeFilter() {
    console.log("bake");
    this.imageData = this.raster.getImageData(
      0,
      0,
      window.innerWidth * 2,
      window.innerHeight * 2
    );

    // this.imageData = this.ctx.getImageData(
    //   0,
    //   0,
    //   window.innerWidth * 2,
    //   window.innerHeight * 2
    // );
    console.log(this.imageData);
  }

  // --- FILE IMPORTS

  importGlTF(url) {
    this.infoLayer.setActive(true);
    this.infoLayer.showInfo("this tool can’t import 3D Objects");
    setTimeout(() => {
      this.infoLayer.setActive(false);
    }, 1000);
  }

  importImage(url) {
    this.loadNewImage(url);
  }
}
