

const exp = (function() {


    let p = {};

    const miDraw = Math.floor(Math.random() * 2);
    let settings = {
        nSpins: 10,
        effortOrder: ['highEffort_first', 'highEffort_second'][Math.floor(Math.random() * 2)],
        miOrder: ['highMI_first', 'highMI_second'][miDraw],
        numOutcomes: [['4', '2'], ['2', '4']][miDraw],
        pct: [['25% chance of winning 2 tokens, a 25% chance of winning 4 tokens, a 25% chance of winning 7 tokens, and a 25% chance of winning 10 tokens', '75% chance of winning 4 tokens and a 25% chance of winning 11 tokens'], ['75% chance of winning 4 tokens and a 25% chance of winning 11 tokens', '25% chance of winning 2 tokens, a 25% chance of winning 4 tokens, a 25% chance of winning 7 tokens, and a 25% chance of winning 10 tokens']][miDraw],
        imgSrc: [['highMI.png', 'lowMI.png'], ['lowMI.png', 'highMI.png']][miDraw],
    };

    let text = {};

    if (settings.effortOrder == 'highEffort_first') {
        text.speed1_r1 = "<strong> as fast as possible</strong>";
        text.speed2_r1 = "If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.";
        text.speed1_r2 = "<strong>at a moderate pace</strong>";
        text.speed2_r2 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
    } else if (settings.effortOrder == 'highEffort_second') {
        text.speed1_r1 = "<strong>at a moderate pace</strong>";
        text.speed2_r1 = "If you tap your right arrow either too quickly or too slowly, the wheel will not build enough momentum to spin.";
        text.speed1_r2 = "<strong> as fast as possible</strong>";
        text.speed2_r2 = "If you do not tap your right arrow as fast as possible, the wheel will not build enough momentum to spin.";
    };

    jsPsych.data.addProperties({
        spins_per_wheel: settings.nSpins,
        effort_order: settings.effortOrder,
        mi_order: settings.miOrder,
    });

    // define each wedge
    const wedges = {
        one: {color:"#fe0000", label:"1"},
        two: {color:"#0026ff", label:"2"},
        three: {color:"#fe6a00", label:"3"},
        four: {color:"#007f0e", label:"4"},
        five: {color:"#0094fe", label:"5"},
        six: {color:"#800001", label:"6"},
        seven: {color:"#00497e", label:"7"},
        eight: {color:"#b100fe", label:"8"},
        nine: {color:"#ffd800", label:"9"},
        ten: {color:"#228B22", label:"10"},
        eleven: {color:"#803400", label:"11"},
        twelve: {color:"#001280", label:"12"},
        thirteen: {color:"#806b00", label:"13"},
    };

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

        let correctAnswers = [`Win as many tokens as possible.`, `10`, `20%`, `20%`];

        if (settings.effortOrder == 'highEffort_first' && round == 1 || settings.effortOrder == 'highEffort_second' && round == 2) {
            correctAnswers.push(`In Round ${round}, I must tap my right arrow as fast as possible to build momentum.`);
        } else if (settings.effortOrder == 'highEffort_first' && round == 2 || settings.effortOrder == 'highEffort_second' && round == 1) {
            correctAnswers.push(`In Round ${round}, I must tap my right arrow at a moderate pace to build momentum.`);
        };

        const attnChk = {
           type: jsPsychSurveyMultiChoice,
            preamble: `<div class='parent' style='text-align: left; color: rgb(109, 112, 114)'>
                <p><strong>Please answer the following questions.</strong></p>
                </div>`,
            questions: [
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>What must you do to maximize your chances of winning a $100.00 bonus?</div>", 
                    name: `attnChk1`, 
                    options: [`Win as many tokens as possible.`, `Spin the wheel as fast as possible.`],
                },
                {
                    prompt: `<div style='color: rgb(109, 112, 114)'>In Round ${round}, how many times will you spin the wheel?</div>`, 
                    name: `attnChk2`, 
                    options: [`0`, `5`, `10`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>After each spin, what are your chances of randomly winning 5 extra tokens?</div>", 
                    name: `attnChk3`, 
                    options: [`0%`, `20%`, `100%`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>After each spin, what are your chances of randomly losing 5 tokens?</div>", 
                    name: `attnChk4`, 
                    options: [`0%`, `20%`, `100%`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                    name: `attnChk5`, 
                    options: [`In Round ${round}, I must tap my right arrow as fast as possible to build momentum.`, `In Round ${round}, I must tap my right arrow at a moderate pace to build momentum.`],
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
                        <p>Continue to learn more about Round ${round} of Spin the Wheel.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In Round 1 of Spin the Wheel, the number of tokens you win for each spin depends on where the wheel lands. For example, if the wheel lands on a 3, you'll earn 3 tokens.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>After each spin, you'll see a message indicating how many tokens you won. For example, after landing on a 3, you'd see this message indicating that you won 3 tokens:</p>
                        <div class="play-area-inst">               
                            <div class="win-text-inst" style="color:#fe6a00">+3 Tokens</div>
                        </div>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In addition to earning tokens through spinning, you can gain or lose tokens randomly.
                        Specifically, after each spin, you have a 20% chance of winning 5 extra tokens, and a 20% chance of losing 5 tokens.</p>`,

                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you see "+5 Bonus," this means you randomly won 5 extra tokens. For example, this is what you'd see if you randomly won 5 extra tokens after landing on a 3:</p>
                        <div class="play-area-inst">               
                            <div class="win-text-inst" style="color:#fe6a00">+3 Tokens</div>
                            <div class="plus-text-inst">+5 Bonus</div>
                        </div>`,
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you see "-5 Loss," this means you randomly lost 5 tokens. For example, this is what you'd see if you randomly lost 5 tokens after landing on a 3:</p>
                        <div class="play-area-inst">               
                            <div class="win-text-inst" style="color:#fe6a00">+3 Tokens</div>
                            <div class="minus-text-inst">-5 Loss</div>
                        </div>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>In Round ${round} of Spin the Wheel, you'll spin the wheel a total of <b>10 times</b>.</p>`
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
                        <p>The rules of Round ${round} of Spin the Wheel are identical to the rules of Round 1: 
                        You'll spin the wheel a total of 10 times, and after each spin, you'll have a 20% chance of winning 5 extra tokens and a 20% chance of losing 5 tokens.</p>`,

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
                                return `<p>You're now ready to play Round ${round} of Spin the Wheel.</p>
                                <p>To play Round ${round}, continue to the next screen.</p>`
                            } else {
                                return `<p>You're now ready to win more tokens by playing Round ${round} of Spin the Wheel.</p>
                                <p>To play Round ${round}, continue to the next screen.</p>`
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
        if (settings.effortOrder == 'highEffort_first' && round == 1 || settings.effortOrder == 'highEffort_second' && round == 2) {
            targetPressTime = [0, .2];
        } else if (settings.effortOrder == 'highEffort_first' && round == 2 || settings.effortOrder == 'highEffort_second' && round == 1) {
            targetPressTime = [.2, .75];
        };

        const practiceWheel_1 = {
            type: jsPsychCanvasButtonResponse,
            prompt: `<div class='spin-instructions'>
            <p>Repeatedly tap your right arrow ${speedText} to build momentum.
            Once you build enough momentum, you'll see a "Spinning!" message at the center of the wheel,
            which means that the wheel is spinning on its own and you can stop tapping your right arrow.</p>
            <p>Practice spinning by tapping your right arrow ${speedText} until the "Spinning!" message appears.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.one, wedges.one, wedges.nine, wedges.nine], targetPressTime, [0], 1, scoreTracker_practice);
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
                <p>Spin the wheel by tapping your right arrow ${speedText} until the "Spinning!" message appears.</p>
                </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.one, wedges.one, wedges.nine, wedges.nine], targetPressTime, [0, 0, 0], 3, scoreTracker_practice);
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
                    <p>To help us, you'll play two rounds of a game called <strong>Spin the Wheel</strong>.
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
                    prompt: `<p>In both rounds of Spin the Wheel, you'll win tokens by spinning a prize wheel.</p>
                    <p>To spin a prize wheel, you must build up enough momentum.</p>
                    <p>To build momentum, you must repeatedly tap the right arrow on your keyboard.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Round 1 of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r1}. ${text.speed2_r1}</p>
                    <p>Once you build enough momentum, the wheel will spin automatically.</p>
                    <p>To practice Round 1, continue to the next page.</p>`,
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
                    <p>Soon, you'll be able to win more tokens by playing Round 2</p>
                    <p>To learn about Round 2, continue to the next screen.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Round 2 of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r2}. ${text.speed2_r2}</p>
                    <p>Once you build enough momentum, the wheel will spin automatically.</p>
                    <p>To practice Round 2, continue to the next page.</p>`,
                }
            ]
        ],
        button_label_finish: 'Next'    
    };

    const practiceWheels_r1 = new MakePracticeWheel(text, 1);

    const practiceWheels_r2 = new MakePracticeWheel(text, 2);

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

        // set sectors, ev, sd, and mi
        let sectors, ev, sd, mi;
        if (settings.miOrder == 'highMI_first' && round == 1 || settings.miOrder == 'highMI_second' && round == 2) {
            sectors = [ wedges.two, wedges.three, wedges.four, wedges.eight ];
            ev = 5.75;
            sd = 3.5;
            mi = 2;
        } else if (settings.miOrder == 'highMI_first' && round == 2 || settings.miOrder == 'highMI_second' && round == 1) {
            sectors = [ wedges.three, wedges.three, wedges.three, wedges.eight ];
            ev = 5.75;
            sd = 3.5;
            mi = .81;
        };

        // set target time between button presses
        let targetPressTime;
        if (settings.effortOrder == 'highEffort_first' && round == 1 || settings.effortOrder == 'highEffort_second' && round == 2) {
            targetPressTime = [0, .2];
        } else if (settings.effortOrder == 'highEffort_first' && round == 2 || settings.effortOrder == 'highEffort_second' && round == 1) {
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
                let sectors_randomized = jsPsych.randomization.repeat(jsPsych.timelineVariable('sectors'), 1);
                dmPsych.spinner(c, spinnerData, sectors_randomized, jsPsych.timelineVariable('targetPressTime'), jsPsych.timelineVariable('guaranteedOutcome'), 1, scoreTracker);
            },
            nSpins: 1,
            initialScore: function() {
                return scoreTracker;
            },
            canvas_size: [500, 500],
            show_scoreboard: false,
            data: {round: jsPsych.timelineVariable('round'), mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')},
            on_finish: function(data) {
                scoreTracker = data.score;
                outcome = data.outcomes[0];
                color = data.color;
            },
        };

        const tokens = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                bonusType = tokenArray.pop();
                const extraOutcome = (bonusType == 'plus') ? '<div class="plus-text">+5 Bonus</div>' : (bonusType == 'minus') ? '<div class="minus-text">-5 Loss</div>' : '';
                const feedback = `<div class="play-area"> <div class="win-text" style="color:${color}">+${outcome} Tokens</div> ${extraOutcome} </div>`;
                return feedback;
            },
            choices: "NO_KEYS",
            trial_duration: 2000,
            data: {round: jsPsych.timelineVariable('round'), mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')},
            on_finish: function() {
                if (tokenArray.length == 0) {
                    tokenArray = makeTokenArray();
                };
                if (bonusType == 'plus') {
                    scoreTracker++;
                } else if (bonusType == 'minus') {
                    scoreTracker--;
                }
                console.log(scoreTracker);
            },
        };

        this.timeline = [wheel, tokens];
        this.repetitions = settings.nSpins;
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
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Thank you for completing Round ${round} of Spin the Wheel!</p>

        <p>Next, please describe your experience playing Round ${round} of Spin the Wheel.
        Specifically, please indicate the extent to which you agree or disagree with each of the following statements.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>I found Round ${round} really boring.</div>`,
                name: `boring`,
                labels: agreeDisagree,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, time seemed to fly by.</div>`,
                name: `time`,
                labels: agreeDisagree,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>Staying focused on Round ${round} was a struggle.</div>`,
                name: `focusIsStruggle`,
                labels: agreeDisagree,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, I could easily ignore external distractions.</div>`,
                name: `easilyIgnore`,
                labels: agreeDisagree,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, everything outside the game seemed to disappear.</div>`,
                name: `disappear`,
                labels: agreeDisagree,
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

        <p>Below are a few more questions about Round ${round} of Spin the Wheel.</p>

        <p>These questions ask about <b>enjoyment</b>.<br>
        Report how much you <b>enjoyed</b> Round ${round} by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <b>enjoy</b> playing Round ${round} of Spin the Wheel?</div>`,
                name: `enjoyable`,
                labels: zeroToALot,
                required: true,
            },
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
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much <b>fun</b> did you have playing Round ${round} of Spin the Wheel?</div>`,
                name: `fun`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>entertaining</b> was Round ${round} of Spin the Wheel?</div>`,
                name: `entertaining`,
                labels: zeroToExtremely,
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
        timeline: [...practiceWheels_r2.timeline, attnChk2, new MakeSpinLoop(2), new MakeFlowQs(2), new MakeEnjoyQs(2), new MakeEffortQs(2), new MakeScbQs(2)],
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
            timeline: [taskComplete, freeResponse, gender, age, ethnicity, english, finalWord]
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

const timeline = [exp.consent, exp.intro_1, exp.wheel_1, exp.intro_2, exp.wheel_2, exp.demographics, exp.save_data];

jsPsych.run(timeline);
