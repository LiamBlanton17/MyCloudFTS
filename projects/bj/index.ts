import * as readline from 'readline-sync'

//calling suits for enum

enum Suit {
    Hearts,
    Clubs,
    Spades,
    Diamonds
}

enum Rank {
    Ace = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8, 
    Nine = 9,
    Ten = 10,
    Jack = 10,
    Queen = 10,
    King = 10
}

class Game {
    playerHand: Card[];
    dealerHand: Card[];
    deck: Deck;
    playerScore: number;
    dealerScore: number;
    playerBank: number;
    playerBet: number;
    playerBetSuggestion;



    constructor() {
        this.playerHand = [];
        this.dealerHand = [];
        this.deck = new Deck();
        this.playerScore = 0;
        this.dealerScore = 0;
        this.playerBank = 0;
        this.playerBet = 0;
        this.playerBetSuggestion = 0;
    }

    initalizeBank() {
        this.playerBank = readline.question(("How much would you like to your bank? Please enter an integer: "));
        //this.playerBetSuggestion = this.calculateBetSuggestion(this.playerBank);
        console.log("");
        this.playerBet = readline.question(("How much would you like to bet? Enter a number: "));
        while(!(this.playerBet > this.playerBank)){
            if(this.playerBet <= this.playerBank){
                console.log("We have set your bet to: ", this.playerBet)
                console.log("");
            }else{
                console.log("Your bank can't cover a bet that high")
                this.playerBet = readline.question(("How much would you like to bet? Enter a number: "));
            }
        }

        this.startGame();
    }

    startGame() {
        this.deck = new Deck();
        this.deck.shuffle();

        this.playerHand = [this.deck.drawCard(), this.deck.drawCard()];
        this.dealerHand = [this.deck.drawCard(), this.deck.drawCard()];

        this.playerScore = this.calculateScore(this.playerHand);
        this.dealerScore = this.calculateScore(this.dealerHand);
        
        console.log("The Players Hand Is: ", this.playerHand.toString(), "and the Score Is", this.playerScore);
        console.log("The Dealers Hand Is: ", this.dealerHand[0].toString(), ", 'Hidden'");
        console.log("");

        this.playerTurn();

        if(this.playerScore <= 21){
            this.dealerTurn();
        }

        if(this.dealerScore <= 21){
            this.evalWinner();
        }



    }

    /**calculateBetSuggestion(totalAmount: number): number {
        return totalAmount * .2;

    }**/ //kinda useless cuz i wanted to have options for different percentages but getting that input just isnt worth it

    evalWinner() {
        if(this.playerScore <= 21 && this.playerScore < this.dealerScore && this.dealerScore <= 21){
            console.log("The Dealer Wins!");
            console.log("");
            //console.log("You lost your bet of ", this.playerBet);
            this.playerBank -= this.playerBet;
            //console.log("Your bank now has $", this.playerBank);
            //console.log("");
            return;
        } else if(this.playerScore <= 21 && this.playerScore > this.dealerScore && this.dealerScore <= 21){
            console.log("The Player Wins!");
            console.log("");
            //console.log("You won your bet of ")
            return;
        } else if(this.playerScore == this.dealerScore){
            console.log("There Is a Tie! Let's Play Again");
            console.log("");
            return;
        }
    }


    dealerTurn(){
        console.log("It Is Now the Dealer's Turn")
        console.log("");
        console.log("The Dealers Hand Is: ", this.dealerHand.toString(), "and the Score Is ", this.dealerScore);
        console.log("");

        while(this.dealerScore < 17){
            console.log("The Dealer Hits")
            console.log("");
            this.dealerHand.push(this.deck.drawCard());
            this.dealerScore = this.calculateScore(this.dealerHand);

            console.log("The Dealer's New Card Is: ", this.dealerHand[this.dealerHand.length - 1].toString());
            console.log("");
            console.log("The Dealer's Hand Is: ", this.dealerHand.toString(), "and the Score Is ", this.dealerScore);
            console.log("");

        }
        
        if(this.dealerScore > 21){
            console.log("The Dealer Busted. Player Wins!");
            playing = false;
            console.log("");
        } else{
            return;
        }

        
    }

    playerTurn(){
        console.log("Player It Is Your Turn Now");
        console.log("");

        let userInput: string = ' ';

        while(userInput.toLowerCase() !== "s" && this.playerScore <= 21){
            userInput = readline.question("Would You Like To (h)it or (s)tay? ");
            console.log("");
            if(userInput.toLowerCase() === 'h'){
                this.playerHand.push(this.deck.drawCard());
                this.playerScore = this.calculateScore(this.playerHand);
                
                console.log("The New Card Is: ", this.playerHand[this.playerHand.length-1].toString());
                console.log("");
                console.log("The Players Hand Is: ", this.playerHand.toString(), "and the Score Is", this.playerScore);
                console.log("");

                if(this.playerScore > 21){
                    console.log("Player Busted. Dealer Wins");
                    playing = false;
                    console.log("");
                    return;
                }
            }


        }
    }

    calculateScore(hand: Card []): number {
        let total = 0;
        let acesCount = 0;

        for(const card of hand){
            if(card.rank === Rank.Ace ){
                acesCount++;
                total += 11
            } else {
                total += card.rank;
            }
        }

        while(total > 21 && acesCount > 0){
            total -= 10;
            acesCount--;
        }

        return total;
    }

}

class Card {
    suit: Suit;
    rank: Rank;

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString(): string {
        return `${Rank[this.rank]} of ${Suit[this.suit]}`;
    }

}

class Deck {

    cards: Card[];

    constructor() {
        this.cards = [];
        for (let suit in Suit) {
            if (isNaN(Number(suit))) continue; // Skip string values
            for (let rank in Rank) {
                if (isNaN(Number(rank))) continue; // Skip string values
                this.cards.push(new Card(Number(suit), Number(rank)));
            }
        }
    }


    display() {
        this.cards.forEach(card => console.log(card.toString()));
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); //basicaly randomizes the order
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // an implementation of a shuffle algo def gonna have to give credit for this idea
        }
    }

    drawCard(): Card | undefined{
        if(this.cards.length === 0){
            console.log("Deck is empty")
            console.log("");
            return undefined;
        }
        return this.cards.pop();
        
    }

}

let playing: boolean;
let userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
console.log("");
if(userInputToPlay.toLowerCase() === 'p'){
    playing = true;
} else if(userInputToPlay.toLowerCase() === 'q'){
    console.log("Have a good day!");
    playing = false;
    process.exit();
} else if (userInputToPlay.toLowerCase() !== 'q' || userInputToPlay.toLowerCase() !== 'p' ) {
    console.log("Please enter a valid value");
    console.log("");
    playing = true;
    userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
}

while(playing){
    const game = new Game();

    //game.initalizeBank();

    game.startGame();

    userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
    console.log("");
    if(userInputToPlay.toLowerCase() === 'p'){
        playing = true;
    } else if(userInputToPlay.toLowerCase() === 'q'){
        console.log("Have a good day!")
        playing = false;;
        process.exit();
    } else if (userInputToPlay.toLowerCase() !== 'q' || userInputToPlay.toLowerCase() !== 'p' ) {
        console.log("Please enter a valid value");
        console.log("");
        playing = true;
        userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
        
    }
}
