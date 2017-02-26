var inquirer = require( "inquirer" );
//var question = require("./card_data.js" );
var question = require("./flashcards.json" );
var cards = [];
var fs = require( "fs" );

var longAnswer = true;    // By Changing this to false you get the short answer version, true = the cloze (long) answer version.
const limit = 10;  // for testing
var score = {           // A convienient object for keeps score into together
    rounds: 0,
    questionsAsked: 0,
    correct: 0,
    inCorrect: 0
};
var prompt = {          // This is an empty prompt template.  We'll update the values as we go on.
    name: "response",
    message: "",
    type: "text"
}
/* This is the constructadora for the flash cards 
 *  This constructs both the short and long values on the .card object -- DRY
 */
function BasicFlashCard( question ) {
    this.question = question;
    this.extractAnswer = function( string ) {         // Extract the answer string from the question
        let start = string.indexOf("{{");             // Start of answer string
        let end = string.indexOf("}}") + 2;           // end of answer string 
        let questionMod = string.slice(0,start) + " ... " + string.slice(end);  // Replace with an elipsis
        let answer = string.slice(start+2,end-2);     // get the answer value without the squiggles
        answer = answer.trim();
        let fullAnswer = string.slice(0,start) + answer  + string.slice(end);     // Produce the "full answer" version
        return { front: questionMod, back: answer, fullAnswer: fullAnswer };      // Return both parts in an object
    }
    this.side = this.extractAnswer( this.question );
    this.dump = function() {          // Utility object debugging function for self-dump 
        for ( var prop in this ) {
            console.log( prop + " = ", this[prop] );
        }
    }
   this.card = () => {
        return this.question;
    }
}

// function SimpleCard( question, answer ) {
//     this.question = question;
//     this.answer = answer;
//     this.createFlashCards = function( question, answer ) {
//         this.front = this.question;
//         this.back = this.answer;
//     }
// }

console.log( "Loading questions..." );

question.forEach( c => {
    cards.push( new BasicFlashCard( c ) );
});

// console.log( cards );

savedCards = cards.slice(0);

function nextCard() { 
    var card = cards.pop();    // Pop a card off the stack
    prompt.message = card.side.front;  // move the card message to the inquirer prompt 
    score.questionsAsked++;
    console.log( "-----------------" );
    inquirer.prompt( prompt )
    .then( function( answer ) {
        if ( answer.response.trim().toLowerCase() === card.side.back.trim().toLowerCase() ) {
            score.correct++;
            console.log( "That's right!  Great job." );
        } else {
            console.log( `Sorry, the correct answer is ${card.side.back}.`);
            score.inCorrect++;
        }
        if ( longAnswer ) {
            console.log( `Full answer: ${card.side.fullAnswer}` );
        }
        checkStatus( score ) ;
    });
}

function checkStatus( score ) {
    if ( cards.length <= 0 || ( limit && score.questionsAsked >= limit ) ) {
        score.rounds++;
        console.log( "Round " + score.rounds + " complete." );
        console.log( "Total questions asked was " + score.questionsAsked );
        console.log( "Correct answers   : " + score.correct );
        console.log( "Incorrect answers : " + score.inCorrect );
        console.log( "" );
        if ( score.correct < score.questionsAsked ) {
            let prompt = {
                name: "answer",
                message: "Would you like to play again?",
                type: "bolean"
            }
            inquirer.prompt( prompt )
            .then( function( resp ) {
                if ( resp.answer.toLowerCase() === 'y' ) {
                    console.log( "We're gonna play again!")
                    cards = savedCards.slice(0);  // Reset the card stack
                    score.questionsAsked = 0;     // Reset the game counters
                    score.correct = 0;            // But not the round counter.
                    score.inCorrect = 0;
                    nextCard();
                }
            })
        } 
    } else {
        nextCard();
    }
}
console.log( "-------------------------------------------------------------------------" );
console.log( "This game may be played as a flash card emulator that presents" );
console.log( "a question and receives and answer.  If the answer is correct, then" );
console.log( "the player is congratulated and the next card is displayed.  If the" );
console.log( "answer is wrong then the player is shown the correct answer and we move" );
console.log( "on to the next question." );
console.log( "Your other option is the 'Long answer' version that shows the question" );
console.log( "and after telling the player if he is correct or not, displays the" );
console.log( "complete text of the correct answer." );
console.log( "-------------------------------------------------------------------------" );
console.log( "Begin flash cards. (count=" + cards.length + ")" );

typePrompt = {
    name: "gameType",
    message: "Which type of game would you like to play ",
    type: "list",
    choices: [ "Emulator", "Long answer", "Add a card" ]
}

inquirer.prompt( typePrompt )
.then( function(resp) {
    console.log( resp );
    if ( resp.gameType === "Long answer" ) {
        longAnswer = true;
        nextCard();
    } else if ( resp.gameType === "Add a card" ) {
        loadCards();
    } else {
        longAnswer = false;
        nextCard();
    }
})

function loadCards() {
    console.log( "Enter the question in this format 'George Washington was the {{first}} president of this here United States." );
    console.log( "Press return at the prompt to exit.")
    var prompt = {
        name: "question",
        message: "Q: ",
        type: "text"
    }
    inquirer.prompt( prompt )
    .then( function( resp ) {
        if ( resp.question === "" ) return;
        console.log( resp );
        if ( ! resp.question.match( ".*{{.*}}" ) ) {
            console.log( Error( "missing answer string" ))
        } else {
            let c = new BasicFlashCard( resp.question );
            console.log( c.card() );
            question.push( c.card() );
            fs.writeFile( "flashcards.json", JSON.stringify( question ), 'UTF8', function(err) {
                if ( err ) console.log( err );
            })
        }
        loadCards();
    })
}