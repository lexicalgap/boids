/* jshint devel:true */
'use strict';

var stats,
  stage,
  renderer,
  attractors = [],
  items = [],
  textures,
  boids,
  numBoids = 400,
  halfWidth = 0,
  halfHeight = 0,
  boidsContainer,
  curScale = 1,
  boidsLimit = {};

function setupStats() {
  var st = document.createElement('div');
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';

  document.body.appendChild(st);
  st.appendChild(stats.domElement);
}

function setupDatGUI() {
  var gui = new dat.GUI();
  var bOptions = {
    boids: numBoids,
    separationDistance : 45,
    alignmentDistance : 415,
    cohesionDistance : 170,
    atractionForce: 0.15
  };
  var c = gui.add(bOptions, 'boids', 200, 1000).step(1);
  c.onFinishChange(function(value) {

    if (value > boids.boids.length) {

      for (var i = boids.boids.length; i <= value; i++) {
        boids.boids.push([0, 0, Math.random() * 6 - 3, Math.random() * 6 - 3, 0, 0]);
        // create a new Sprite using the texture
        var tex = textures[Math.floor(Math.random() * textures.length)];
        var b = new PIXI.Sprite(tex);

        // center the sprites anchor point
        b.anchor.x = 0.5;
        b.anchor.y = 0.5;
        var s = random(0.3, 0.4);
        b.scale = new PIXI.Point(s, s);

        boidsContainer.addChild(b);
        items.push(b);
      }

    }else {

      for (var l = boids.boids.length; l >= value; l--) {
        boids.boids.pop();
        var x = items.pop();
        x.visible = false;
        x.renderable = false;
      }

    }
  });

  gui.add(boids, 'speedLimitRoot', 0, 20);
  gui.add(boids, 'accelerationLimitRoot', 0.01, 50).step(0.01);

  var c1 = gui.add(bOptions, 'separationDistance', 0, 500);
  c1.onChange(function(value) {
    boids.separationDistance = Math.pow(value, 2);
  });

  var c2 = gui.add(bOptions, 'alignmentDistance', 0, 500);
  c2.onChange(function(value) {
    boids.alignmentDistance = Math.pow(value, 2);
  });

  var c3 = gui.add(bOptions, 'cohesionDistance', 0, 500);
  c3.onChange(function(value) {
    boids.cohesionDistance = Math.pow(value, 2);
  });

  gui.add(boids, 'separationForce', 0.01, 5).step(0.01);
  gui.add(boids, 'cohesionForce', -0.9, 0.9).step(0.01);
  gui.add(boids, 'alignmentForce', 0.10, 5).step(0.01);

  var f2 = gui.addFolder('Attraction');
  var c4 = f2.add(bOptions, 'atractionForce', -40, 40).step(0.01);
  c4.onChange(function(value) {
    boids.attractors[0][3] = value;
  });
  f2.open();
  gui.close();
}

function init () {

  var t1 = PIXI.Texture.fromImage('images/test_red.png');
  var t2 = PIXI.Texture.fromImage('images/test_blue.png');
  var t3 = PIXI.Texture.fromImage('images/test_yellow.png');
  var t4 = PIXI.Texture.fromImage('images/test_green.png');

  textures = [t1, t2, t3, t4];

  stage = new PIXI.Container();

  renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

  console.log('Using', renderer);

  renderer.view.style.display = 'block';
  document.body.appendChild(renderer.view);

  boidsContainer = new PIXI.Container();
  stage.addChild(boidsContainer);

  createBoids();

  for (var i = 0; i < boids.boids.length; i++) {
    // create a new Sprite using the texture
    var tex = textures[Math.floor(Math.random() * textures.length)];
    var b = new PIXI.Sprite(tex);
    b.anchor.x = 0.5;
    b.anchor.y = 0.5;
    var s = random(0.3, 0.4);
    b.scale = new PIXI.Point(s, s);
    b.position.x = halfWidth;
    b.position.y = halfHeight;

    boidsContainer.addChild(b);
    items.push(b);
  }

  setupStats();

  $(window).on('resize', windowOnResize);
  windowOnResize();

  render();
}

function createBoids() {
  boids = new window.Boids({
    boids: numBoids,
    speedLimit: 1.8,
    accelerationLimit: 10,
    // remove o tremido quando 2 bois ou mais estao juntos
    separationForce: 0,
    cohesionForce: 0.1,
    attractors: attractors,
    alignmentForce: 0.9
  });
  setupDatGUI();

  //creating attraction here and setting mousemove
  boids.attractors = [
    [0, 0, 70, 8.4]
  ];

  $(window).mousemove(function(ev) {
    boids.attractors[0][0] = ev.clientX - halfWidth;
    boids.attractors[0][1] = ev.clientY - halfHeight;
  });
}

function render() {
  boids.tick();
  stats.update();
  var boidData = boids.boids;

  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
    x = boidData[i][0]; y = boidData[i][1];
    boidData[i][0] = x > boidsLimit.right ? boidsLimit.left : -x > boidsLimit.right ? boidsLimit.right : x;
    boidData[i][1] = y > boidsLimit.bottom ? boidsLimit.top : -y > boidsLimit.bottom ? boidsLimit.bottom : y;
    items[i].position.x = x;
    items[i].position.y = y;
    items[i].rotation =  boidData[i][6];
  }

  renderer.render(stage);
  requestAnimationFrame(render);
}

function windowOnResize() {
  var coef,
    spacing = 10;

  renderer.resize(window.innerWidth, window.innerHeight);
  renderer.view.width = window.innerWidth;
  renderer.view.height = window.innerHeight;
  halfWidth = window.innerWidth * 0.5;
  halfHeight = window.innerHeight * 0.5;

  boidsContainer.position.x = halfWidth;
  boidsContainer.position.y = halfHeight;

  if (window.innerWidth < 720) {
    curScale = 0.7;
  } else {
    curScale = 1;
  }

  boidsContainer.scale.x = curScale;
  boidsContainer.scale.y = curScale;

  coef = 1 / curScale;

  boidsLimit = {
    top: -halfHeight * coef - spacing,
    bottom: halfHeight * coef + spacing,
    left: -halfWidth * coef - spacing,
    right: halfWidth * coef + spacing
  };
}

function random(from, to) {
  return (Math.random() * (to - from) + from);
}

$(window).ready(function() {
  init();
});
