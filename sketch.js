'use strict'

class Settings {
  constructor() {
    this.animate = true;
    this.showDiagnostics = true;
    this.rows = 20;
    this.columns = 20;
    this.octaves = 2.8;
    this.falloff = 0.1;
    this.xy_increment = 0.039;
    this.z_increment = 0.0026;
  }
}

let gui = null;
let settings = new Settings();

let sclx, scly;
let zoff = 0;
let flowfield;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');

  textFont('monospace');

  initializeFlowField();
  initializeGuiControls();

  background(0);
}

function initializeFlowField() {
  sclx = floor(width / settings.columns);
  scly = floor(height / settings.rows);
  
  flowfield = new Array(settings.columns, settings.rows);
}

function initializeGuiControls() {
  gui = new dat.GUI()
  gui.add(settings, 'animate');

  gui.add(settings, 'rows', 1, 50).onFinishChange(n => setup());
  gui.add(settings, 'columns', 1, 50).onFinishChange(n => setup());
  gui.add(settings, 'octaves', 1, 10);
  gui.add(settings, 'falloff', 0, 1);
  gui.add(settings, 'xy_increment', 0, 0.2);
  gui.add(settings, 'z_increment', 0, 0.05);

  gui.close();
}

function windowResized() {
  setup();
}

function keyTyped() {
  switch (key) {
    case "a":
      settings.animate = !settings.animate;
      break;

    case "d":
      settings.showDiagnostics = !settings.showDiagnostics;
      break;

    case "h":
      gui.closed ? gui.open() : gui.close();
      break;

    default:
      // Prevent default behavior
      return false;
  }
}

// Main update loop
function draw() {
  updateControls();

  noiseDetail(settings.octaves, settings.falloff);
  background(0, 50);

  if (settings.showDiagnostics)
    drawDiagnostics();

  if (settings.animate) {
    updateFlowfield();
  }

  drawFlowfield();
}

function updateFlowfield() {
  let yoff = 0;
  for (let y = 0; y < settings.rows; y++) {
    let xoff = 0;
    for (let x = 0; x < settings.columns; x++) {
      let index = x + y * scly;
      let angle = noise(xoff, yoff, zoff) * TWO_PI;
      let v = p5.Vector.fromAngle(angle);
      flowfield[index] = v;
      
      xoff += settings.xy_increment;
    }

    yoff += settings.xy_increment;
  }

  zoff += settings.z_increment;
}

function drawFlowfield() {
  strokeWeight(1);
  colorMode(HSB, 100);
  noFill();

  for (let y = 0; y < settings.rows; y++) {
    for (let x = 0; x < settings.columns; x++) {
      push();

      translate(x * sclx + sclx / 2, y * scly + scly / 2);
      let i = x + y * scly;
      let n = abs(flowfield[i].heading()/PI);

      stroke(100 * n/15, 100, 100, 100*n);
      circle(0, 0, sclx*n*20);

      pop();
    }
  }
}

function updateControls() {
  for (let i in gui.__controllers)
    gui.__controllers[i].updateDisplay();
}

function drawDiagnostics() {
  push();

  // Clear background
  fill(0);
  stroke(0);
  rectMode(CORNER)
  rect(5, 5, 80, 40);

  textSize(12);
  fill(255);
  stroke(0);

  let fps = frameRate();
  text("FPS:   " + fps.toFixed(), 10, 20);

  pop();
}