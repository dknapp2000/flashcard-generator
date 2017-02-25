'use strict';

var inquirer = require( "inquirer" );
var currentDeck = require( './flashcards.json' );
var fs = require( "fs" );

console.log( currentDeck );

// The basic card object template, we'll use Object.create to instantiate a new object from this.

function BasicFlashCard( question ) {
    this.question = question;
    this.extractAnswer = function( string ) { // Extract the answer string from the question
        let start = string.indexOf("{{");     // Start of answer string
        let end = string.indexOf("}}") + 2;   // end of answer string 
        let questionMod = string.slice(0,start) + " ... " + string.slice(end);  // Replace with an elipsis
        let answer = string.slice(start+2,end-2);     // get the answer value without the squiggles
        answer = answer.trim();
        let fullAnswer = string.slice(0,start) + answer  + string.slice(end);     // Produce the "full answer" version
        return { front: questionMod, back: answer, fullAnswer: fullAnswer };  // Return both parts in an object
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

var prompt = {
        name: "question",
        message: "Q: ",
        type: "text"
    }


function loadCards() {
    console.log( "Enter the question in this format 'George Washington was the {{first}} president of this here United States." );
    console.log( "Press return at the prompt to exit.")
    inquirer.prompt( prompt )
    .then( function( resp ) {
        if ( resp.question === "" ) return;
        console.log( resp );
        if ( ! resp.question.match( ".*{{.*}}" ) ) {
            console.log( Error( "missing answer string" ))
        } else {
            let c = new BasicFlashCard( resp.question );
            console.log( c.card() );
            currentDeck.push( c.card() );
            fs.writeFile( "flashcards.json", JSON.stringify( currentDeck ), 'UTF8', function(err) {
                if ( err ) console.log( err );
            })
        }
        loadCards();
    })
}

loadCards();