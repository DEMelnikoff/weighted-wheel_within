

const exp = (function() {


    let p = {};

    let settings = {
        nSpins: 10,
        effortOrder: ['highEffort_first', 'highEffort_second'][Math.floor(Math.random() * 2)],
        miOrder: ['highMI_first', 'highMI_second'][Math.floor(Math.random() * 2)],
    };

    console.log(settings.effortOrder, settings.miOrder)

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
        two: {color:"#800001", label:"2"},
        three: {color:"#fe6a00", label:"3"},
        four: {color:"#803400", label:"4"},
        five: {color:"#0094fe", label:"5"},
        six: {color:"#806b00", label:"6"},
        seven: {color:"#228B22", label:"7"},
        eight: {color:"#007f0e", label:"8"},
        nine: {color:"#ffd800", label:"9"},
        ten: {color:"#00497e", label:"10"},
        eleven: {color:"#0026ff", label:"11"},
        twelve: {color:"#001280", label:"12"},
        thirteen: {color:"#b100fe", label:"13"},
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

        let correctAnswers = [`Earn as many points as possible.`, `5`];

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
                    prompt: "<div style='color: rgb(109, 112, 114)'>What is the goal of Spin the Wheel?</div>", 
                    name: `attnChk1`, 
                    options: [`Earn as many points as possible.`, `Spin the wheel as fast as possible.`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>How many points is it worth when the wheel lands on a 5?</div>", 
                    name: `attnChk2`, 
                    options: [`0`, `5`, `10`],
                },
                {
                    prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                    name: `attnChk3`, 
                    options: [`In Round ${round}, I must tap my right arrow as fast as possible to build momentum.`, `In Round ${round}, I must tap my right arrow at a moderate pace to build momentum.`],
                },
            ],
            scale_width: 500,
            on_finish: (data) => {
                console.log(data)
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                console.log(totalErrors)
                data.totalErrors = totalErrors;
            },
        };

        const errorMessage = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>You provided the wrong answer.<br>To make sure you understand the game, please continue to re-read the instructions.</p>`
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

        const instLoop = {
          timeline: [attnChk, conditionalNode],
          loop_function: () => {
            const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
            return fail;
          },
        };

        const practiceComplete = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: function () {
                            if (round == 1) {
                                return `<p><strong>Practice is now complete!</strong></p>
                                <p>Remember: your goal is to earn as many points as possible across the two rounds of Spin the Wheel.<br>
                                Throughout both rounds, your current score will be displayed on a score board.</p>`
                            } else {
                                return `<p><strong>Practice is now complete!</strong></p>
                                <p>Remember: your goal is to earn as many points as possible across the two rounds of Spin the Wheel.<br>
                                In Round 2, you will continue to add to your total score from Round 1.</p>`
                            };
                        },
                    },
                ],

            ],
            button_label_finish: 'Next',
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
                                return `<p>You're now ready to add to your total score by playing Round ${round} of Spin the Wheel.</p>
                                <p>To play Round ${round}, continue to the next screen.</p>`
                            }
                        }
                    },
                ],

            ],
            button_label_finish: 'Next',
        };

        this.timeline = [practiceComplete, instLoop, readyToPlay];
    }

    let scoreTracker_practice = 0; // track current score
    let scoreTracker = 0; // track current score


    function MakePracticeWheel(text, round) {

        let speedText = (round == 1) ? text.speed1_r1 : text.speed1_r2;

        const practiceWheel_1 = {
            type: jsPsychCanvasButtonResponse,
            prompt: `<div class='spin-instructions'>
            <p>Repeatedly tap your right arrow ${speedText} to build momentum.
            Once you build enough momentum, you'll see a "Ready!" message at the center of the wheel,
            which means you can spin the wheel by pressing your spacebar. Once you spin the wheel, you can stop tapping your right arrow.</p>
            <p>Practice spinning by (1) tapping your right arrow ${speedText} and then (2) pressing your spacebar when the "Ready!" message appears.</p>
            </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.three, wedges.three, wedges.five, wedges.five], jsPsych.timelineVariable('targetPressTime'), [0], 1, scoreTracker_practice);
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
                <p>Spin the wheel by (1) tapping your right arrow ${speedText} and then (2) pressing your spacebar when the "Ready!" message appears.</p>
                <p>Once you spin the wheel, you can stop tapping your right arrow.</p>
                </div>`,
            stimulus: function(c, spinnerData) {
                dmPsych.spinner(c, spinnerData, [wedges.three, wedges.three, wedges.five, wedges.five], jsPsych.timelineVariable('targetPressTime'), [0, 0, 0], 3, scoreTracker_practice);
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
                    <p>We're interested in why people feel effortlessly engaged in some activities (such as engrossing video games),<br>
                    but struggle to focus on other activities (like tedious chores).</p>
                    <p>To help us, you'll play two rounds of a game called <strong>Spin the Wheel</strong>.<br>
                    After each round, you'll report how immersed and engaged you felt.</p>
                    <p>When you're ready to learn about Spin the Wheel, continue to the next page.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In both rounds of Spin the Wheel, you'll spin a prize wheel to earn points.
                        <br>The number of points you earn depends on where the wheel lands.</p>
                        <p>Your goal is to earn as many points as possible across the two rounds!</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>Spinning a prize wheel is a two-step process.</p>
                        <p>First, you must build momentum by repeatedly tapping the right arrow on your keyboard.</br>
                        Once you build enough momentum, you must press your spacebar to spin the wheel.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Round 1 of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r1}.<br>${text.speed2_r1}</p>
                    <p>Once you build enough momentum, you must press your spacebar to spin the wheel.</p>
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
                    <p>Soon, you'll be able to add to your total score by playing Round 2</p>
                    <p>To learn about Round 2, continue to the next screen.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>In Round 2 of Spin the Wheel, you'll need to tap your right arrow ${text.speed1_r2}.<br>${text.speed2_r2}</p>
                    <p>Once you build enough momentum, you must press your spacebar to spin the wheel.</p>
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

    function makeTimelineVariables(settings, round) {

        // array indiciating whether or not the outcome of each spin is guaranteed
        let guaranteedOutcome = new Array(settings.nSpins).fill(0);

        // set sectors, ev, sd, and mi
        let sectors, ev, sd, mi;
        if (settings.miOrder == 'highMI_first' && round == 1 || settings.miOrder == 'highMI_second' && round == 2) {
            sectors = [ wedges.two, wedges.four, wedges.seven, wedges.ten ];
            ev = 5.75;
            sd = 3.5;
            mi = 2;
        } else if (settings.miOrder == 'highMI_first' && round == 2 || settings.miOrder == 'highMI_second' && round == 1) {
            sectors = [ wedges.four, wedges.four, wedges.four, wedges.eleven ];
            ev = 5.75;
            sd = 3.5;
            mi = .81;
        };

        // set target time between button presses
        let targetPressTime;
        if (settings.effortOrder == 'highEffort_first' && round == 1 || settings.effortOrder == 'highEffort_second' && round == 2) {
            targetPressTime = [0, .18];
        } else if (settings.effortOrder == 'highEffort_first' && round == 2 || settings.effortOrder == 'highEffort_second' && round == 1) {
            targetPressTime = [.2, .75];
        };

        let timelineVariables = [{round: round, sectors: sectors, mi: mi, ev: ev, sd: sd, targetPressTime: targetPressTime, guaranteedOutcome: guaranteedOutcome}];

        return timelineVariables;
    };

    const wheel = {
        type: jsPsychCanvasButtonResponse,
        stimulus: function(c, spinnerData) {
            dmPsych.spinner(c, spinnerData, jsPsych.timelineVariable('sectors'), jsPsych.timelineVariable('targetPressTime'), jsPsych.timelineVariable('guaranteedOutcome'), settings.nSpins, scoreTracker);
        },
        nSpins: settings.nSpins,
        initialScore: function() {
            return scoreTracker;
        },
        canvas_size: [500, 500],
        show_scoreboard: true,
        post_trial_gap: 1000,
        data: {round: jsPsych.timelineVariable('round'), mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')},
        on_finish: function(data) {
            scoreTracker = data.score;
        },
    };


   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    var zeroToExtremely = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>Extremely'];
    var zeroToALot = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>A lot'];

    // constructor functions
    function MakeFlowQs(round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Thank you for completing Round ${round} of Spin the Wheel!</p>

        <p>During Round ${round}, to what extent did you feel immersed and engaged in what you were doing?<br>
        Report the degree to which you felt immersed and engaged by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <strong>absorbed</strong> did you feel in what you were doing?</div>`,
                name: `absorbed`,
                labels: ["0<br>Not very absorbed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More absorbed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <strong>immersed</strong> did you feel in what you were doing?</div>`,
                name: `immersed`,
                labels: ["0<br>Not very immersed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More immersed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <strong>engaged</strong> did you feel in what you were doing?</div>`,
                name: `engaged`,
                labels: ["0<br>Not very engaged", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engaged than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During Round ${round}, how <strong>engrossed</strong> did you feel in what you were doing?</div>`,
                name: `engrossed`,
                labels: ["0<br>Not very engrossed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engrossed than I've ever felt"],
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 800;
        this.data = {round: round , mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEnjoyQs(round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Below are a few more questions about Round ${round} of Spin the Wheel.</p>

        <p>Instead of asking about immersion and engagement, these questions ask about <strong>enjoyment</strong>.<br>
        Report how much you <strong>enjoyed</strong> Round ${round} by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>enjoy</strong> playing Round ${round}?</div>`,
                name: `enjoyable`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>like</strong> playing Round ${round}?</div>`,
                name: `like`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>dislike</strong> playing Round ${round}?</div>`,
                name: `dislike`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much <strong>fun</strong> did you have playing Round ${round}?</div>`,
                name: `fun`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <strong>entertaining</strong> was Round ${round}?</div>`,
                name: `entertaining`,
                labels: zeroToExtremely,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 800;
        this.data = {round: round, mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')};
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
        this.scale_width = 500;
        this.data = {round: round, mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    function MakeMeaningQs(round) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>While playing Round ${round} of Spin the Wheel,<br>to what extent did you feel like you were doing something meaningful?</div>`,
                name: `meaning`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 500;
        this.data = {round: round, mi: jsPsych.timelineVariable('mi'), targetPressTime: jsPsych.timelineVariable('targetPressTime'), sectors: jsPsych.timelineVariable('sectors'), ev: jsPsych.timelineVariable('ev'), sd: jsPsych.timelineVariable('sd')};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };

    // timeline: first wheel
    p.wheel_1 = {
        timeline: [...practiceWheels_r1.timeline, attnChk1, wheel, new MakeFlowQs(1), new MakeEnjoyQs(1), new MakeEffortQs(1), new MakeMeaningQs(1)],
        timeline_variables: makeTimelineVariables(settings, 1),
    };

    // timeline: second wheel
    p.wheel_2 = {
        timeline: [...practiceWheels_r2.timeline, attnChk2, wheel, new MakeFlowQs(2), new MakeEnjoyQs(2), new MakeEffortQs(2), new MakeMeaningQs(2)],
        timeline_variables: makeTimelineVariables(settings, 2),
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
                console.log(scoreArray);
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
        experiment_id: "2duNUdEd5tOw",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.intro_1, exp.wheel_1, exp.intro_2, exp.wheel_2, exp.demographics, exp.save_data];

jsPsych.run(timeline);
