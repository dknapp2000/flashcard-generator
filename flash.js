var inquirer = require( "inquirer" );
var question = require("./card_data.js" );
var cards = [];
// const limit = 2;  // for testing
var score = {
    rounds: 0,
    questionsAsked: 0,
    correct: 0,
    inCorrect: 0
};
var prompt = {
    name: "response",
    message: "",
    type: "text"
}

function BasicFlashCard( question ) {
    this.question = question;
    this.extractAnswer = function( string ) { // Extract the answer string from the question
        let start = string.indexOf("{{");     // Start of answer string
        let end = string.indexOf("}}") + 2;   // end of answer string 
        questionMod = string.slice(0,start) + " ... " + string.slice(end);  // Replace with an elipsis
        answer = string.slice(start+2,end-2);     // get the answer value without the squiggles
        return { front: questionMod, back: answer };  // Return both parts in an object
    }
    this.side = this.extractAnswer( this.question );
    this.dump = function() {          // Utility object debugging function for self-dump 
        for ( var prop in this ) {
            console.log( prop + " = ", this[prop] );
        }
    }
}

console.log( "Loading questions..." );

question.cardList.forEach( c => {
    //console.log( c )
    cards.push( new BasicFlashCard( c ) );
});

savedCards = cards.slice(0);

console.log( savedCards );

console.log( "Begin flash cards. (count=" + cards.length + ")" );

function nextCard() { 
    var card = cards.pop();    // Pop a card off the stack
    prompt.message = card.side.front;  // move the card message to the inquirer prompt 
    score.questionsAsked++;
    inquirer.prompt( prompt )
    .then( function( answer ) {
        console.log( answer );
        if ( answer.response.trim().toLowerCase() === card.side.back.trim().toLowerCase() ) {
            score.correct++;
            console.log( "That's right!  Great job." );
        } else {
            console.log( `Sorry, the correct answer is ${card.side.back}.`);
            score.inCorrect++;
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

nextCard();

