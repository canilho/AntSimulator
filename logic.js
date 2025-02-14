var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

//set canvas teh size of the window
var w = canvas.width = window.innerWidth;
var h = canvas.height = window.innerHeight; 

// Game variables
// var base = { x: 400, y: 300, size: 20 }; // Base location

// Grow Configs for ants 
var antSize = 10; // Initial size of ants
var antGrow = true; // If ants should grow
var maxAntSize = 10; // Maximum size of ants when grow is active

var numberOfAnts = 50;  // Number of ants
var numberOfResources = 200; // Number of resources on the map
var resourceLifeValue = 5000; // Max Life that ants restore when eating
var antSpeed = 0.6; // Speed of ants

var lifecycles = 20 * 1000; // Lifetime of ants
var resourcesforPregnancy = 5; // Number of resources needed for pregnancy
var limitAnts = 200; // Limit of ants

var WindEffectOnAnts = 0.1; // percentage of the effect of wind on ants movement
var rotationSpeed = 0.01; // Adjust this value for smoother or faster rotation


var colors=["blue", "red", "yellow", "green", "purple", "orange"];

// Array to store resources
var resources = []; 
// Ants (AI)
var ants = []; 

// use image as background of the canvas
var img = new Image();
img.src = 'dirt.jpg';
var pattern;
img.onload = function() {
  //strech image to canvas width and height
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //ctx.fillStyle = pattern;
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
};

window.addEventListener('resize', onResize);

function createAnt(x, y, size, speed, collected, color, lifecycles, currentOrientation, targetOrientation){ 
  return {
    x: x,
    y: y,
    size: size,
    speed: speed,
    collected: collected,
    totalCollected: 0,
    color: color, 
    target: false,
    distanceToTarget: 0, 
    lifecycles: lifecycles, // Initialize ant lifecycles
    currentOrientation: currentOrientation, // Initialize current orientation
    targetOrientation: targetOrientation, // Initialize target orientation
    isSelected: false
  };
}

function onResize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  ctx.drawImage(img, 0, 0, w, h);
}


// Add event listener for mouse click
canvas.addEventListener('click', onClick);

function onClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  var selected = false;

  // Check if click is near an ant
  ants.forEach(ant => {
    const distance = Math.sqrt((ant.x - x) ** 2 + (ant.y - y) ** 2);
    // selected is used to prevent multiple selected ants at once with a single click
    if (distance < ant.size*3 && !selected)  {
      // Toggle ant color between red and black
      ant.isSelected = true;
      selected = true;
      // console.log('Ant details:', ant);
    }else {
      ant.isSelected = false;
    }
  });

  // Check if click is near a resource
  /*resources.forEach(resource => {
    const distance = Math.sqrt((resource.x - x) ** 2 + (resource.y - y) ** 2);
    if (distance < resource.size) {
      // Log resource details to the console
      console.log('Resource details:', resource);
    }
  });*/
}

//generate ants
function generateAnts(){
  for (let i = 0; i < numberOfAnts; i++) {
    // if colors are not enough, use random colors
    if (colors.length < numberOfAnts){
      colors.push('#' + Math.floor(Math.random()*16777215).toString(16));
    }
    
    ants.push(
      createAnt(
        ~~(Math.random() * w),
        ~~(Math.random() * h),
        antSize-3,
        antSpeed + Math.random() * 0.1,
        0,
        colors[i], 
        lifecycles,
        0,
        0));
  }
}

// The ant should collect the resource and bring back to base, 
// or if it has space, it can collect more resources, and only come back when it is full.
  
// spawn 50 resources
function generateResources(){
  for (let i = 0; i < numberOfResources; i++) {
    resources.push(createNewResouce());
  }
}

function createNewResouce(){
  return  {
    x: ~~(20 + Math.random() * (w - 40)),
    y: ~~(20 + Math.random() * (h - 40)),
    size: 5,
    collected: false,
    ant: false // Ant Targeting the resource
  };
}

function drawCounter(ant, pos){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(ant.color + ": " + ant.collected + "\t Life:" + 
    + ant.lifecycles, 10, 20+20*pos);
}

// Draw the base
function drawBase() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(base.x - base.size / 2, base.y - base.size / 2, base.size, base.size);
}

function drawAnt(ant) {
  let x = ant.x; 
  let y = ant.y;
  let size = ant.size;
  let color; // = ant.color;
  let orientation = ant.currentOrientation; 

  // quick calculations for performance
  var size_o2 = size/2;
  var size_o3 = size/3;
  var size_v2 = size*2;
  var size_v3 = size*3;
  var size_v6 = size*6;

  var redamount = 0;
  
  
  if(ant.isSelected){
    //set ant color as green
    color = "rgb(9, 97, 38)";

    // ant cage
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x - size_v3, y - size_v3 , size_v6, size_v6);
    
    //draw health bar over the ant
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(x - size_v3, y - size_v3,  (ant.lifecycles/lifecycles)*size_v6, size_o2); 

    // write some of the ant properties next to the ant, like speed and collected resources
    ctx.fillStyle ="black";
    ctx.font = "12px Verdana";
    ctx.fillText("Speed: " + (~~(100*ant.speed)/100), x+size_v3+10, y-10);
    ctx.fillText("Collected: " + ant.totalCollected, x+size_v3+10, y+5);

    ctx.fillStyle =color;
    ctx.strokeStyle = color;

  } else{
      // if the ant is dying, change the color to a mode red color
    redamount = ~~(256 - 256 *(ant.lifecycles / lifecycles));
    ctx.fillStyle = "rgb("+ redamount + ",0,0)";
    ctx.strokeStyle = "rgb("+ redamount + ",0,0)";;
  }

  // Save the current context state
  ctx.save();

  // Translate and rotate the canvas based on the orientation
  ctx.translate(x, y);
  ctx.rotate(orientation + Math.PI/2);

  // Draw the body (3 circles)
  ctx.beginPath();
  ctx.arc(0, 0, size_o2, 0, 2 * Math.PI); // Head 
  ctx.arc(0, size, size_o2 , 0, 2 * Math.PI); // Thorax
  ctx.arc(0, size_v2, size_o2 , 0, 2 * Math.PI); // Abdomen
  ctx.fill();

  // Draw the legs (6 lines)
  var legLength = size;
  var legOffsets = [
    { x: -size_o2, y: size_o2 },
    { x: size_o2, y: size_o2},
    { x: -size_o2, y: size },
    { x: size_o2, y: size },
    { x: -size_o2, y: size + size_o2 },
    { x: size_o2, y: size + size_o2}
  ];

  legOffsets.forEach(offset => {
    var legX = offset.x;
    var legY = offset.y;
    var legEndX = legX + (offset.x < 0 ? -legLength : legLength);
    var legEndY = legY + (Math.random() - 0.5) * legLength;

    //ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(legX, legY);
    ctx.lineTo(legEndX, legEndY);
    ctx.stroke();
  });

  // Draw the antennas (2 lines)
  var antennaLength = size;
  var antennaOffsets = [
    { x: -size_o3, y: -size_o3 },
    { x: size_o3, y: -size_o3 }
  ];

  antennaOffsets.forEach(offset => {
    var antennaX = offset.x;
    var antennaY = offset.y;
    var antennaEndX = antennaX + (antennaX < 0 ? -antennaLength : antennaLength);
    var antennaEndY = antennaY - antennaLength;

    //ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(antennaX, antennaY);
    ctx.lineTo(antennaEndX, antennaEndY);
    ctx.stroke();
  });

  // Restore the context to its original state
  ctx.restore();
}


// Draw resources
function drawResources() {
  resources.forEach(resource => {
    let resource_size = resource.size;
    let resource_half_size = ~~(resource.size / 2);
    if(resource.ant){
      ctx.fillStyle = 'red';
      ctx.fillRect(~~(resource.x - resource_half_size), ~~(resource.y - resource_half_size), resource_size, resource_size);
    } else {
      // show the resource is being targeted by the ant
      ctx.fillStyle = "black";
      ctx.fillRect(~~(resource.x - resource_half_size), ~~(resource.y - resource_half_size), resource_size, resource_size);
    }

    // Set size of stroke
    /*ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(~~(resource.x - resource_half_size), ~~( resource.y - resource_half_size), resource_size, resource_size);
    ctx.lineWidth = 0;*/
   });


}

function cleanResources() {
  for (let i = resources.length - 1; i >= 0; i--) {
    if (resources[i].collected) {
      resources.splice(i, 1);
      resources.push(createNewResouce());
    }
  }
}

function clearResourcesTarget(){
  resources.forEach(resource => {
    if (resource.ant !== false && !ants[resource.ant]){
      resource.ant = false;
    }
  });
}

// Discover closest resource
function findClosestResource(ant, i) {
  let closestResource = null;
  let minDistance = Infinity;

  resources.forEach(resource => {
    var distance = Math.sqrt((ant.x - resource.x) ** 2 + (ant.y - resource.y) ** 2);
    if(!resource.collected && distance < minDistance) {
      if (resource.ant === false || resource.ant === i) {
        // If the resource is not targeted by any ant
        minDistance = distance;
        closestResource = resource;
      } else if (resource.ant > 0 && resource.ant !== i) {
        // If the resource is targeted by another ant
        var otherAnt = ants[resource.ant];
        if (otherAnt !== undefined) {
          resource.ant = false;
          var otherAntDistance = Math.sqrt((otherAnt.x - resource.x) ** 2 + (otherAnt.y - resource.y) ** 2);
          if (distance < otherAntDistance) {
            minDistance = distance;
            closestResource = resource;
            otherAnt.targetOrientation = Math.random() * Math.PI * 2; // Make the other ant find a new target
            otherAnt.target = false;
          }
        }
      }
    }
  });
  
  if (closestResource) {
    closestResource.ant = i; 
    ant.distanceToTarget = minDistance;
    ant.target = true;   
  }

  return closestResource;
}

function chooseAction(ant, i) {
  // If ant colected enoough resources, move to the closest mate
   if (ant.collected >= resourcesforPregnancy && ant.lifecycles > lifecycles/2) {
    let closestMate = null;
    let minDistance = Infinity;
    ants.forEach((a, index) => {
      if (index !== i){
        var distance = Math.sqrt((ant.x - a.x) ** 2 + (ant.y - a.y) ** 2);
        if (distance < ant.size + a.size) {
          // ant.color = a.color;
          // do not create an ant if there are more than the limit
          if (ants.length < limitAnts){
            ants.push(
              createAnt(
                ant.x,
                ant.y,
                antSize-3,
                antSpeed + Math.random() * 0.1,
                0,
                a.color, 
                lifecycles,
                ant.currentOrientation+Math.PI/2,
                ant.targetOrientation
                ));
          }
          ant.collected = 0;
          ant.lifecycles = lifecycles;
          ant.target = false;
          
          a.collected = 0;
          a.lastCollectedTime = lifecycles;
          a.target = false;
          a.targetOrientation = ant.targetOrientation - Math.PI/2;
              
          
          //if ant couldn't find a mate, it will move to the closest mate
          closestMate = distance < minDistance ? a : closestMate;
          minDistance = distance < minDistance ? distance : minDistance;
        }  
      }
    });
    if (closestMate !== null) {
      ant.targetOrientation = Math.atan2(closestMate.y - ant.y, closestMate.x - ant.x);
      ant.target = true;
      return
    } else {
      ant.target = false;
    }
  }
  
  // Default behaviour - find food
  var closestResource = findClosestResource(ant, i);
  if (closestResource !== null) {
    var distance = Math.sqrt((ant.x - closestResource.x) ** 2 + (ant.y - closestResource.y) ** 2);
    if (distance < ant.size) {
      ant.collected += 1;
      ant.totalCollected += 1;
      // ant.lifecycles = lifecycles;
      // ant restores X llife on eating up to max life.
      ant.lifecycles += resourceLifeValue;

      // prevent that gets more life than possible.
      if(ant.lifecycles > lifecycles){
        ant.lifecycles = lifecycles;
      }


      if (antGrow) {
        // Change ant size slightly up to size 20
        // But only increase one size per 10 resources
        if (ant.collected % 10 === 0 && ant.size < maxAntSize) {
          ant.size += 1;
        }
      }
      closestResource.collected = true;
    } else {
      ant.targetOrientation = Math.atan2(closestResource.y - ant.y, closestResource.x - ant.x);
      ant.target = true;
    }
  } else {
    ant.target = false;
  }
}

function moveAntWithAI(ant, i) {
  chooseAction(ant, i);
  // Gradually rotate towards the target orientation
  let diff = ant.targetOrientation - ant.currentOrientation;

  // Ensure the ant rotates through the shortest angle
  if (diff > Math.PI) {
    diff -= 2 * Math.PI;
  } else if (diff < -Math.PI) {
    diff += 2 * Math.PI;
  } 

  if (Math.abs(diff) < rotationSpeed) {
    ant.currentOrientation = ant.targetOrientation;
    // Only Update the position if the Ant is on the right orientation
    ant.x += Math.cos(ant.targetOrientation ) * ant.speed + WindEffectOnAnts*windVector[0];
    ant.y += Math.sin(ant.targetOrientation ) * ant.speed + WindEffectOnAnts*windVector[1];
  } else {
    ant.currentOrientation += rotationSpeed * 3 * ant.speed * Math.sign(diff);
    // Move very slowly when not facing the target
    ant.x += Math.cos(ant.targetOrientation ) * ant.speed + WindEffectOnAnts*windVector[0];
    ant.y += Math.sin(ant.targetOrientation ) * ant.speed + WindEffectOnAnts*windVector[1];
  }
  
  // Keep ant within canvas bounds
  ant.x = Math.max(0, Math.min(w, ant.x));
  ant.y = Math.max(0, Math.min(h, ant.y));

  // Check if the ant has any time to live
  if (ant.lifecycles < 0) {
    //console.log(ant);
    return null; // Return null to indicate the ant should be removed
  }

  // remove X lifecycles to the ant 
  ant.lifecycles -= 10;

  return ant;
}


// draw heat map based on the amount of resources not collected per square of area 200 x 200
function drawHeatMap(){
  let map = [];
  let x = 0;
  let y = 0;
  let total = 0;
  let squaresize = 200;
  for (let i = 0; i < w; i+=squaresize){
    for (let j = 0; j < h; j+=squaresize){
      total = 0;
      resources.forEach(resource => {
        if (resource.x >= i && resource.x <= i+squaresize && resource.y >= j && resource.y <= j+squaresize){
          total++;
        }     
      });
      map.push({x: x, y: y, total: total});
      y++;
    }
    y = 0;
    x++;
  }
  map.forEach(m => {
    ctx.fillStyle = "rgba(50, 200, 50, " + m.total/50 + ")";
    ctx.fillRect(m.x*squaresize, m.y*squaresize, squaresize, squaresize);
  });
}

function drawAnts(){
  // Array to store indices of ants to be removed
  var antsToRemove = [];

  for (let i = ants.length-1; i >= 0; i--) {
    var updatedAnt = moveAntWithAI(ants[i], i);
    if (updatedAnt) {
      ants[i] = updatedAnt;
      //drawAnt(ants[i]);
      drawAnt(ants[i]);
      //drawCounter(ants[i], i);
    } else {
      antsToRemove.push(i); // Mark ant for removal
    }
  }

  // Remove ants marked for removal
  for (let i = antsToRemove.length - 1; i >= 0; i--) {
    ants.splice(antsToRemove[i], 1);
  }
}


// Add sand wind effect
var windDirection = Math.random() * 2 * Math.PI; // Initial wind direction
var windSpeed = 1; // Speed of wind
var windChangeRate = 0.1; // Rate at which wind direction changes
var numOfSandParticles = 1000;
var sandParticleSize = 1;
var windOffset = 3;
var sandParticles = [];
var windVector = [ Math.cos(windDirection) * windSpeed, Math.sin(windDirection) * windSpeed ];


function generateSandWind() {
    for (let i = 0; i < numOfSandParticles; i++) {
      sandParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * sandParticleSize + 1,
      color: 'rgba(3, 3, 0, 0.5)'
    })
  }
}
generateSandWind();

function drawSandWind() {
  // Update wind direction gradually
  
  ctx.lineWidth = 2;

  //  Update wind vector
  //  One percent change of turn the vector to oposite direction
  var chance = Math.random();
  // Low chance for a big wind change
  if(chance < 0.01){ 
    windDirection += (Math.random() - 0.1) * windChangeRate;
    windVector = [ Math.cos(windDirection) * windSpeed, Math.sin(windDirection) * windSpeed ];    
  } 
  // change the wind direction slightly
  else { 
    windDirection += (Math.random() - 0.5) * windChangeRate;
    windVector = [ Math.cos(windDirection) * windSpeed, Math.sin(windDirection) * windSpeed ];
  }  

  // Draw sand particles
  for (let i = 0; i < numOfSandParticles; i++) {
    let sand = sandParticles[i];
    sand.x = sand.x + windVector[0];
    sand.y = sand.y + windVector[1];

    // offset the sand particles slightly every frame
    sand.x += (windOffset - Math.random() * 2 * windOffset);
    sand.y += (windOffset - Math.random() * 2 * windOffset);


    ctx.fillStyle = sand.color;
    ctx.beginPath();
    ctx.arc(sand.x , sand.y, sand.size, 0.3, 2 * Math.PI);
    ctx.fill();

    // relocate sand particles when they reach the canvas bounds
    if(sand.x<0){
      sand.x = w;
    }
    if (sand.y<0){
      sand.y = h;
    }
    if(sand.x>w){
      sand.x = 0;
    }
    if (sand.y>h){
      sand.y = 0;
    }
  }
}


// Update game loop to use AI movement
function gameLoop() {
  //ctx.clearRect(0, 0, w, h);

  // Game background colkor 
  ctx.fillStyle = "#e3d4bf";
  ctx.fillRect(0, 0, w, h);

  // draw image background
  // ctx.drawImage(img, 0, 0, w, h);

   // Draw heat map
  // drawHeatMap();

  // Draw resources
  drawResources();

  // Clean up collected resources
  cleanResources();

  // Remove dead ants and update ant positions
  drawAnts();

  // Draw sand wind effect
  drawSandWind();

  // Clear resource targets
  clearResourcesTarget();

  // Request the next frame
  requestAnimationFrame(gameLoop);
}

// Initialize game

generateAnts();
generateResources();

gameLoop();
