const dmPsych = (function() {
  'use strict';

  const obj = {};

 /*
  *
  *  Set-up for Prolific and Data Pipe
  *
  */

  // initialize jsPsych
  window.jsPsych = initJsPsych({
    on_finish: () => {
      let boot = jsPsych.data.get().last(1).select('boot').values[0];
      if(!boot) {
        document.body.innerHTML = 
        `<div align='center' style="margin: 10%; color: rgb(109, 112, 114);">
            <p>Thank you for participating!</p>
            <p><b>To receive payment, please wait while we redirect you to Prolific.</b></p>
        </div>`;
        setTimeout(() => { location.href = `https://app.prolific.co/submissions/complete?cc=${completionCode}` }, 4000);
      }
    },
  });

  // set and save subject ID
  let subject_id = jsPsych.data.getURLVariable("PROLIFIC_PID");
  if (!subject_id) subject_id = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({ subject: subject_id, boot: false });

  // define file name
  obj.filename = `${subject_id}.csv`;

  // define completion code for Prolific
  const completionCode = "C7A869A0";

  // track fps
  let frames = 0, tic = performance.now(), fpsAdjust;
  (function getFpsAdjust() {
      const req = window.requestAnimationFrame(getFpsAdjust);
      frames++;
      if(frames == 120) { 
          fpsAdjust = (performance.now() - tic) / 2000;
          jsPsych.data.addProperties({fpsAdjust: fpsAdjust});
          frames = 0;
          tic = performance.now();
      };
  })();


 /*
  *
  *  David's task functions
  *
  */

  // logit function
  obj.logit = (rate, k, x0, shift) => {
    let x = rate
    let denom = 1 + Math.exp(-k * (x - x0));
    let logit = 1 / denom;
    let pPop = logit - shift;
    return pPop;
  };

  // save survey data in wide format
  obj.saveSurveyData = (data) => {
    const names = Object.keys(data.response);
    const values = Object.values(data.response);
    for(let i = 0; i < names.length; i++) {
        data[names[i]] = values[i];
    };      
  };

  // compute total number of errors on questionnaires
  obj.getTotalErrors = (data, correctAnswers) => {
    const answers = Object.values(data.response);
    const errors = answers.map((val, index) => val === correctAnswers[index] ? 0 : 1)
    const totalErrors = errors.reduce((partialSum, a) => partialSum + a, 0);
    return totalErrors;
  };

  // create fireworks display
  obj.drawFireworks = function (c, duration, maxFireworks, message, fontSize) {

    // get start time
    const start = performance.now();

    // get context
    let ctx = c.getContext('2d');

    // get text variables
    const lines = message.split('\n');

    const maxSparks = Math.min(maxFireworks*5, 60);
    let fireworks = [];
   
    for (let i = 0; i < maxFireworks; i++) {
      let firework = {
        sparks: []
      };
      for (let n = 0; n < maxSparks; n++) {
        let spark = {
          vx: Math.random() * 5 + .5,
          vy: Math.random() * 5 + .5,
          weight: Math.random() * .3 + .03,
          red: Math.floor(Math.random() * 2 + 1),
          green: Math.floor(Math.random() * 2 + 1),
          blue: Math.floor(Math.random() * 2 + 1)
        };
        if (Math.random() > .5) spark.vx = -spark.vx;
        if (Math.random() > .5) spark.vy = -spark.vy;
        firework.sparks.push(spark);
      };
      fireworks.push(firework);
      resetFirework(firework);
    };

    let myReq = window.requestAnimationFrame(explode);
   
    function resetFirework(firework) {
      firework.x = Math.floor(Math.random() * c.width);
      firework.y = c.height;
      firework.age = 0;
      firework.phase = 'fly';
    };
     
    function explode() {
      ctx.clearRect(0, 0, c.width, c.height);
      fireworks.forEach((firework,index) => {
        if (firework.phase == 'explode') {
            firework.sparks.forEach((spark) => {
            for (let i = 0; i < 10; i++) {
              let trailAge = firework.age + i;
              let x = firework.x + spark.vx * trailAge;
              let y = firework.y + spark.vy * trailAge + spark.weight * trailAge * spark.weight * trailAge;
              let fade = i * 10 + firework.age * 2 + 50;
              let r = Math.floor(spark.red * fade);
              let g = Math.floor(spark.green * fade);
              let b = Math.floor(spark.blue * fade);
              ctx.beginPath();
              ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
              ctx.rect(x, y, 5, 5);
              ctx.fill();
            }
          });
          firework.age = firework.age + fpsAdjust;
          if (firework.age > 50 && Math.random() < .05) {
            resetFirework(firework);
          }
        } else {
          firework.y = firework.y - (10 * fpsAdjust * 2);
          for (let spark = 0; spark < 15; spark++) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(' + (3 + index) * 50 + ',' + (3 + spark) * 17 + ',0,1)';
            ctx.rect( firework.x + Math.random() * spark - spark / 2, firework.y + spark * 4, 5, 5);
            ctx.fill();
          }
          if (Math.random() < .001 || firework.y < 200) firework.phase = 'explode';
        }
      });

      for (let i = 0; i<lines.length; i++) {
        ctx.fillStyle = 'black';
        ctx.font = ["normal "+fontSize[0]+"pt Arial", "normal "+fontSize[1]+"pt Arial"][i]
        let lineWidths = lines.map(x => ctx.measureText(x).width);
        ctx.fillText(lines[i], (c.width/2) - (lineWidths[i]/2), c.height/2 + (i*120) - 60);
      }

      if (performance.now() - start < duration) { //note this also
        myReq = window.requestAnimationFrame(explode);
      } else {
        cancelAnimationFrame(myReq);
      };        
    };

  };

  // create tile game
  obj.MakeTileGame = function({val, plural, hex, tileHit, tileMiss, roundLength}, gameType, nTrials, pM, blockName) {

    let losses = 0, round = 1, streak = 0, trialNumber = 0, tooSlow = null, tooFast = null;

    const latency = dmPsych.makeRT(nTrials, pM, roundLength);

    const intro = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'intro', block: blockName},
      stimulus: function() {
        if (gameType == 'invStrk') {
            return `<div style='font-size:35px'><p>Get ready for the first round!</p></div>`;
        };
        if (gameType == '1inN') {
            return `<div style='font-size:35px'><p>Get ready for Round 1!</p></div>`;
        };
        if (gameType == 'strk') {
            return `<div style='font-size:35px'><p>Get ready for the first tile!</p></div>`;
        };
        if (gameType == 'bern') {
            return `<div style='font-size:35px'><p>Get ready for the first tile!</p></div>`;
        };
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
    };

    const iti = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'iti', block: blockName},
      stimulus: "",
      choices: [" "],
      trial_duration: () => {
        return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
      },
      on_finish: (data) => {
        data.response == " " ? tooFast = 1 : tooFast = 0;
        data.tooFast = tooFast;
      },
    };

    const warning = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'warning', block: blockName},
      choices: "NO_KEYS",
      stimulus: () => {
        const message = `<div style='font-size: 20px'><p>Too Fast!</p><p>Please wait for the tile to appear before pressing your SPACEBAR</p></div>`;
        return (tooFast) ? message : '';
      },
      trial_duration: () => {
        return (tooFast) ? 2500 : 0;
      },
      post_trial_gap: () => {
        return (tooFast) ? 1000 : 0;
      },
    };

    const delayLoop = {
      timeline:[iti, warning],
      loop_function: (data) => {
        return (tooFast) ? true : false;
      },
    };

    const probe = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'probe', block: blockName},
      stimulus: '<div class="box" style="background-color:gray"></div>',
      choices: [" "],
      trial_duration: () => { 
        return latency[trialNumber] 
      },
      on_finish: (data) => {
        data.response ? tooSlow = 0 : tooSlow = 1;
        data.tooSlow = tooSlow;
      },
    };

    const outcome = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: `activation`, block: blockName},
      stimulus: () => {
        if (!tooSlow) {
          return tileHit
        } else {
          return tileMiss
        }
      },
      choices: [" "],
      response_ends_trial: false,
      trial_duration: 1000,
    };

    const feedback = {
      type: jsPsychCanvasKeyboardResponse,
      data: {trial_type: `feedback`, block: blockName},
      canvas_size: [700, 900],
      stimulus: function(c) { 
        let maxFireworks, message, fontSize;
        if (gameType == 'bern') {
          let nextRoundMsg = (trialNumber + 1 < nTrials) ? 'Round '+(round + 1)+' will now begin' : 'The game is now complete';
          if (tooSlow) {
            maxFireworks = 0;
            fontSize = [50, 30];
            message = 'You lost Round '+round+'\n'+nextRoundMsg;
            round++;          
          } else {
            maxFireworks = blockName == 'practice' ? 0 : 6;
            fontSize = [50, 30];
            message = 'You won Round '+round+'\n'+nextRoundMsg;
            round++;          
          };
        }; 
        if (gameType == '1inN') {
          let nextRoundMsg = (trialNumber + 1 < nTrials) ? 'Round '+(round + 1)+' will now begin' : 'The game is now complete';
          if (tooSlow && losses < 4) {
            losses++;
            maxFireworks = 0;
            fontSize = [30];
            message = 'Continuing Round '+round+'...';
          } else if (tooSlow && losses == roundLength - 1) {
            losses = 0;
            maxFireworks = 0;
            fontSize = [50, 30];
            message = 'You lost Round '+round+'\n'+nextRoundMsg;
            round++;
          } else {
            losses = 0;
            maxFireworks = blockName == 'practice' ? 0 : 6;
            fontSize = [50, 30];
            message = 'You won Round '+round+'\n'+nextRoundMsg;
            round++;
          };
        };
        if (gameType == 'invStrk') {
          let nextRoundMsg = (trialNumber + 1 < nTrials) ? 'Get ready for the next round' : 'The game is now complete';
          if (tooSlow && losses < 4) {
            losses++;
            let triesLeft = roundLength - losses;
            maxFireworks = 0;
            fontSize = [30, 60];
            message = 'Attempts this round:\n' + String(losses);
          } else if (tooSlow && losses == roundLength - 1) {
            losses = 0;
            maxFireworks = 0;
            fontSize = [50, 30];
            message = 'You lost this round\n'+nextRoundMsg;
          } else {
            let winIdx = ['1', '2', '3', '4', '5'][losses];
            maxFireworks = blockName == 'practice' ? 0 : [16, 8, 4, 2, 1][losses];
            losses = 0;
            fontSize = [30, 60];
            message = 'You won on attempt:\n#' + winIdx;
          };
        };
        if (gameType == 'strk') {
          if (tooSlow && streak > 0) {
            let finalStreak = streak;
            streak = 0;
            maxFireworks = blockName == 'practice' ? 0 : finalStreak;
            fontSize = [30, 60];
            message = 'Your streak was:\n' + String(finalStreak);
          } else {
            if (!tooSlow) { streak++ };
            maxFireworks = 0;
            fontSize = [30, 60];
            message = 'Current streak:\n' + String(streak);
          };
        };

        return obj.drawFireworks(c, 3000, maxFireworks, message, fontSize)
      },
      choices: "NO_KEYS",
      trial_duration: 3000,
      on_finish: (data) => {
        trialNumber++;
        if (trialNumber == nTrials) { 
          trialNumber = 0;
          losses = 0;
          streak = 0 
        };
        !tooSlow ? data.jackpot = true : data.jackpot = false;      
      },
    };

    const task = {
      timeline: [delayLoop, probe, outcome, feedback],
      repetitions: nTrials,
    };

    this.timeline = [intro, task];

  };

  // make n-dimensional array of RTs given p(hit) = p
  obj.makeRT = function(n, p, roundLength) {

    const nDraws = Math.floor(n * p);  // set number of draws from geometric distribution
    const maxWinStrk = Math.ceil((nDraws*1.5)/(n-nDraws));  // set length of longest win streak at the trial level
    const maxLossStrk = Math.ceil(((n-nDraws)*1.5)/(nDraws*roundLength));  // set length of longest losing streak at chunk level
    let geoms = [];  // random draws from geometric distribution
    let rt = [];  // array of RTs
    let nTrials = 0;  // count total numeber of trials
    let winStrkPass = true;  // flag for passing the max win streak condition
    let lossStrkPass = true;  // flag for passing the max loss streak condition
    let nLossTot = 0;  // count total numeber of losses

    /* 

    Create random vector of n trial outcomes with following conditions:
      - total number of trial-level losses = n - nDraws
      - total number of trials = n
      - first and last trials are losses
      - max win streak at the trial level is <= maxWinStrk
      - max loss streak at the chunk level is <= maxLossStrk

    */

    do {
      geoms = [];
      winStrkPass = true;
      lossStrkPass = true;

      // make n * p random draws from geometric distribution
      for (let i = 0; i < nDraws; i++) {
        let probDraw = (Math.random() * .998) + .001;
        let geomDraw = Math.floor(Math.log(1 - probDraw) / Math.log(1 - p));
        geoms.push(geomDraw);
      }

      // get longest losing streak at the chunk level
      let nLoss = geoms.map(x => Math.floor(x/roundLength));  // number of chunk-level losses in a row per geom draw
      if (Math.max(...nLoss) > maxLossStrk) { lossStrkPass = false };

      // get longest winning streak at the trial level
      for (let i = maxWinStrk; i <= nDraws; i++) {
        let geomSlice = geoms.slice(i - maxWinStrk, i);
        if (geomSlice.every(x => x == 0)) { winStrkPass = false };
      };

      nTrials = geoms.reduce((x, y) => x + y, 0) + geoms.length;  // compute total number of trials
      nLossTot = geoms.reduce((x, y) => x + y, 0);  // get total number of losses

    } while (nTrials !== n || !winStrkPass || !lossStrkPass || nLossTot !== (n - nDraws) || geoms[0] == 0);

    for (let i = 0; i < geoms.length; i++) {
      rt.push(...Array(geoms[i]).fill(200));
      rt.push(750);
    }

    return rt;

  };

  // spinner task
  obj.spinner = function(canvas, spinnerData, sectors, targetPressTime, guaranteedOutcome, nSpins) {

    /* get context */
    const ctx = canvas.getContext("2d"); 

    /* get pointer */
    const pointer = document.querySelector("#spin");

    /* get score message */
    const scoreMsg = document.getElementById("score");

    /* get wheel properties */
    let wheelWidth = canvas.getBoundingClientRect()['width'];
    let wheelHeight = canvas.getBoundingClientRect()['height'];
    let wheelX = canvas.getBoundingClientRect()['x'] + wheelWidth / 2;
    let wheelY = canvas.getBoundingClientRect()['y'] + wheelHeight / 2;
    const tot = sectors.length; // total number of sectors
    const rad = wheelWidth / 2; // radius of wheel
    const PI = Math.PI;
    const arc = (2 * PI) / tot; // arc sizes in radians

    /* spin dynamics */
    const friction = 0.98;       // 0.995=soft, 0.99=mid, 0.98=hard
    const vel_min = 250;       // Below that number will be treated as a stop
    let vel_max = 500;           // Random ang.vel. to acceletare to 
    let vel_max_rand = 500;   
    let dt = (60 / 1000) * fpsAdjust;

    /* state variables */
    let isSpinning = false;      // true when wheel is spinning, false otherwise
    let isAccelerating = false;  // true when wheel is accelerating, false otherwise
    let readyToSpin = false;     // true when the wheel is moving fast enough to spin;
    let currentAngle = 0;        // wheel angle after last perturbation
    let accel = 0;               // wheel's current acceleration
    let accel_postDecel = 0;     // wheel's accelertation after decelerating
    let vel = 0;                 // wheel's current velocity
    let vel_postDecel = 0;       // wheel's velocity after decelerating
    let nSpeedUp = 0;            // number of frames over which the wheel has accelerated
    let nSlowDown = 0;           // number of frames over which the wheel has decelerated
    let score = 0;

    /* press rate variables */
    let keydown = false;
    let lastPressTime = performance.now();
    let timeSinceLastPress = 0;
    let pressTimes = [];


    // time since last press in seconds
    const getTimeSinceLastPress = () => {
      const req_getTimeSinceLastPress = window.requestAnimationFrame(getTimeSinceLastPress);
      if (spinnerData.outcomes.length >= nSpins) { 
        window.cancelAnimationFrame(req_getTimeSinceLastPress);
        window.removeEventListener('keydown', listenForKeydown);
        window.removeEventListener('keyup', listenForKeyup);
      };
      if (!isSpinning) {
        timeSinceLastPress = (performance.now() - lastPressTime) / 1000;
        if (pressTimes[pressTimes.length - 1] > targetPressTime[0] && timeSinceLastPress < targetPressTime[1] || readyToSpin) {
          nSlowDown = 0;
          if (nSpeedUp == 0) { 
            vel = vel_postDecel;
            accel = accel_postDecel;
          };
          speedUp();
        } else {
          nSpeedUp = 0;
          slowDown();
        };        
      };
    };

    const req_getTimeSinceLastPress = window.requestAnimationFrame(getTimeSinceLastPress);

    // listen for keydown
    const listenForKeydown = window.addEventListener('keydown', (e) => {
      if (e.key == "ArrowRight" || e.code == "ArrowRight" || e.keyCode == 39) { 
        if (!isSpinning & !keydown) {
          keydown = true;
          pressTimes.push(timeSinceLastPress);
          lastPressTime = performance.now();
        };
      };
      if (e.key == " " || e.code == "Space" || e.keyCode == 32) { 
        if (!isSpinning & readyToSpin) {
          isAccelerating = true;
          isSpinning = true;
          readyToSpin = false;
          vel_max_rand = rand(vel_max + 180, vel_max - 30);
          spin()
        };
      };
    });

    // listen for keyup
    const listenForKeyup = window.addEventListener('keyup', (e) => {
      if (e.key == "ArrowRight" || e.code == "ArrowRight" || e.keyCode == 39) {
        keydown = false;
      };
    });

    /* define spinning functions */
    const speedUp = () => {
      nSpeedUp += fpsAdjust;
      accel += (.0005 * nSpeedUp) ** 1.5;
      currentAngle += vel*dt + .5*accel*(dt**2);
      vel = Math.min(vel_min, vel + accel*dt);
      render(currentAngle);
      if (Math.abs(vel) == vel_min || readyToSpin) {
        readyToSpin = true;
        pointer.textContent = 'Ready!';
        pointer.style.background = 'grey';
      } else {
        readyToSpin = false;
        pointer.textContent = '';
        pointer.style.background = 'white';
      };
    };

    const slowDown = () => {
      nSlowDown += fpsAdjust;
      vel_postDecel = vel * (friction ** nSlowDown);
      accel_postDecel = accel * (friction ** nSlowDown);
      currentAngle += vel_postDecel * dt;
      if (Math.abs(vel_postDecel) == vel_min) {
        readyToSpin = true;
        pointer.textContent = 'Ready!';
        pointer.style.background = 'grey';
      } else {
        readyToSpin = false;
        pointer.textContent = '';
        pointer.style.background = 'white';
      };
      render(currentAngle);
    };

    const render = (deg) => {
      canvas.style.transform = `rotate(${deg}deg)`;
    };

    const spin = function() {

      let req_spin = window.requestAnimationFrame(spin);

      // stop accelerating when max speed is reached

      if (guaranteedOutcome[spinnerData.outcomes.length] == 1) {
        if (Math.abs(vel) == vel_max && Math.floor(currentAngle % 360) > 93 && Math.floor(currentAngle % 360) < 108) { 
          isAccelerating = false
        };
      } else {
        if (Math.abs(vel) >= vel_max_rand) { 
          isAccelerating = false
        };
      };

      // accelerate
      if (isAccelerating) {
        currentAngle += dt*vel + 2*accel*(dt**2);
        vel += dt*accel*4; // Accelerate
        if (vel >= vel_max && guaranteedOutcome[spinnerData.outcomes.length] == 1) {
          vel = vel_max;
          accel = 0;
        };
        pointer.textContent = 'Spinning!';
        pointer.style.background = 'grey';
        render(currentAngle);
      }
      
      // decelerate and stop
      else {
        nSlowDown += fpsAdjust;
        vel_postDecel = vel * (friction ** nSlowDown);
        if (Math.abs(vel_postDecel) > vel_min * .01) {
          // decelerate
          currentAngle += vel_postDecel * dt;
          render(currentAngle);       
        } else {
          // stop spinner
          vel = 0;
          vel_postDecel = 0;
          accel = 0;
          accel_postDecel = 0;
          nSlowDown = 0;
          nSpeedUp = 0;
          let sector = sectors[getIndex()];
          spinnerData.outcomes.push(parseFloat(sector.label));
          drawSector(sectors, getIndex());
          updateScore(parseFloat(sector.label), sector.color);
          pointer.style.font = '2rem/0 sans-serif';
          pointer.textContent = sector.label;
          pointer.style.background = sector.color;
          pressTimes.shift();
          spinnerData.pressTimes.push(pressTimes);
          pressTimes = [];
          window.cancelAnimationFrame(req_spin);
        };
      };
    };

    /* generate random float in range min-max */
    const rand = (m, M) => Math.random() * (M - m) + m;

    const updateScore = (points, color) => {
      score += points;
      spinnerData.score = score;
      // scoreMsg.innerHTML = `<span style="color:${color}; font-weight: bolder">${score}</span>`;
      setTimeout(() => {
        // scoreMsg.innerHTML = `${score}`
        isSpinning = false;
        pointer.style.font = '1.2rem/0 sans-serif';
        pointer.textContent = '';
        pointer.style.background = 'white';
        drawSector(sectors, null);
      }, 1000);
    };

    const getIndex = () => {
      let normAngle = 0;
      let modAngle = currentAngle % 360;
      if (modAngle > 270) {
        normAngle = 360 - modAngle + 270;
      } else if (modAngle < -90) { 
        normAngle =  -modAngle - 90;
      } else {
        normAngle = 270 - modAngle;
      }
      let sector = Math.floor(normAngle / (360 / tot));
      return sector;
    };

    /* Draw sectors and prizes texts to canvas */
    const drawSector = (sectors, sector) => {
      for (let i = 0; i < sectors.length; i++) {
        const ang = arc * i;
        ctx.save();
        // COLOR
        ctx.beginPath();
        ctx.fillStyle = sectors[i].color;
        ctx.moveTo(rad, rad);
        ctx.arc(rad, rad, rad, ang, ang + arc);
        ctx.lineTo(rad, rad);
        ctx.fill();
        // TEXT
        ctx.translate(rad, rad);
        ctx.rotate( (ang + arc / 2) + arc );
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        if (isSpinning && i == sector) {
          ctx.font = "bolder 50px sans-serif"
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 8;
          ctx.strokeText(sectors[i].label, 0, -140);
          ctx.fillText(sectors[i].label, 0, -140);
        } else {
          ctx.font = "bold 50px sans-serif"
          ctx.fillText(sectors[i].label, 0, -140);
        }
        // RESTORE
        ctx.restore();
      }
    };

    drawSector(sectors, null);

    /* add event listners */
    window.addEventListener('resize', function(event) {
      wheelWidth = canvas.getBoundingClientRect()['width'];
      wheelHeight = canvas.getBoundingClientRect()['height'];
      wheelX = canvas.getBoundingClientRect()['x'] + wheelWidth / 2;
      wheelY = canvas.getBoundingClientRect()['y'] + wheelHeight / 2;
    }, true);
  };

  // function for drawing hole in one game on canvas
  obj.holeInOne = (function () {

    let game = {};

    // import methods from matter.js and define physics engine
    let { Engine, Render, Vertices, Composite, World, Bodies, Events, Mouse, MouseConstraint } = Matter;
    let engine = Engine.create();



    // temporary data
    let ballXtrial = [0];   // ball's X coordinates on current trial
    let ballYtrial = [0];   // ball's Y coordinate on current trial
    let endTrial = false; // flag whether the current trial is complete
    let firing = false;   // flag whether the slingshot was fired
    let inTheHole = false;  // flag whether the ball went through the hold
    let intro = 0;        // use to determine which instructions to display during introduction
    let warning = false;  // warn user to stay in play area
    let dragging = false; // true when user is drawing sling

    // data to save
    game.data = {
      ballX: [],      // ball's X coordinates on all trials
      ballY: [],      // ball's Y coordinates on all trials
      totalTrials: 0,   // total number of trials
      totalScore: 0   // total times getting the ball through the hole
    };

    // run slingshot game
    game.run = function(c, trial) {
      let mouse, mouseConstraint;

      let context = c.getContext('2d');

      // import settings
      var set = {
        ball: {
          x: trial.ball_xPos*c.width, 
          y: trial.ball_yPos*c.height, 
          rad: trial.ball_size, 
          fric: trial.friction, 
          col: trial.ball_color
        },
        wall: {
          x: trial.wall_xPos*c.width,
          yTop: (1/6)*(c.height-trial.hole_size),
          yBottom: (5/6)*c.height + (1/6)*trial.hole_size,
          width: trial.wall_width,
          height: .5*(c.height-trial.hole_size),
          col: trial.wall_color
        },
        sling: {
          stiffness: trial.tension,
          x: trial.ball_xPos*c.width,
          y: trial.ball_yPos*c.height
        },
        canvas: {
          height: c.height,
          width: c.width
        }
      };

      // construct ball
      function Ball() {           
        this.body = Bodies.circle(set.ball.x, set.ball.y, set.ball.rad, { frictionAir: set.ball.fric });
        World.add(engine.world, this.body);
      };

      // construct target
      function Wall(y, tri) {
        this.body = Bodies.fromVertices(set.wall.x, y, tri, { isStatic: true });
        World.add(engine.world, this.body);
      };

      // construct sling
      function Sling() {    
        this.body = Matter.Constraint.create({
          pointA: {x: set.sling.x, y: set.sling.y},
          bodyB: ball,
          stiffness: set.sling.stiffness,
        });
        World.add(engine.world, this.body);
      };

      // construct mouse
      function makeMouse() {    
        mouse = Mouse.create(c);
        mouseConstraint = MouseConstraint.create(engine, { mouse: mouse });
        World.add(engine.world, mouseConstraint);
      };

      // construct text
      function text(c) {

        if (warning) {
          c.font = "bold 25px Arial";
          c.fillStyle = 'red';
          c.fillText("Please keep your mouse inside the play area.", 75, 350);          
        }

        if (intro <= 3) {
          c.font = "bold 20px Arial";
          c.fillStyle = 'red';
          c.fillText("Shoot the ball through the hole.", 75, 60);
        };

        if (game.data.totalTrials == 0 && intro <= 2) {
          c.font = "16px Arial";
          c.fillStyle = "white";
          c.fillText("Step 1: Click and hold the ball. Keeping your cursor in the play area,", 75, 100);
          c.fillText("pull the ball to the left to draw your sling.", 75, 120);
        };

        if (game.data.totalTrials == 0 && intro > 0 && intro <= 2) {
          c.font = "16px Arial";
          c.fillStyle = "white";
          c.fillText("Step 2: Aim at the hole,", 75, 160);
          c.fillText("then release the ball to launch.", 75, 180);
        };

        if (game.data.totalTrials == 1 && intro > 1 && intro <= 3) {
          c.font = "16px Arial";
          c.fillStyle = "white";
          c.fillText("Good job! Please spend the next few", 75, 100);
          c.fillText("minutes playing Hole in One. We'll let", 75, 120);
          c.fillText("you know when time is up.", 75, 140);
        };
      };

      // shoot sling
      function shootSling() { 
        Events.on(mouseConstraint, 'startdrag', function(e) {
          tracker.ball = ball;
          dragging = true;
          endTrial = false;
          if (!warning) {
            intro++;
          } else {
            warning = false;
          };
        });
        Events.on(mouseConstraint, 'enddrag', function(e) {
          if(e.body === ball) {
            firing = true;
            dragging = false;
          };
        });
        Events.on(engine, 'beforeUpdate', function() {
          var xDelta = Math.abs(ball.position.x-set.ball.x);
          var yDelta = Math.abs(ball.position.y-set.ball.y);
          if(firing && xDelta < (set.ball.rad*2) && yDelta < (set.ball.rad*2)) {
            sling.bodyB = null;
            firing = false;
            intro++;
          };
        });
      };

      c.addEventListener("mouseleave", () => {
        // reset sling if player leaves canvas
        if (dragging & !warning) {
          warning = true;
          World.remove(engine.world, ball)
          ball = new Ball().body;
          sling.bodyB = ball;
          makeMouse();
          shootSling();
          trackBall();
          recordData();
        }
      });

      // track location of ball
      function trackBall() {    
        Events.on(engine, "beforeUpdate", function() {
          var xLoc = tracker.ball.position.x;
          var yLoc = tracker.ball.position.y;
          var xLimR = set.canvas.width*1.5;
          var xLimL = set.ball.x;
          var yLim = set.canvas.height;
          if (xLoc>xLimL && xLoc<xLimR && yLoc<yLim) {
            ballXtrial.push(xLoc);
            ballYtrial.push(yLoc);
          }
          if (xLoc > set.wall.x && !endTrial) {
            inTheHole = true;
          }
        });
      };

      // record data
      function recordData() {
        Events.on(engine, "beforeUpdate", function () {
          var xLoc = tracker.ball.position.x
          var yLoc = tracker.ball.position.y
          var xLim = set.canvas.width;
          var yLim = set.canvas.height;
          if(!endTrial && yLoc>(yLim*2) || !endTrial && xLoc>(xLim*2)) {

            // save data
            game.data.ballX.push(ballXtrial);
            game.data.ballY.push(ballYtrial);
            game.data.totalTrials++;
            if (inTheHole) game.data.totalScore++;

            // reset variables
            ballXtrial = [0];
            ballYtrial = [0];
            endTrial = true;
            inTheHole = false;

            // replace ball
            ball = new Ball().body;
            sling.bodyB = ball;
          };
        })
      };

      // draw spring
      function drawSpring(x1, y1, x2, y2, windings, width, offset, col1, col2, lineWidth){
        var x = x2 - x1;
        var y = y2 - y1;
        var dist = Math.sqrt(x * x + y * y);
        
        var nx = x / dist;
        var ny = y / dist;
        context.strokeStyle = col1
        context.lineWidth = lineWidth;
        context.lineJoin = "round";
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x1,y1);
        x1 += nx * offset;
        y1 += ny * offset;
        x2 -= nx * offset;
        y2 -= ny * offset;
        var x = x2 - x1;
        var y = y2 - y1;
        var step = 1 / (windings);
        for(var i = 0; i <= 1-step; i += step){  // for each winding
            for(var j = 0; j < 1; j += 0.05){
                var xx = x1 + x * (i + j * step);
                var yy = y1 + y * (i + j * step);
                xx -= Math.sin(j * Math.PI * 2) * ny * width;
                yy += Math.sin(j * Math.PI * 2) * nx * width;
                context.lineTo(xx,yy);
            }
        }
        context.lineTo(x2, y2);
        context.lineTo(x2 + nx * offset, y2 + ny * offset)
        context.stroke();
        context.strokeStyle = col2
        context.lineWidth = lineWidth - 4;
        var step = 1 / (windings);
        context.beginPath();
        context.moveTo(x1 - nx * offset, y1 - ny * offset);
        context.lineTo(x1, y1);
        context.moveTo(x2, y2);
        context.lineTo(x2 + nx * offset, y2 + ny * offset)
        for(var i = 0; i <= 1-step; i += step){  // for each winding
            for(var j = 0.25; j <= 0.76; j += 0.05){
                var xx = x1 + x * (i + j * step);
                var yy = y1 + y * (i + j * step);
                xx -= Math.sin(j * Math.PI * 2) * ny * width;
                yy += Math.sin(j * Math.PI * 2) * nx * width;
                if(j === 0.25){
                    context.moveTo(xx,yy);
                
                }else{
                    context.lineTo(xx,yy);
                }
            }
        }
        context.stroke();
      };

      // specify vertices for walls
      var topWallVert = Vertices.fromPath(`0 0 0 ${set.wall.height} ${set.wall.width} 0`)
      var bottomWallVert = Vertices.fromPath(`0 0 0 ${set.wall.height} ${set.wall.width} ${set.wall.height}`)

      // construct bodies and mouse
      var ball = new Ball().body;
      var tracker = { ball: ball };
      var triWallTop = new Wall(set.wall.yTop, topWallVert).body;
      var triWallBottom = new Wall(set.wall.yBottom, bottomWallVert).body;
      var sling = new Sling().body;
      makeMouse();

      // call functions
      shootSling();
      trackBall();
      recordData();

      (function render_func() {
        let bodies = Composite.allBodies(engine.world)
        let constraints = Composite.allConstraints(engine.world);
        const req = window.requestAnimationFrame(render_func);
        let ballPos;
        constraints[0].stiffness = trial.tension * fpsAdjust;

        context.fillStyle = 'black';
        context.fillRect(0, 0, c.width, c.height);

        text(context);

        if (constraints[0].bodyB) {
          drawSpring(constraints[0].pointA.x, constraints[0].pointA.y, constraints[0].bodyB.position.x, constraints[0].bodyB.position.y, 4, 6, 0, "white", "#999", 3);
        }
       
        // draw bodies
        for (var i = 0; i < bodies.length; i += 1) {
          context.beginPath();
          context.fillStyle = 'white';
          context.strokeStyle = 'white';
          let body = bodies[i];
          if(body.label != 'Circle Body') {
            context.fillStyle = '#999';
            context.strokeStyle = '#999';
          };
          var vertices = bodies[i].vertices;
          context.moveTo(vertices[0].x, vertices[0].y);
          for (var j = 1; j < vertices.length; j += 1) {
              context.lineTo(vertices[j].x, vertices[j].y);
          };
          context.lineTo(vertices[0].x, vertices[0].y);
          context.fill();
          context.lineWidth = 1;
          context.stroke();
        };

        Engine.update(engine, (1000/60)*fpsAdjust);

        if(game.data.totalTrials == trial.total_shots) {
          cancelAnimationFrame(req);
        };

      })();

    };

    return game;

  }());

  // function for drawing hole in one game on canvas
  obj.float = (function () {

    let game = {};

    // import methods from matter.js and define physics engine
    let { Engine, World, Bodies, Body, Composite, Events} = Matter;
    let engine = Engine.create();

    // data to save
    game.data = {
      ball_locs: [],   // ball's y position at each frame
      tPress: [0],     // timestamp of each button press
      nPress: 0,       // total number of button presses
      glitch: [],      // true each time the ball leaves the canvas
      score: [],       // array of points earned on each click
      total_score: 0,  // sum of all points
      press_rate: [],  // array of instantaneous rates of button-pressing
      start_time: 0,   // time of first button-press
    };

    // run float game
    game.run = function(c, trial) {
      let ctx = c.getContext('2d');  // get context

      // add bodies to world
      let ceiling = Bodies.rectangle(c.width / 2, -30, c.width, 100, { isStatic: true });  // create ceiling
      let floor = Bodies.rectangle(c.width / 2, c.height + 30, c.width, 100, { isStatic: true });  // create floor
      let ball = Bodies.circle(c.width / 2, 280, trial.ball_size);  // create ball
      engine.world.gravity.y = trial.gravity;  // set gravity
      World.add(engine.world, [floor, ceiling, ball]);  // add to world

      // force
      let mid_pos = c.height / 2;  // middle of canvas
      let bottom_pos = c.height - (trial.ball_size + 20);  // ball's position while on floor
      let max_force = trial.target_force - trial.slope*(mid_pos - bottom_pos);  // maximum force given target force and slope
      let force;

      // outcomes
      let outcomes = [];  // array of outcomes to display
      ctx.font = "30px Arial";
      let outcome_height = ctx.measureText(`+ 2`).actualBoundingBoxAscent + ctx.measureText(`+ 2`).actualBoundingBoxDescent; // height of outcome text

      // zones
      let rgb = [[240, 228, 66], [213, 94, 0], [0, 158, 115], [86, 180, 233]];  // color of each zone when at max luminance
      let zone1_shift = -90;  // distance between top of zone 1 and middle of canvas
      let zone_size = 63;  // height of each zone
      let zone_values = [2, 10, 1, 3];  // points associated with each zone
      let color_weight = [.5, .5, .5, .5];  // weights applied to colors used for zones     

      // make new spark
      function MakeOutcome(zone_idx, points) {
        this.vx = Math.random() + 2;
        this.vy = -3 - Math.random();
        this.weight = .3;
        this.age = 0;
        this.zone_idx = zone_idx;
        this.points = points;
      };

      // show outcome
      function showOutcome() {
        outcomes.forEach((outcome) => {
          let y_init =  (c.height / 2) + zone1_shift + (60 * outcome.zone_idx) + 30 + (outcome_height / 2);
          let x = (c.width / 2) + outcome.vx * outcome.age;
          let y = y_init + outcome.vy * outcome.age + outcome.weight * outcome.age * outcome.weight * outcome.age;
          ctx.beginPath();
          ctx.font = "bold 45px Arial";
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          ctx.fillStyle = `rgb(${rgb[outcome.zone_idx][0]}, ${rgb[outcome.zone_idx][1]}, ${rgb[outcome.zone_idx][2]})`;
          ctx.fillText(`+${outcome.points}`, x, y);    
          ctx.strokeText(`+${outcome.points}`, x, y);    
          outcome.age = outcome.age + (2 * fpsAdjust);
        });
      };

      // track location of ball
      Events.on(engine, "beforeUpdate", function() { 
        if (ball.position.y > c.height || ball.position.y < 0) {
          World.remove(engine.world, ball);
          ball = Bodies.circle(c.width / 2, 280, trial.ball_size);
          World.add(engine.world, ball);
          game.data.glitch.push(true);
        };
        force =  Math.max(trial.target_force, max_force + (ball.position.y - bottom_pos)*trial.slope) * (.5 / fpsAdjust);
        game.data.ball_locs.push(ball.position.y);
      });

      // keydown function
      document.body.onkeydown = function(e) {
        if (e.key == " " || e.code == "Space" || e.keyCode == 32) {

          // time of each press in seconds from first press
          if (game.data.nPress == 0) {
            game.data.start_time = performance.now();
          } else {
            let press_time = (performance.now() - game.data.start_time) / 1000;
            game.data.tPress.push(press_time);
          };

          game.data.nPress++;

          // instantaneous press rate
          if (game.data.tPress.length > 1) {
            game.data.press_rate.push(1 / (game.data.tPress[game.data.tPress.length - 1] - game.data.tPress[game.data.tPress.length - 2]));
          }

          // press outcome (if button pressed in zone)
          for (let z = 0; z < zone_values.length; z++) {
            if (ball.position.y > (c.height / 2) + zone1_shift + (z * zone_size) & ball.position.y < (c.height / 2) + zone1_shift + ((z + 1) * zone_size)) {
              color_weight[z] = 1;
              game.data.score.push(zone_values[z]);
              game.data.total_score = game.data.total_score + zone_values[z];
              outcomes.push(new MakeOutcome(z, zone_values[z]));
            };
          };

          // press outcome (if button not pressed in a zone)
          if (color_weight.reduce((partialSum, a) => partialSum + a, 0) == 2) {
            game.data.score.push(0);
          };

          // reset zone color after 100ms
          setTimeout(() => { 
            color_weight = [.5, .5, .5, .5];
          }, 100);

          // apply force to ball
          Body.applyForce( ball, {x: ball.position.x, y: ball.position.y}, {x: 0, y: -force});
   
          console.log(game.data.press_rate.reduce((partialSum, a) => partialSum + a, 0) / game.data.press_rate.length);
        };
      };

      function drawScore() {
        ctx.fillStyle = '#D3D3D3';
        let score_width = ctx.measureText(`Points: ${game.data.total_score}`).width;
        ctx.fillText(`Points: ${game.data.total_score}`, (c.width / 2) - (score_width / 2), 80);   
      };

      function drawBodies() {
        let bodies = Composite.allBodies(engine.world)
        for (var i = 0; i < bodies.length; i += 1) {
          ctx.beginPath();
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'white';
          let body = bodies[i];
          if(body.label != 'Circle Body') {
            ctx.fillStyle = '#999';
            ctx.strokeStyle = '#999';
          };   
          var vertices = bodies[i].vertices;
          ctx.moveTo(vertices[0].x, vertices[0].y);
          for (var j = 1; j < vertices.length; j += 1) {
              ctx.lineTo(vertices[j].x, vertices[j].y);
          };
          ctx.lineTo(vertices[0].x, vertices[0].y);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.stroke();
        };
      };

      function drawZones() {
        for (let z = 0; z < zone_values.length; z++) {
          ctx.fillStyle = `rgb(${rgb[z][0]*color_weight[z]}, ${rgb[z][1]*color_weight[z]}, ${rgb[z][2]*color_weight[z]})`
          ctx.fillRect(0, (c.height / 2) + zone1_shift + (zone_size * z), c.width, zone_size);
          ctx.fillStyle = 'black';
          let text_width = ctx.measureText(`${zone_values[z]}`).width;
          ctx.fillText(`${zone_values[z]}`, (c.width / 2) - (text_width / 2), (c.height / 2) + zone1_shift + (zone_size * z) + (zone_size / 2) + (outcome_height / 2));    
        };        
      };

      function drawCircle() {
        if (ball.position.y > (c.height / 2) - 80 & ball.position.y < (c.height / 2) + 80) {
          ctx.strokeStyle = 'red';
        } else {
          ctx.strokeStyle = 'white';
        };
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(c.width / 2, c.height / 2, 80, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1;
      };

      (function render_func() {
        const req = window.requestAnimationFrame(render_func);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = "30px Arial";

        drawZones();
        drawScore();
        showOutcome();
        drawBodies();

        Engine.update(engine, (1000/60)*fpsAdjust);

      })();

    };

    return game;

  }());

 /*
  *
  *  David's text functions
  *
  */

  obj.consentForm = function({basePay}) {
    const html = [`<div class='parent' style='height: 1000px; width: 1000px'>
        <p><b>Adult Consent for Participation in a Research Project<br>
        200 FR 2 (2017-1)</b><br>
        Study Title: Choices, decisions, and pursuits<br>
        Investigator: Paul Stillman<br>
        HSC #: 2000023892</p>

        <p><b>Purpose:</b><br>
        You are invited to participate in a research study designed to examine judgment and decision-making.</p>

        <p><b>Procedures:</b><br>
        If you agree to take part, your participation in this study will involve answering a series of questions as well as making choices between different options that will be presented to you as part of study activities. We anticipate that your involvement will require 12-15 minutes.</p>

        <p><b>Compensation:</b><br>
        You'll receive $${basePay} in exchange for your participation.</p>

        <p><b>Risks and Benefits:</b><br>
        There are no known or anticipated risks associated with this study. Although this study will not benefit you personally, we hope that our results will add to the knowledge about judgment and decision-making.</p>

        <p><b>Confidentiality:</b><br>
        All of your responses will be anonymous.  Only the researchers involved in this study and those responsible for research oversight will have access to any information that could identify you/that you provide. The researcher will not know your name, and no identifying information will be connected to your survey answers in any way. The survey is therefore anonymous. However, your account is associated with an mTurk number that the researcher has to be able to see in order to pay you, and in some cases these numbers are associated with public profiles which could, in theory, be searched. For this reason, though the researcher will not be looking at anyone’s public profiles, the fact of your participation in the research (as opposed to your actual survey responses) is technically considered “confidential” rather than truly anonymous.”</p>

        <p><b>Voluntary Participation:</b><br>
        Your participation in this study is voluntary. You are free to decline to participate, to end your participation at any time for any reason, or to refuse to answer any individual question without penalty.</p>

        <p><b>Questions:</b><br>
        If you have any questions about this study, you may contact the principal investigator, Paul Stillman, (paul.stillman@yale.edu). If you would like to talk with someone other than the researchers to discuss problems or concerns, to discuss situations in the event that a member of the research team is not available, or to discuss your rights as a research participant, you may contact the Yale University Human Subjects Committee, 203-785-4688, human.subjects@yale.edu. Additional information is available at http://your.yale.edu/research-support/human-research/research-participants</p>

        <p>Would you like to continue to the study? Press the "Next" button to indicate that you consent to participate in the study.</p>`]
    return html;
  };

  obj.intro_tileGame = function({basePay}) {
      const html = [`<div class='parent'>
          <p>Thank you for playing Hole in One!</p>
          <p>Next, you'll play a different game called the Tile Game.</p>
          <p>When you are ready, please continue.</p></div>`];
      return html;
  };

  obj.prePractice_tileGame = function({gameType, val, span, color, hex, roundLength}) {

      let html;

      if (gameType == 'invStrk') {
          html = [`<div class='parent'>
              <p>The Tile Game is played in multiple rounds.</p>
              </div>`,

              `<div class='parent'>
              <p>In each round, you'll have up to ${roundLength} attempts to activate the grey tile below.</br>
              Your goal is to activate the tile in as few attempts as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then, you'll see how many attempts it took you to activate the tile.</br>
              For instance, if you were to activate the tile on your 1st attempt, you'd get the following message:</p>
              <p style='font-size:30pt; margin-bottom:55px'>You won on attempt:</p><p style='font-size:60pt; margin:0px'>#1</p>
              </div>`,

              `<div class='parent'>
              <p>If you miss the tile, you'll see how many attempts you've made over the course of the current round.</br>
              For example, if you were miss on your 1st attempt, you'd see the following message:</p>
              <p style='font-size:30pt; margin-bottom:55px'>Attempts this round:</p><p style='font-size:60pt; margin:0px'>1</p>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice session.<br>
              Once you proceed, the practice session will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];        
      };

      if (gameType == 'strk') {
          html = [`<div class='parent'>
              <p>In the Tile Game, your goal is to build winning streaks.</br>
              A winning streak is a series of consecutive successes.</p>
              </div>`,

              `<div class='parent'>
              <p>To build winning streaks, you'll try to activate the gray tile below.</br>
              Activating the tile multiple times in a row creates a winning streak.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then you'll see how many times you've activated the tile in a row.</br>
              For instance, if you activate the tile 3 times in a row, you'll get the following message:</p>
              <p style='font-size:30pt; margin-bottom:55px'>Current streak:</p><p style='font-size:60pt; margin:0px'>3</p>
              </div>`,

              `<div class='parent'>
              <p>If you miss the tile, your streak will end and you'll see how long it was.
              <p style='font-size:30pt; margin-bottom:55px'>Your streak was:</p><p style='font-size:60pt; margin:0px'>3</p>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice session.<br>
              Once you proceed, the practice session will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];
      };

      if (gameType == '1inN') {
          html = [`<div class='parent'>
              <p>The Tile Game is played in multiple rounds.</p>
              </div>`,

              `<div class='parent'>
              <p>In each round, you'll have ${roundLength} chances to activate the grey tile below.</br>
              Your goal is to win each round by activating the tile before your ${roundLength} chances are up.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile before your ${roundLength} chances are up, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then, you'll see a message indicating that you won the round.<br>
              For instance, if you were to win Round 5, you'd see the following message:</p>
              <p style='font-size:50pt; margin-bottom:70px'>You won Round 5</p><p style='font-size:30pt; margin:0px'>Round 6 will now begin</p>
              </div>`,

              `<div class='parent'>
              <p>If you fail to activate the tile before the end of the round, you'll see a message indicating that you lost the round.<br>
              For instance, if you were to lose Round 5, you'd see the following message:</p>
              <p style='font-size:50pt; margin-bottom:70px'>You lost Round 5</p><p style='font-size:30pt; margin:0px'>Round 6 will now begin</p>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice session.<br>
              Once you proceed, the practice session will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];
      };

      if (gameType == 'bern') {
          html = [`<div class='parent'>
              <p>The Tile Game is played in multiple rounds.</p>
              </div>`,

              `<div class='parent'>
              <p>In each round, you'll have one chance to activate the grey tile below.</br>
              Your goal is to win each round by activating the tile.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then, you'll see a message indicating that you won the round.<br>
              For instance, if you were to win Round 5, you'd see the following message:</p>
              <p style='font-size:50pt; margin-bottom:70px'>You won Round 5</p><p style='font-size:30pt; margin:0px'>Round 6 will now begin</p>
              </div>`,

              `<div class='parent'>
              <p>If you fail to activate the tile, you'll see a message indicating that you lost the round.<br>
              For instance, if you were to lose Round 5, you'd see the following message:</p>
              <p style='font-size:50pt; margin-bottom:70px'>You lost Round 5</p><p style='font-size:30pt; margin:0px'>Round 6 will now begin</p>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice session.<br>
              Once you proceed, the practice session will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];
      };

      return html;
  };

  obj.practiceComplete_tileGame = function() {
      const html = [`<div class='parent'>
        <p>Practice is now complete.<br>
        Next, you'll complete the full version of the Tile Game.</p></div>`];
      return html;
  };

  obj.postPractice_tileGame = function({gameType, pM, pM_practice, val, plural, nTrials, roundLength}) {

      let html;

      let easierOrHarder = pM > pM_practice ? 'easier' : 'more difficult';

      if (gameType == 'invStrk') {
        html = [`<div class='parent'>
            <p>The full version of the Tile Game differs from the practice version in three ways.</p>
            </div>`,

            `<div class='parent'>
            <p>First, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
            Specifically, most players activate the tile <strong>${pM*100}%</strong> of the time.</p>
            </div>`,

            `<div class='parent'>
            <p>Second, the full version of the Tile Game will be longer than the practice version.<br>
            Specifically, the tile will appear ${nTrials} times.</p>
            </div>`,              

            `<div class='parent'>
            <p>Third, in the full version of the Tile Game you'll be rewarded with a<br>
            fireworks display each time you activate the tile.</p>
            <p>The amount of fireworks you get depends on the number of attempts you take the activate the tile.<br>
            The fewer attempts you take to activate the tile, the more fireworks you'll get!</p>
            </div>`];
      };

      if (gameType == 'strk') {
        html = [`<div class='parent'>
            <p>The full version of the Tile Game differs from the practice version in three ways.</p>
            </div>`,

            `<div class='parent'>
            <p>First, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
            Specifically, most players activate the tile <strong>${pM*100}%</strong> of the time.</p>
            </div>`,

            `<div class='parent'>
            <p>Second, the full version of the Tile Game will be longer than the practice version.<br>
            Specifically, the tile will appear ${nTrials} times.</p>
            </div>`,     

            `<div class='parent'>
            <p>Third, in the full version of the Tile Game you'll be rewarded with a<br>
            fireworks display each time you end a streak.</p>
            <p>The amount of fireworks you get depends on the length of your streak.<br>
            The longer your streak, the more fireworks you'll get when it ends!</p>
            </div>`];
      };

      if (gameType == '1inN') {

        const pWin = Math.floor(100 * (1 - (1 - pM)**roundLength));

        html = [`<div class='parent'>
            <p>The full version of the Tile Game differs from the practice version in three ways.</p>
            </div>`,

            `<div class='parent'>
            <p>First, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
            Specifically, most players win <strong>${pWin}%</strong> of their rounds.</p>
            </div>`,

            `<div class='parent'>
            <p>Second, the full version of the Tile Game will be longer than the practice version.<br>
            Specifically, the tile will appear ${nTrials} times.</p>
            </div>`,     

            `<div class='parent'>
            <p>Third, in the full version of the Tile Game you'll be rewarded with a<br>
            fireworks display each time you win a round!</p>
            </div>`];
      };

      if (gameType == 'bern') {
        html = [`<div class='parent'>
            <p>The full version of the Tile Game differs from the practice version in three ways.</p>
            </div>`,

            `<div class='parent'>
            <p>First, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
            Specifically, most players win <strong>${pM*100}%</strong> of their rounds.</p>
            </div>`,

            `<div class='parent'>
            <p>Second, the full version of the Tile Game will be longer than the practice version.<br>
            Specifically, the tile will appear ${nTrials} times.</p>
            </div>`,     

            `<div class='parent'>
            <p>Third, in the full version of the Tile Game you'll be rewarded with a<br>
            fireworks display each time you win a round!</p>
            </div>`];
      };

      return html;
  };

  obj.preTask_tileGame = function() {
      const html = [`<div class='parent'>
          <p>You are now ready to play the Tile Game.</p>
          <p>Once you proceed, the Tile Game will start, so get ready to press your SPACEBAR.</p>
          <p>Continue to begin.</p>
          </div>`];
      return html;
  };

  obj.intro_raceForPrize = function({firstTaskName, effort, carSize, attnChkVars, correctAnswers}) {

    // html chunks for instructions
    const trackImg = `<div style="position:relative; left: 0; right: 0; width: 500px; height: 250px; margin:auto; background: #D3D3D3">
      <div style="position:absolute; top:50px; left:50px">
          <img src="img/myCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; top:${250-carSize[0]-50}px; left:50px">
          <img src="img/theirCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; left:450px; height: 100%; width:5px; background:black">
      </div></div>`;

    const trackImg_pressLeft = `<div style="position:relative; left: 0; right: 0; width: 500px; height: 250px; margin:auto; background: #D3D3D3">
      <div style="position:absolute; top:50px; left:50px">
          <img src="img/myCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; top:${250-carSize[0]-50}px; left:50px">
          <img src="img/theirCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; left:450px; height: 100%; width:5px; background:black">
      </div>
      <div style="position:absolute; top:75px; left:-80px">
        <p id="left-button" style="height:100px; width:50px; background:#b0fc38; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">E</p>
      </div>
      <div style="position:absolute; top:75px; width: 50px; left:530px">
        <p id="right-button" style="height:100px; width:50px; background:white; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">I</p>
      </div></div>`;

    const trackImg_pressRight = `<div style="position:relative; left: 0; right: 0; width: 500px; height: 250px; margin:auto; background: #D3D3D3">
      <div style="position:absolute; top:50px; left:50px">
          <img src="img/myCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; top:${250-carSize[0]-50}px; left:50px">
          <img src="img/theirCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; left:450px; height: 100%; width:5px; background:black">
      </div>
      <div style="position:absolute; top:75px; left:-80px">
        <p id="left-button" style="height:100px; width:50px; background:white; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">E</p>
      </div>
      <div style="position:absolute; top:75px; width: 50px; left:530px">
        <p id="right-button" style="height:100px; width:50px; background:#b0fc38; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">I</p>
      </div></div>`;

    const trackImg_pressNeither = `<div style="position:relative; left: 0; right: 0; width: 500px; height: 250px; margin:auto; background: #D3D3D3">
      <div style="position:absolute; top:50px; left:50px">
          <img src="img/myCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; top:${250-carSize[0]-50}px; left:50px">
          <img src="img/theirCar.png" style="height:${carSize[0]}px; width:${carSize[1]}px"></img>
      </div>
      <div style="position:absolute; left:450px; height: 100%; width:5px; background:black">
      </div>
      <div style="position:absolute; top:75px; left:-80px">
        <p id="left-button" style="height:100px; width:50px; background:white; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">E</p>
      </div>
      <div style="position:absolute; top:75px; width: 50px; left:530px">
        <p id="right-button" style="height:100px; width:50px; background:white; border-style:solid; border-width:3px; border-color:black; display:table-cell; vertical-align:middle; margin-left:auto; font-size: 40px; margin-right:auto">I</p>
      </div></div>`;

    let effortMsg, practiceMsg, prompt_attnChk1;

    if (effort == 'high') {
      effortMsg = [`<div class='parent'>
        <p>To accelerate your car, you must press your E-key, then your I-key, one after the other.<br>
        You'll need to press your keys as fast as possible in order to reach top speed.</p>
        ${trackImg}              
        </div>`,

        `<div class='parent'>
        <p>On the sides of your screen,<br>
        you'll see cues that tell you which key to press.</p>
        ${trackImg_pressNeither}              
        </div>`];

      practiceMsg = [`<div class='parent'>
        <p>To get a feel for Race for the Prize, you'll complete two practice runs.</p>
        <p>In the practice runs, you will not race against an opponent.<br>
        You will simply practice accelerating by pressing the appropriate keys as fast as possible.</p>
        <p>Continue to begin practicing.</p>
        </div>`];

      prompt_attnChk1 = `In order to reach top speed, I'll have to press my keys as fast as possible.`;
    };

    if (effort == 'low') {
      effortMsg = [`<div class='parent'>
        <p>To accelerate your car, you must press your E-key, then your I-key, one after the other.<br>
        You'll need to press each key at just the right moment in order to reach top speed.</p>
        ${trackImg}              
        </div>`,

        `<div class='parent'>
        <p>On the sides of your screen,<br>
        you'll see cues that tell you when to press each key.</p>
        ${trackImg_pressNeither}              
        </div>`];

      practiceMsg = [`<div class='parent'>
        <p>To get a feel for Race for the Prize, you'll complete two practice runs.</p>
        <p>In the practice runs, you will not race against an opponent.<br>
        You will simply practice accelerating by pressing the appropriate keys as just the right moment.</p>
        <p>Continue to begin practicing.</p>
        </div>`];

      prompt_attnChk1 = `In order to reach top speed, I'll have to press my keys at just the right moment.`;

    };

    // instructions
    const html = [`<div class='parent'>
      <p>Race for the Prize is played in multiple rounds.</p>
      </div>`,

      `<div class='parent'>
      <p>In each round, you'll race your car against an opponent.<br>
      You'll be driving the red car. Your opponent will be driving the blue car.</p>
      ${trackImg}
      </div>`,

      `<div class='parent'>
      <p>Each time you beat your opponent across the finish line, your victory will be celebrated with a fireworks display!</br>
      For each race, your goal is to win a fireworks display by beating your opponent.</p>
      ${trackImg}
      </div>`,

      `<div class='parent'>
      <p>In Race for the Prize, players typically win about ${correctAnswers[1]} of their races.</p>
      <p>To maximize <em>your</em> chances of winning, pay close attention to the upcoming information!</p>
      </div>`,

      `<div class='parent'>
      <p>To beat your opponent, you'll need to accelerate your car.<br>
      &nbsp</p>
      ${trackImg}
      </div>`,

      ...effortMsg,

      `<div class='parent'>
      <p>When you need to press your E-key,<br>
      the cue on the left will light up like this:</p>
      ${trackImg_pressLeft}
      </div>`,

      `<div class='parent'>
      <p>When you need to press your I-key,<br>
      the cue on the right will light up like this:</p>
      ${trackImg_pressRight}
      </div>`];

    // attention check loop

    const inst = {
      type: jsPsychInstructions,
      pages: html,
      show_clickable_nav: true,
    };

    const prePractice = {
      type: jsPsychInstructions,
      pages: practiceMsg,
      show_clickable_nav: true,
    };

    const preInstructions = {
      type: jsPsychInstructions,
      pages: [`<div class='parent'>
      <p>Thank you for playing ${firstTaskName}!</p>
      <p>Next, you'll play a different game called Race for the Prize.</p>
      <p>When you're ready, please continue.</p></div>`],
      show_clickable_nav: true,
    }

    const errorMessage = {
      type: jsPsychInstructions,
      pages: [`<div class='parent'><p>You provided the wrong answer.<br>To make sure you understand the game, please continue to re-read the instructions.</p></div>`],
      show_clickable_nav: true,
    };

    const attnChk = {
      type: jsPsychSurveyMultiChoice,
      preamble: `<div style="font-size:16px"><p>To make sure you understand Race for the Prize, please indicate whether the following statement is true or false:</p></div>`,
      questions: [
        {
          prompt: prompt_attnChk1, 
          name: "attnChk1", 
          options: ["True", "False"],
        },
        {
          prompt: `What percentage of races do most players win?`, 
          name: "attnChk2", 
          options: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
        },
      ],
      scale_width: 500,
      on_finish: (data) => {
          const totalErrors = obj.getTotalErrors(data, correctAnswers);
          data.totalErrors = totalErrors;
      },
    };

    let showIntro = true;

    const conditionalNode1 = {
      timeline: [preInstructions],
      conditional_function: () => {
        return showIntro;
      },
    };

    const conditionalNode2 = {
      timeline: [errorMessage],
      conditional_function: () => {
        const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
        if (fail) { showIntro = false };
        return fail;
      },
    };

    const instLoop = {
      timeline: [conditionalNode1, inst, attnChk, conditionalNode2],
      loop_function: () => {
        const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
        return fail;
      },
    };

    this.timeline = [instLoop, prePractice];

  };

  obj.postPractice_raceForPrize = function({firstTaskName, effort, carSize, attnChkVars, correctAnswers}) {

    const html = [`<div class='parent'>
      <p>Practice is now complete. Next, you'll race against your opponent!</p>
      <p>Remember: Your goal for each race is to win a fireworks display by beating your opponent.</p>
      <p>Continue when you're ready to race.</p></div>`];

    this.type = jsPsychInstructions;
    this.pages = html;
    this.show_clickable_nav = true;

  };

  return obj

}());