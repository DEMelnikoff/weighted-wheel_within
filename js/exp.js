

const exp = (function() {


    let p = {};

    // define each wedge
    const wedges = {
        one: {color:"#003b5c", label:"1"},
        three: {color:"#0057e5", label:"3"},
        four: {color:"#41b6e6", label:"4"},
        four_blank: {color:"#41b6e6", label:""},
        five: {color:"#3ea908", label:"5"},
        six: {color:"#f0cc2e", label:"6"},
        seven: {color:"#ec894d", label:"7"},
        eight: {color:"#e50000", label:"8"},
        ten: {color:"#e641b6", label:"10"},
    };

    const highMI_wheel = [ wedges.one, wedges.three, wedges.four, wedges.five, wedges.six, wedges.seven, wedges.eight, wedges.ten ];
    const lowMI_wheel1 = [ wedges.four_blank, wedges.four, wedges.four_blank, wedges.ten ];
    const lowMI_wheel2 = [ wedges.three, wedges.eight ];

    const wheelDraw = Math.floor(Math.random() * 2);
    const miDraw = Math.floor(Math.random() * 2);

    let settings = {
        nSpins: 5,
        effortOrder: jsPsych.randomization.repeat(['highEffort', 'lowEffort'], 1),
        miOrder: [['highMI', 'lowMI'], ['lowMI', 'highMI']][miDraw],
        numOutcomes: [['8', '2'], ['2', '8']][miDraw],
        lowMI_wheel: [lowMI_wheel1, lowMI_wheel1][wheelDraw],
        highMI_wheel: highMI_wheel,
    };

    let text = {};

    if (settings.effortOrder[0] == 'highEffort') {
        text.weight_r1 = "<strong>heavy</strong>";
        text.speed1_r1 = "<strong>as fast as possible</strong>";
        text.speed2_r1 = "If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.";
        text.weight_r2 = "<strong>light-weight</strong>";
        text.speed1_r2 = "<strong>at a moderate pace</strong>";
        text.speed2_r2 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
    } else if (settings.effortOrder[0] == 'lowEffort') {
        text.weight_r1 = "<strong>light-weight</strong>";
        text.speed1_r1 = "<strong>at a moderate pace</strong>";
        text.speed2_r1 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
        text.weight_r2 = "<strong>heavy</strong>";
        text.speed1_r2 = "<strong> as fast as possible</strong>";
        text.speed2_r2 = "If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.";
    };

    jsPsych.data.addProperties({
        spins_per_wheel: settings.nSpins,
        effort_order1: settings.effortOrder[0],
        effort_order2: settings.effortOrder[1],
        mi_order1: settings.miOrder[0],
        mi_order2: settings.miOrder[1],
        counterbalance: wheelDraw,
    });


   /*
    *
    *   INSTRUCTIONS
    *
    */

    function MakePracticeWheel(weight) {

        const speedText = (weight == 'heavy') ? "<strong> as fast as possible</strong>" : "<strong>at a moderate pace</strong>";
        const targetPressTime = (weight == 'heavy') ? [0, .2] : [.2, .6];
        const weightText = (weight == 'heavy') ? 'heavy' : 'light-weight';

        const practiceWheel_1 = {
            type: jsPsychCanvasButtonResponse,
            prompt: `<div class='spin-instructions'>
            <p>This wheel is <b>${weightText}</b>. To spin it, repeatedly tap your right arrow ${speedText} to build momentum.
            Once you build enough momentum, a yellow ring will appear around the wheel,
            which means that the wheel is ready to spin. To spin the wheel, stop tapping your right arrow.</p>
            <p>Practice spinning <b>${weightText}</b> wheels by tapping your right arrow ${speedText} until a yellow ring appears. Then, stop tapping to spin the wheel.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [ wedges.three, wedges.four, wedges.seven, wedges.eight  ], targetPressTime, [0], 1, scoreTracker_practice);
            },
            nSpins: 1,
            initialScore: function() {
                return scoreTracker_practice
            },
            show_scoreboard: false,
            canvas_size: [500, 500],
            post_trial_gap: 500,
            on_finish: function(data) {
                scoreTracker_practice = data.score
            }
        };

        const practiceWheel_2 = {
            type: jsPsychCanvasButtonResponse,
            prompt: `<div class='spin-instructions'>
            <p>Great job! Now, spin the <b>${weightText}</b> wheel a few more time to get the hang of it. Remember: To spin <b>${weightText}</b> wheels, tap your right arrow ${speedText}. 
            Once a yellow ring appears, stop tapping to spin the wheel.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [ wedges.three, wedges.four, wedges.seven, wedges.eight ], targetPressTime, [0, 0, 0], 3, scoreTracker_practice);
            },
            nSpins: 2,
            initialScore: function() {
                return scoreTracker_practice
            },
            show_scoreboard: false,
            canvas_size: [500, 500],
            on_finish: function(data) {
                scoreTracker_practice = data.score
            }
        };

        this.timeline = [practiceWheel_1, practiceWheel_2];
    };

    function MakeAttnChk(settings, round) {

        let correctAnswers = [];

        if (settings.effortOrder[0] == 'highEffort' && round <= 2 || settings.effortOrder[1] == 'highEffort' && round >= 3) {
            correctAnswers.push(`Heavy`);
        } else if (settings.effortOrder[0] == 'lowEffort' && round <= 2 || settings.effortOrder[1] == 'lowEffort' && round >= 3) {
            correctAnswers.push(`Light-weight`);
        };

        correctAnswers.push(settings.numOutcomes[1 - round % 2]);

        const attnChk = {
           type: jsPsychSurveyMultiChoice,
            preamble: `<div class='parent' style='text-align: left; color: rgb(109, 112, 114)'>
                <p><strong>Please answer the following questions about Round ${round} of Spin the Wheel.</strong></p>
                </div>`,
            questions: [
                {
                    prompt: `<div style='color: rgb(109, 112, 114)'>In Round ${round}, is the wheel heavy or light-weight?</div>`, 
                    name: `attnChk1`, 
                    options: [`Heavy`, `Light-weight`],
                },
                {
                    prompt: `<div style='color: rgb(109, 112, 114)'>In Round ${round}, how many unique outcomes are on the wheel?</div>`, 
                    name: `attnChk2`, 
                    options: [`2`, `8`],
                },
            ],
            scale_width: 500,
            on_finish: (data) => {
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            },
        };

        const errorMessage = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>You provided the wrong answer. Please continue to re-read the instructions.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const conditionalNode = {
          timeline: [errorMessage],
          conditional_function: () => {
            const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
            return fail;
          },
        };


        const aboutRound1 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p><b>Practice is now complete!</b></p>
                        <p>Continue to learn more about Spin the Wheel.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In Spin the Wheel, the number of points you win for each spin depends on where the wheel lands. For example, if the wheel lands on a 3, you'll earn 3 points.</p>
                        <p>Throughout the game, your total number of points will be displayed at the top of the screen.</p>
                        <p>Remember: Your goal is to win as many points as possible.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In each round of Spin the Wheel, you'll spin the wheel <b>5 times</b>.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In the first round of Spin the Wheel, you'll be spinning a ${text.weight_r1} wheel. 
                        Accordingly, in Round 1, you'll need to tap your right arrow ${text.speed1_r1}.</p>
                        <p>In addition, the wheel in Round 1 will have <b>${settings.numOutcomes[0]} unique outcomes</b>.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const aboutRound2 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>Round 1 of Spin the Wheel is now complete! Next, you'll play Round 2.</p>
                        <p>In Round 2, you'll spin another ${text.weight_r1} wheel.
                        Accordingly, in Round 2, you'll need to tap your right arrow ${text.speed1_r1}.</p>
                        <p>In addition, the wheel in Round 2 will have <b>${settings.numOutcomes[1]} unique outcomes</b>.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const aboutRound3 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>Round 2 of Spin the Wheel is now complete! Next, you'll play Round 3.</p>
                        <p>In Round 3, you'll be spinning a ${text.weight_r2} wheel.
                        Accordingly, in Round 3, you'll need to tap your right arrow ${text.speed1_r2}.</p>
                        <p>In addition, the wheel in Round 3 will have <b>${settings.numOutcomes[0]} unique outcomes</b>.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const aboutRound4 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>Round 3 of Spin the Wheel is now complete! Next, you'll play Round 4.</p>
                        <p>In Round 4, you'll be spinning another ${text.weight_r2} wheel.
                        Accordingly, in Round 4, you'll need to tap your right arrow ${text.speed1_r2}.</p>
                        <p>In addition, the wheel in Round 4 will have <b>${settings.numOutcomes[1]} unique outcomes</b>.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const aboutRound = (round == 1) ? aboutRound1 : (round == 2) ? aboutRound2 : (round == 3) ? aboutRound3 : aboutRound4;

        const instLoop = {
            timeline: [aboutRound, attnChk, conditionalNode],
            loop_function: () => {
                const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            },
        };

        const readyToPlay = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>You're now ready to play Round ${round} of Spin the Wheel.</p>
                        <p>To play Round ${round}, continue to the next screen.</p>`
                    },
                ],

            ],
            button_label_finish: 'Next',
        };

        this.timeline = [instLoop, readyToPlay];
    };

    p.consent = {
        type: jsPsychExternalHtml,
        url: "./html/consent.html",
        cont_btn: "advance",
    };

    const howToSpin_heavy = {
        type: jsPsychSurvey,
        pages: [
            [
                {   
                    type:'html',
                    prompt:`<p><b>What makes some activities more immersive and engaging than others?</b></p>
                    <p>We're interested in why people feel completely immersed in some activities (such as engrossing video games),
                    but struggle to focus on other activities (like tedious chores).</p>
                    <p>To help us, you'll play four rounds of a game called <b>Spin the Wheel</b>.</p>
                    <p>When you're ready to learn about Spin the Wheel, continue to the next page.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Spin the Wheel, you'll win points by spinning various prize wheels.</p>
                    <p>Your goal is to win as many points as possible.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Spin the Wheel, there are two different types of wheels: <b>heavy</b> wheels (which are difficult to spin) and <b>light-weight</b> wheels (which are easy to spin).</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>To spin a heavy wheel, you must build momentum by tapping the right arrow on your keyboard <b>as fast as possible</b>. 
                    If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.</p>
                    <p>Next, you'll practice spinning heavy wheels. Then, you'll learn to spin light-weight wheels.</p>`
                },
            ],
        ],
        button_label_finish: 'Next'
    };

    const howToSpin_light = {
        type: jsPsychSurvey,
        pages: [
            [
                {   
                    type:'html',
                    prompt:`<p>Great job!</p>
                    <p>Now that you know how to spin heavy wheels, you'll learn how to spin light-weight wheels.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>To spin a light-weight wheel, you must build momentum by tapping the right arrow on your keyboard <b>at a moderate pace</b>. 
                    If you tap your right arrow either too fast or too slow, the wheel will not build enough momentum to spin.</p>
                    <p>Next, you'll practice spinning light-weight wheels.</p>`
                },
            ],
        ],
        button_label_finish: 'Next'
    };

    const practiceWheel_heavy = new MakePracticeWheel('heavy');

    const practiceWheel_light = new MakePracticeWheel('light');

    const attnChk1 = new MakeAttnChk(settings, 1);
    const attnChk2 = new MakeAttnChk(settings, 2);
    const attnChk3 = new MakeAttnChk(settings, 3);
    const attnChk4 = new MakeAttnChk(settings, 4);

    
   /*
    *
    *   TASK
    *
    */


    let scoreTracker_practice = 0; // track current score
    let scoreTracker = 0; // track current score

    const MakeSpinLoop = function(round) {

        const effort_level = [settings.effortOrder[0], settings.effortOrder[0], settings.effortOrder[1], settings.effortOrder[1]][round - 1];
        const mi_level = [settings.miOrder[0], settings.miOrder[1], settings.miOrder[0], settings.miOrder[1]][round - 1];

        // set sectors, ev, sd, and mi
        let sectors, ev, sd, mi, targetPressTime;
        if (mi_level == 'highMI') {
            sectors = settings.highMI_wheel;
            ev = 5.5;
            sd = 3.5;
            mi = 2;
        } else if (mi_level == 'lowMI') {
            sectors = settings.lowMI_wheel;
            ev = 5.5;
            sd = 3.5;
            mi = .81;
        };

        // set target time between button presses
        if (effort_level == 'highEffort') {
            targetPressTime = [0, .2];
        } else if (effort_level == 'lowEffort') {
            targetPressTime = [.2, .6];
        };

        const wheel = {
            type: jsPsychCanvasButtonResponse,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, jsPsych.timelineVariable('sectors'), jsPsych.timelineVariable('targetPressTime'), jsPsych.timelineVariable('guaranteedOutcome'), 5, scoreTracker);
            },
            nSpins: 5,
            initialScore: function() {
                return scoreTracker;
            },
            canvas_size: [500, 500],
            show_scoreboard: true,
            data: {round: jsPsych.timelineVariable('round'), effort_condition: effort_level, mi_condition: mi_level, targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')},
            on_finish: function(data) {
                scoreTracker = data.score;
            },
        };

        this.timeline_variables = [{round: round, sectors: sectors, mi: mi, ev: ev, sd: sd, targetPressTime: targetPressTime, guaranteedOutcome: 0}];
        this.timeline = [wheel];
    }



   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    var zeroToExtremely = ["0<br>Not at all", '1', '2', '3', '4', '5', '6', '7', "8<br>Extremely"];
    var zeroToALot = ['0<br>Not at all', '1', '2', '3', '4', '5', '6', '7', '8<br>A lot'];
    var noneToALot = ['0<br>None', '1', '2', '3', '4', '5', '6', '7', '8<br>A lot'];
    var scbScale = ['-4<br>Way too easy', '-3', '-2', '-1', '0<br>Neither too easy nor too difficult', '1', '2', '3', '4<br>Way too difficult'];

    // constructor functions
    function MakeFlowQs(round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>
        <p>Thank you for completing Round ${round} of Spin the Wheel!</p>
        <p>In Round ${round}, how <b>immersive</b> and <b>engaging</b> was the wheel that you spun?</p>
        <p>Report how <b>immersive</b> and <b>engaging</b> the wheel was by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>immersive</b> was the wheel in Round ${round}?</div>`,
                name: `immersive`,
                labels: zeroToExtremely,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>engaging</b> was the wheel in Round ${round}?</div>`,
                name: `engaging`,
                labels: zeroToExtremely,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>engrossing</b> was the wheel in Round ${round}?</div>`,
                name: `engrossing`,
                labels: zeroToExtremely,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>boring</b> was the wheel in Round ${round}?</div>`,
                name: `boring`,
                labels: zeroToExtremely,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 600;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEnjoyQs(round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Below are a few more questions about the wheel in Round ${round}.</p>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <b>like</b> the wheel in Round ${round}?</div>`,
                name: `like`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <b>dislike</b> the wheel in Round ${round}?</div>`,
                name: `dislike`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 600;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEffortQs(round) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>In Round ${round}, how much effort did it feel like you were exerting?</div>`,
                name: `effort`,
                labels: noneToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 600;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    function MakeScbQs(round) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>Was Round ${round} too easy, too difficult, or somewhere in between?</div>`,
                name: `scb`,
                labels: scbScale,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 600;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    const freeResponse = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'multi-choice',
                    prompt: `If you had to choose, which wheel was more immersive and engaging?`,
                    options: ['The wheel from Round 1', 'The wheel from Round 2'],
                    name: 'forcedChoice',
                },
                {
                    type: 'text',
                    prompt: `In the space below, please explain your answer in as much detail as possible.`,
                    textbox_rows: 7,
                    name: 'explanation',
                },
            ],
        ],
        button_label_finish: 'Next',
        on_finish: (data) => {
            dmPsych.saveSurveyData(data); 
        },
    };

    // timeline: first wheel
    p.practice = {
        timeline: [howToSpin_heavy, practiceWheel_heavy, howToSpin_light, practiceWheel_light],
    }
    p.wheel_1 = {
        timeline: [attnChk1, new MakeSpinLoop(1), new MakeFlowQs(1), new MakeEnjoyQs(1), new MakeEffortQs(1), new MakeScbQs(1)],
    };

    p.wheel_2 = {
        timeline: [attnChk2, new MakeSpinLoop(2), new MakeFlowQs(2), new MakeEnjoyQs(2), new MakeEffortQs(2), new MakeScbQs(2), freeResponse],
    };

    p.wheel_3 = {
        timeline: [attnChk3, new MakeSpinLoop(3), new MakeFlowQs(3), new MakeEnjoyQs(3), new MakeEffortQs(3), new MakeScbQs(3)],
    };

    p.wheel_4 = {
        timeline: [attnChk4, new MakeSpinLoop(4), new MakeFlowQs(4), new MakeEnjoyQs(4), new MakeEffortQs(4), new MakeScbQs(4)],
    };

   /*
    *
    *   Demographics
    *
    */

    p.demographics = (function() {


        const taskComplete = {
            type: jsPsychInstructions,
            pages: function () { 
                let scoreArray = jsPsych.data.get().select('score').values;
                let totalScore = scoreArray[scoreArray.length - 1];
                return [`<div class='parent' style='color: rgb(109, 112, 114)'>
                    <p>Spin the Wheel is now complete! You won a total of <strong>${totalScore}</strong> points!</p>
                    <p>To finish this study, please continue to answer a few final questions.</p>
                    </div>`];
            },  
            show_clickable_nav: true,
            post_trial_gap: 500,
            allow_keys: false,
        };

        const meanOfEffScale = ['-2<br>Strongly<br>Disagree', '-1<br>Disagree', '0<br>Neither agree<br>nor disagree', '1<br>Agree', '2<br>Strongly<br>Agree'];

        const meanOfEff = {
            type: jsPsychSurveyLikert,
            preamble:
                `<div style='padding-top: 50px; width: 900px; font-size:16px; color: rgb(109, 112, 114)'>
                    <p><strong>Please answer the following questions as honestly and accurately as possible.</strong></p>
                </div>`,
            questions: [
                {
                    prompt: `Pushing myself helps me see the bigger picture.`,
                    name: `meanOfEff_1`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `I often don't understand why I am working so hard.`,
                    name: `meanOfEff_2r`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `I learn the most about myself when I am trying my hardest.`,
                    name: `meanOfEff_3`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `Things make more sense when I can put my all into them.`,
                    name: `meanOfEff_4`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I work hard, it rarely makes a difference.`,
                    name: `meanOfEff_5r`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I push myself, what I'm doing feels important.`,
                    name: `meanOfEff_6`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I push myself, I feel like I'm part of something bigger than me.`,
                    name: `meanOfEff_7`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `Doing my best gives me a clear purpose in life.`,
                    name: `meanOfEff_8`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I try my hardest, my life has meaning.`,
                    name: `meanOfEff_9`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I exert myself, I feel connected to my ideal life.`,
                    name: `meanOfEff_10`,
                    labels: meanOfEffScale,
                    required: true,
                },
            ],
            randomize_question_order: false,
            scale_width: 500,
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        };

        const gender = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>What is your gender?</p>',
            choices: ['Male', 'Female', 'Other'],
            on_finish: (data) => {
                data.gender = data.response;
            }
        };

        const age = {
            type: jsPsychSurveyText,
            questions: [
                {
                    prompt: "Age:", 
                    name: "age",
                    required: true,
                }
            ],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 

        const ethnicity = {
            type: jsPsychSurveyHtmlForm,
            preamble: '<p>What is your race / ethnicity?</p>',
            html: `<div style="text-align: left">
            <p>White / Caucasian <input name="ethnicity" type="radio" value="white"/></p>
            <p>Black / African American <input name="ethnicity" type="radio" value="black"/></p>
            <p>East Asian (e.g., Chinese, Korean, Vietnamese, etc.) <input name="ethnicity" type="radio" value="east-asian"/></p>
            <p>South Asian (e.g., Indian, Pakistani, Sri Lankan, etc.) <input name="ethnicity" type="radio" value="south-asian"/></p>
            <p>Latino / Hispanic <input name="ethnicity" type="radio" value="hispanic"/></p>
            <p>Middle Eastern / North African <input name="ethnicity" type="radio" value="middle-eastern"/></p>
            <p>Indigenous / First Nations <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Bi-racial <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Other <input name="other" type="text"/></p>
            </div>`,
            on_finish: (data) => {
                data.ethnicity = data.response.ethnicity;
                data.other = data.response.other;
            }
        };

        const english = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>Is English your native language?:</p>',
            choices: ['Yes', 'No'],
            on_finish: (data) => {
                data.english = data.response;
            }
        };  

        const finalWord = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Questions? Comments? Complains? Provide your feedback here!", rows: 10, columns: 100, name: "finalWord"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 


        const demos = {
            timeline: [taskComplete, gender, age, ethnicity, english, finalWord]
        };

        return demos;

    }());


   /*
    *
    *   SAVE DATA
    *
    */

    p.save_data = {
        type: jsPsychPipe,
        action: "save",
        experiment_id: "ezHgvBkwzanv",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.practice, exp.wheel_1, exp.wheel_2, exp.wheel_3, exp.wheel_4, exp.demographics, exp.save_data];

jsPsych.run(timeline);
