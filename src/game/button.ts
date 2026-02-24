import { FillGradient, Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";

export function createButton(): FancyButton {
  let globalGradient = new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: "#0000ff" }, // use strings
      { offset: 1, color: "#000000" },
    ],
    textureSpace: "local",
  });

  //globalGradient.colorStops[1].color = "#ff0000"; // this does work

  const defaultView = new Graphics()
    .roundRect(0, 0, 200, 100, 15)
    .fill(0xffffff)
    .roundRect(10, 10, 180, 80, 10)
    .fill(globalGradient);

  const fncbtn = new FancyButton({
    defaultView: defaultView,
    text: "Gradient",
  });

  globalGradient = new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    colorStops: [
      { offset: 0, color: "#0000ff" }, // use strings
      { offset: 1, color: "#ff0000" },
    ],
    textureSpace: "local",
  });

  defaultView.clear().roundRect(0, 0, 200, 100, 15).fill(0x000000).roundRect(10, 10, 180, 80, 10).fill(globalGradient);

  return fncbtn;
}
