(function(window, undefined) {

  // boids: 50,              // The amount of boids to use
  // speedLimit: 0,          // Max steps to take per tick
  // accelerationLimit: 1,   // Max acceleration per tick
  // separationDistance: 60, // Radius at which boids avoid others
  // alignmentDistance: 180, // Radius at which boids align with others
  // choesionDistance: 180,  // Radius at which boids approach others
  // separationForce: 0.15,  // Speed to avoid at
  // alignmentForce: 0.25,   // Speed to align with other boids
  // choesionForce: 0.1,     // Speed to move towards other boids
  'use strict';
  window.Boids = function(opts) {
    var self = this,
      sqrt = Math.sqrt,
      POSITIONX = 0,
      POSITIONY = 1,
      SPEEDX = 2,
      SPEEDY = 3,
      ACCELERATIONX = 4,
      ACCELERATIONY = 5,
      DIRECTION = 6;
    opts = opts || {};

    // apply the speed for all items!
    this.globalSpeedX = 0;

    // default properties
    this.speedLimitRoot = opts.speedLimit || 0;
    this.accelerationLimitRoot = opts.accelerationLimit || 9;
    this.speedLimit = Math.pow(this.speedLimitRoot, 1.8);
    this.accelerationLimit = Math.pow(this.accelerationLimitRoot, 2);
    this.separationDistance = Math.pow(opts.separationDistance || 45, 2);
    this.alignmentDistance = Math.pow(opts.alignmentDistance || 415, 2);
    this.cohesionDistance = Math.pow(opts.cohesionDistance || 175, 2);
    this.separationForce = opts.separationForce || 0.9;
    this.cohesionForce = opts.cohesionForce || 0.5;
    this.alignmentForce = opts.alignmentForce || opts.alignment || 4;
    this.attractors = opts.attractors || [];

    var boids = this.boids = [];
    for (var i = 0, l = opts.boids === undefined ? 50 : opts.boids; i < l; i += 1) {

      if (opts.startPositions) {
        boids[i] = [
          opts.startPositions[i][0], opts.startPositions[i][1], 0, 0, 0, 0];
      } else {
        boids[i] = [Math.random() * 100, Math.random() * 100, 0, 0, 0, 0];
      }
    }

    this.tick = function() {
      var boids = this.boids,
        sepDist = this.separationDistance,
        sepForce = this.separationForce,
        cohDist = this.cohesionDistance,
        cohForce = this.cohesionForce,
        aliDist = this.alignmentDistance,
        aliForce = this.alignmentForce,
        speedLimit = this.speedLimit,
        accelerationLimit = this.accelerationLimit,
        accelerationLimitRoot = this.accelerationLimitRoot,
        speedLimitRoot = this.speedLimitRoot,
        size = boids.length,
        current = size,
        sforceX, sforceY,
        cforceX, cforceY,
        aforceX, aforceY,
        spareX, spareY,
        attractors = this.attractors,
        attractorCount = attractors.length,
        distSquared,
        currPos,
        length,
        target;

      while (current--) {
        sforceX = 0; sforceY = 0;
        cforceX = 0; cforceY = 0;
        aforceX = 0; aforceY = 0;
        currPos = boids[current];

        // Attractors
        target = attractorCount;
        while (target--) {
          var attractor = attractors[target];
          spareX = currPos[0] - attractor[0];
          spareY = currPos[1] - attractor[1];
          distSquared = spareX * spareX + spareY * spareY;

          if (distSquared < attractor[2] * attractor[2]) {
            length = sqrt(spareX * spareX + spareY * spareY);
            boids[current][SPEEDX] -= (attractor[3] * spareX / length) || 0;
            boids[current][SPEEDY] -= (attractor[3] * spareY / length) || 0;
          }
        }

        target = size;
        while (target--) {
          if (target === current) {continue; }
          spareX = currPos[0] - boids[target][0];
          spareY = currPos[1] - boids[target][1];
          distSquared = spareX * spareX + spareY * spareY;

          if (distSquared < sepDist) {
            sforceX += spareX;
            sforceY += spareY;
          } else {
            if (distSquared < cohDist) {
              cforceX += spareX;
              cforceY += spareY;
            }
            if (distSquared < aliDist) {
              aforceX += boids[target][SPEEDX];
              aforceY += boids[target][SPEEDY];
            }
          }
        }

        // Separation
        length = sqrt(sforceX * sforceX + sforceY * sforceY);
        boids[current][ACCELERATIONX] += (sepForce * sforceX / length) || 0;
        boids[current][ACCELERATIONY] += (sepForce * sforceY / length) || 0;
        // Cohesion
        length = sqrt(cforceX * cforceX + cforceY * cforceY);
        boids[current][ACCELERATIONX] -= (cohForce * cforceX / length) || 0;
        boids[current][ACCELERATIONY] -= (cohForce * cforceY / length) || 0;
        // Alignment
        length = sqrt(aforceX * aforceX + aforceY * aforceY);
        boids[current][ACCELERATIONX] -= (aliForce * aforceX / length) || 0;
        boids[current][ACCELERATIONY] -= (aliForce * aforceY / length) || 0;
      }
      current = size;

      // Apply speed/acceleration for
      // this tick
      var ratio;
      while (current--) {
        if (accelerationLimit) {
          distSquared = boids[current][ACCELERATIONX] * boids[current][ACCELERATIONX] + boids[current][ACCELERATIONY] * boids[current][ACCELERATIONY];
          if (distSquared > accelerationLimit) {
            ratio = accelerationLimitRoot / sqrt(distSquared);
            boids[current][ACCELERATIONX] *= ratio;
            boids[current][ACCELERATIONY] *= ratio;
          }
        }

        boids[current][SPEEDX] += boids[current][ACCELERATIONX];
        boids[current][SPEEDY] += boids[current][ACCELERATIONY];

        if (speedLimit) {
          distSquared = boids[current][SPEEDX] * boids[current][SPEEDX] + boids[current][SPEEDY] * boids[current][SPEEDY];
          if (distSquared > speedLimit) {
            ratio = speedLimitRoot / sqrt(distSquared);
            boids[current][SPEEDX] *= ratio;
            boids[current][SPEEDY] *= ratio;
          }
        }
        var px = boids[current][POSITIONX] , py = boids[current][POSITIONY];

        boids[current][POSITIONX] += boids[current][SPEEDX] + self.globalSpeedX;
        boids[current][POSITIONY] += boids[current][SPEEDY];
        boids[current][DIRECTION] = Math.atan2(boids[current][POSITIONY] - py, boids[current][POSITIONX] - px);
      }
    };

    return this;
  };

})(window);
