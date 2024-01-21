

const exp = (function() {


    let p = {};

    // define each wedge
    const wedges = {
        one: {color:"#fe0000", label:"1"},
        two: {color:"#ff7518", label:"2"},
        three: {color:"#228B22", label:"3"},
        four: {color:"#0080ff", label:"4"}, 
        five: {color:"#ff7518", label:"5"}, 
        six: {color:"#9f00ff", label:"6"},  
        seven: {color:"#ff7518", label:"7"},
        eight: {color:"#228B22", label:"8"},
        nine: {color:"#228B22", label:"9"},
        ten: {color:"#f5ea25", label:"10"},
        eleven: {color:"#228B22", label:"11"}, 
        twelve: {color:"#001280", label:"12"},
        thirteen: {color:"#806b00", label:"13"},
    };

    const highMI_wheel = [ wedges.two, wedges.four, wedges.six, wedges.eight ]
    const lowMI_wheel1 = [ wedges.four, wedges.four, wedges.six, wedges.six ]
    const lowMI_wheel2 = [ wedges.two, wedges.two, wedges.eight, wedges.eight ]

    const wheelDraw = Math.floor(Math.random() * 2);
    let settings = {
        nSpins: 5,
        effortOrder: jsPsych.randomization.repeat(['highEffort', 'lowEffort'], 1),
        miOrder: jsPsych.randomization.repeat(['highMI', 'lowMI'], 1),
        lowMI_wheel: [lowMI_wheel1, lowMI_wheel2][wheelDraw],
    };

    let text = {};

    if (settings.effortOrder[0] == 'highEffort') {
        text.speed1_r1 = "<strong> as fast as possible</strong>";
        text.speed2_r1 = "If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.";
        text.speed1_r2 = "<strong>at a moderate pace</strong>";
        text.speed2_r2 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
    } else if (settings.effortOrder[0] == 'lowEffort') {
        text.speed1_r1 = "<strong>at a moderate pace</strong>";
        text.speed2_r1 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
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

    const convertStringToHTML = htmlString => {
        const parser = new DOMParser();
        const html = parser.parseFromString(htmlString, 'text/html');

        return html;
    }


    function MakeAttnChk(settings, round) {

        let roundNumbers = (round == 1) ? 'Rounds 1 and 2' : 'Rounds 3 and 4';
        let correctAnswers = [`Win as many tokens as possible.`, `5`];

        if (settings.effortOrder[0] == 'highEffort' && round == 1 || settings.effortOrder[1] == 'highEffort' && round == 2) {
            correctAnswers.push(`In ${roundNumbers}, I must tap my right arrow as fast as possible to build momentum.`);
        } else if (settings.effortOrder[0] == 'lowEffort' && round == 1 || settings.effortOrder[1] == 'lowEffort' && round == 2) {
            correctAnswers.push(`In ${roundNumbers}, I must tap my right arrow at a moderate pace to build momentum.`);
        };

        const attnChk = {
           type: jsPsychSurveyMultiChoice,
            preamble: `<div class='parent' style='text-align: left; color: rgb(109, 112, 114)'>
                <p><strong>Please answer the following questions about ${roundNumbers} of Spin the Wheel.</strong></p>
                </div>`,
            questions: [
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>What must you do to maximize your chances of winning a $100.00 bonus?</div>", 
                    name: `attnChk1`, 
                    options: [`Win as many tokens as possible.`, `Spin the wheel as fast as possible.`],
                },
                {
                    prompt: `<div style='color: rgb(109, 112, 114)'>How many times will you spin the wheel per round?</div>`, 
                    name: `attnChk2`, 
                    options: [`0`, `5`, `10`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                    name: `attnChk3`, 
                    options: [`In ${roundNumbers}, I must tap my right arrow as fast as possible to build momentum.`, `In ${roundNumbers}, I must tap my right arrow at a moderate pace to build momentum.`],
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


        const practiceComplete_1 = {
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
                        prompt: `<p>In Spin the Wheel, the number of tokens you win for each spin depends on where the wheel lands. For example, if the wheel lands on a 3, you'll earn 3 tokens.</p>
                        <p>Throughout the game, your total number of tokens will be displayed at the top of the screen.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In each round of Spin the Wheel, you'll spin the wheel <b>5 times</b>.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const practiceComplete_2 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p><b>Practice is now complete!</b></p>
                        <p>Continue to play Rounds 3 and 4 of Spin the Wheel.</p>`,

                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const instLoop_1 = {
            timeline: [practiceComplete_1, attnChk, conditionalNode],
            loop_function: () => {
                const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            },
        };

        const instLoop_2 = {
            timeline: [practiceComplete_2, attnChk, conditionalNode],
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
                        prompt: function() {
                            if (round == 1) {
                                return `<p>You're now ready to play Round 1 of Spin the Wheel.</p>
                                <p>To play Round 1, continue to the next screen.</p>`
                            } else {
                                return `<p>You're now ready to win more tokens by playing Round 3 of Spin the Wheel.</p>
                                <p>To play Round 3, continue to the next screen.</p>`
                            }
                        }
                    },
                ],

            ],
            button_label_finish: 'Next',
        };

        this.timeline = (round == 1) ? [instLoop_1, readyToPlay] : [instLoop_2, readyToPlay];
    }


    function MakePracticeWheel(text, round) {

        let speedText = (round == 1) ? text.speed1_r1 : text.speed1_r2;
        let targetPressTime;

        const effort_level = [settings.effortOrder[0], settings.effortOrder[0], settings.effortOrder[1], settings.effortOrder[1]][round - 1];

        // set target time between button presses
        if (effort_level == 'highEffort') {
            targetPressTime = [0, .2];
        } else if (effort_level == 'lowEffort') {
            targetPressTime = [.2, .75];
        };

        console.log(targetPressTime);

        const practiceWheel_1 = {
            type: jsPsychCanvasButtonResponse,
            prompt: `<div class='spin-instructions'>
            <p>Repeatedly tap your right arrow ${speedText} to build momentum.
            Once you build enough momentum, you'll see a "Ready!" message at the center of the wheel,
            which means you can stop tapping and spin the wheel by pressing your spacebar.</p>
            <p>Practice spinning by (1) tapping your right arrow ${speedText} and then (2) pressing your spacebar when the "Ready!" message appears.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.one, wedges.one, wedges.ten, wedges.ten], targetPressTime, [0], 1, scoreTracker_practice);
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
            <p>Great job! Now, spin the wheel a few more time to get the hang of it. Remember:</p>
            <p>Spin the wheel by (1) tapping your right arrow ${speedText} and until the "Ready!" message appears and then (2) pressing your spacebar.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.one, wedges.one, wedges.ten, wedges.ten], targetPressTime, [0, 0, 0], 3, scoreTracker_practice);
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

    p.consent = {
        type: jsPsychExternalHtml,
        url: "./html/consent.html",
        cont_btn: "advance",
    };

    p.intro_1 = {
        type: jsPsychSurvey,
        pages: [
            [
                {   
                    type:'html',
                    prompt:`<p><strong>What makes some activities more immersive and engaging than others?</strong></p>
                    <p>We're interested in why people feel completely immersed in some activities (such as engrossing video games),
                    but struggle to focus on other activities (like tedious chores).</p>
                    <p>To help us, you'll play four rounds of a game called <strong>Spin the Wheel</strong>.
                    After each round, you'll report how immersed and engrossed you felt.</p>
                    <p>When you're ready to learn about Spin the Wheel, continue to the next page.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `During Spin the Wheel, you'll be competing for a chance to win a <b>$100.00 bonus prize</b>.</p>
                    <p>Specifically, throughout the game, you'll win tokens. The tokens you win will be entered into a lottery, and if one of your tokens is drawn, you'll win $100.00. To maximize your chances of winning a $100.00 bonus, you'll need to win as many tokens as possible.</p>
                    <p>Continue to learn how to win tokens!</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Spin the Wheel, you'll win tokens by spinning various prize wheels.</p>
                    <p>Spinning a prize wheel is a two-step process.</p>
                    <p>First, you must build momentum by tapping the right arrow on your keyboard.
                    Once you build enough momentum, you must press your spacebar to spin the wheel.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In the first two rounds of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r1}. ${text.speed2_r1}</p>
                    <p>Once you build enough momentum, you must press your spacebar to spin the wheel.</p>
                    <p>To practice, continue to the next page.</p>`,
                },
            ],

        ],
        button_label_finish: 'Next'
    };

    p.intro_2 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p>Round 1 of Spin the Wheel is now complete!</p>
                    <p>Next, you'll play Round 2, which is identical to Round 1 except that the wheel has different outcomes.</p>
                    <p>To play Round 2, continue to the next screen.</p>`
                },
            ],
        ],
        button_label_finish: 'Next'    
    };

    p.intro_3 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p>Round 2 of Spin the Wheel is now complete!</p>
                    <p>Soon, you'll be able to win more tokens by playing Rounds 3 and 4.</p>
                    <p>To learn about Rounds 3 and 4, continue to the next screen.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Rounds 3 and 4 of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r2}. ${text.speed2_r2}</p>
                    <p>To practice, continue to the next page.</p>`,
                }
            ]
        ],
        button_label_finish: 'Next'    
    };

    p.intro_4 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p>Round 3 of Spin the Wheel is now complete!</p>
                    <p>Next, you'll play Round 4, which is identical to Round 3 except that the wheel has different outcomes.</p>
                    <p>To play Round 4, continue to the next screen.</p>`
                },
            ],
        ],
        button_label_finish: 'Next'    
    };

    const practiceWheels_r1 = new MakePracticeWheel(text, 1);

    const practiceWheels_r2 = new MakePracticeWheel(text, 3);

    const attnChk1 = new MakeAttnChk(settings, 1);

    const attnChk2 = new MakeAttnChk(settings, 2);

    
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
            sectors = highMI_wheel;
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
            targetPressTime = [.2, .75];
        };

        this.timeline_variables = [{round: round, sectors: sectors, mi: mi, ev: ev, sd: sd, targetPressTime: targetPressTime, guaranteedOutcome: 0}];

        const makeTokenArray = function() {
            return jsPsych.randomization.repeat(['plus', 'minus', 'normal', 'normal', 'normal'], 1);
        };

        let tokenArray = makeTokenArray();
        let outcome, color, bonusType;
        let currentStreak = 0;
        let finalStreak = 0;
        let trial = 1;

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
                outcome = data.outcomes;
                color = data.color;
            },
        };

        this.timeline = [wheel];
    }



   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    var zeroToExtremely = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>Extremely'];
    var zeroToALot = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>A lot'];
    var scbScale = ['-5<br>Way too easy', '-4', '-3', '-2', '-1', '0<br>Neither too easy nor too hard', '1', '2', '3', '4', '5<br>Way too hard'];
    var agreeDisagree = ['-5<br>Completely Disagree', '-4', '-3', '-2', '-1', '0<br>Neither agree nor disagree', '1', '2', '3', '4', '5<br>Completely Agree'];

    // constructor functions
    function MakeFlowQs(round) {
        const secondVersion = (round == 1) ? 'Round 1' : 'Round 2';
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>
        <p>Thank you for completing Round ${round} of Spin the Wheel!</p>
        <p>During Round ${round}, how <b>immersed</b> and <b>engaged</b> did you feel in the game?</p>
        <p>Report how <b>immersed</b> and <b>engaged</b> you felt by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <b>absorbed</b> did you feel in the game?</div>`,
                name: `absorbed`,
                labels: ["0<br>Not very absorbed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More absorbed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <b>immersed</b> did you feel in the game?</div>`,
                name: `immersed`,
                labels: ["0<br>Not very immersed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More immersed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <b>engaged</b> did you feel in the game?</div>`,
                name: `engaged`,
                labels: ["0<br>Not very engaged", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engaged than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <b>engrossed</b> did you feel in the game?</div>`,
                name: `engrossed`,
                labels: ["0<br>Not very engrossed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engrossed than I've ever felt"],
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEnjoyQs(round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Below are a few more questions about Round ${round} of Spin the Wheel.</p>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <b>like</b> playing Round ${round} of Spin the Wheel?</div>`,
                name: `like`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <b>dislike</b> playing Round ${round} of Spin the Wheel?</div>`,
                name: `dislike`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEffortQs(round) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>While playing Round ${round} of Spin the Wheel,<br>how much effort did it feel like you were exerting?</div>`,
                name: `effort`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    function MakeScbQs(round) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>Did you find Round ${round} of Spin the Wheel too easy, too hard,<br>or somewhere in between?</div>`,
                name: `scb`,
                labels: scbScale,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    // timeline: first wheel
    p.wheel_1 = {
        timeline: [...practiceWheels_r1.timeline, attnChk1, new MakeSpinLoop(1), new MakeFlowQs(1), new MakeEnjoyQs(1), new MakeEffortQs(1), new MakeScbQs(1)],
    };

    // timeline: second wheel
    p.wheel_2 = {
        timeline: [new MakeSpinLoop(2), new MakeFlowQs(2), new MakeEnjoyQs(2), new MakeEffortQs(2), new MakeScbQs(2)],
    };

    p.wheel_3 = {
        timeline: [...practiceWheels_r2.timeline, attnChk2, new MakeSpinLoop(3), new MakeFlowQs(3), new MakeEnjoyQs(3), new MakeEffortQs(3), new MakeScbQs(3)],
    };

    p.wheel_4 = {
        timeline: [new MakeSpinLoop(4), new MakeFlowQs(4), new MakeEnjoyQs(4), new MakeEffortQs(4), new MakeScbQs(4)],
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
                    <p>Spin the Wheel is now complete! You won a total of <strong>${totalScore}</strong> tokens!</p>
                    <p>To finish this study, please continue to answer a few final questions.</p>
                    </div>`];
            },  
            show_clickable_nav: true,
            post_trial_gap: 500,
            allow_keys: false,
        };

        const freeResponse = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'multi-choice',
                        prompt: `If you had to choose, which round of Spin the Wheel did you find most boring?`,
                        options: ['Round 1', 'Round 2'],
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

const timeline = [exp.consent, exp.intro_1, exp.wheel_1, exp.intro_2, exp.wheel_2, exp.intro_3, exp.wheel_3, exp.intro_4, exp.wheel_4, exp.demographics, exp.save_data];

jsPsych.run(timeline);
