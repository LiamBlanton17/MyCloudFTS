"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline-sync");
//calling suits for enum
var Suit;
(function (Suit) {
    Suit[Suit["Hearts"] = 0] = "Hearts";
    Suit[Suit["Clubs"] = 1] = "Clubs";
    Suit[Suit["Spades"] = 2] = "Spades";
    Suit[Suit["Diamonds"] = 3] = "Diamonds";
})(Suit || (Suit = {}));
var Rank;
(function (Rank) {
    Rank[Rank["Ace"] = 1] = "Ace";
    Rank[Rank["Two"] = 2] = "Two";
    Rank[Rank["Three"] = 3] = "Three";
    Rank[Rank["Four"] = 4] = "Four";
    Rank[Rank["Five"] = 5] = "Five";
    Rank[Rank["Six"] = 6] = "Six";
    Rank[Rank["Seven"] = 7] = "Seven";
    Rank[Rank["Eight"] = 8] = "Eight";
    Rank[Rank["Nine"] = 9] = "Nine";
    Rank[Rank["Ten"] = 10] = "Ten";
    Rank[Rank["Jack"] = 10] = "Jack";
    Rank[Rank["Queen"] = 10] = "Queen";
    Rank[Rank["King"] = 10] = "King";
})(Rank || (Rank = {}));
var Game = /** @class */ (function () {
    function Game() {
        this.playerHand = [];
        this.dealerHand = [];
        this.deck = new Deck();
        this.playerScore = 0;
        this.dealerScore = 0;
        this.playerBank = 0;
        this.playerBet = 0;
        this.playerBetSuggestion = 0;
    }
    Game.prototype.initalizeBank = function () {
        this.playerBank = readline.question(("How much would you like to your bank? Please enter an integer: "));
        //this.playerBetSuggestion = this.calculateBetSuggestion(this.playerBank);
        console.log("");
        this.playerBet = readline.question(("How much would you like to bet? Enter a number: "));
        while (!(this.playerBet > this.playerBank)) {
            if (this.playerBet <= this.playerBank) {
                console.log("We have set your bet to: ", this.playerBet);
                console.log("");
            }
            else {
                console.log("Your bank can't cover a bet that high");
                this.playerBet = readline.question(("How much would you like to bet? Enter a number: "));
            }
        }
        this.startGame();
    };
    Game.prototype.startGame = function () {
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
        if (this.playerScore <= 21) {
            this.dealerTurn();
        }
        if (this.dealerScore <= 21) {
            this.evalWinner();
        }
    };
    /**calculateBetSuggestion(totalAmount: number): number {
        return totalAmount * .2;

    }**/ //kinda useless cuz i wanted to have options for different percentages but getting that input just isnt worth it
    Game.prototype.evalWinner = function () {
        if (this.playerScore <= 21 && this.playerScore < this.dealerScore && this.dealerScore <= 21) {
            console.log("The Dealer Wins!");
            console.log("");
            //console.log("You lost your bet of ", this.playerBet);
            this.playerBank -= this.playerBet;
            //console.log("Your bank now has $", this.playerBank);
            //console.log("");
            return;
        }
        else if (this.playerScore <= 21 && this.playerScore > this.dealerScore && this.dealerScore <= 21) {
            console.log("The Player Wins!");
            console.log("");
            //console.log("You won your bet of ")
            return;
        }
        else if (this.playerScore == this.dealerScore) {
            console.log("There Is a Tie! Let's Play Again");
            console.log("");
            return;
        }
    };
    Game.prototype.dealerTurn = function () {
        console.log("It Is Now the Dealer's Turn");
        console.log("");
        console.log("The Dealers Hand Is: ", this.dealerHand.toString(), "and the Score Is ", this.dealerScore);
        console.log("");
        while (this.dealerScore < 17) {
            console.log("The Dealer Hits");
            console.log("");
            this.dealerHand.push(this.deck.drawCard());
            this.dealerScore = this.calculateScore(this.dealerHand);
            console.log("The Dealer's New Card Is: ", this.dealerHand[this.dealerHand.length - 1].toString());
            console.log("");
            console.log("The Dealer's Hand Is: ", this.dealerHand.toString(), "and the Score Is ", this.dealerScore);
            console.log("");
        }
        if (this.dealerScore > 21) {
            console.log("The Dealer Busted. Player Wins!");
            playing = false;
            console.log("");
        }
        else {
            return;
        }
    };
    Game.prototype.playerTurn = function () {
        console.log("Player It Is Your Turn Now");
        console.log("");
        var userInput = ' ';
        while (userInput.toLowerCase() !== "s" && this.playerScore <= 21) {
            userInput = readline.question("Would You Like To (h)it or (s)tay? ");
            console.log("");
            if (userInput.toLowerCase() === 'h') {
                this.playerHand.push(this.deck.drawCard());
                this.playerScore = this.calculateScore(this.playerHand);
                console.log("The New Card Is: ", this.playerHand[this.playerHand.length - 1].toString());
                console.log("");
                console.log("The Players Hand Is: ", this.playerHand.toString(), "and the Score Is", this.playerScore);
                console.log("");
                if (this.playerScore > 21) {
                    console.log("Player Busted. Dealer Wins");
                    playing = false;
                    console.log("");
                    return;
                }
            }
        }
    };
    Game.prototype.calculateScore = function (hand) {
        var total = 0;
        var acesCount = 0;
        for (var _i = 0, hand_1 = hand; _i < hand_1.length; _i++) {
            var card = hand_1[_i];
            if (card.rank === Rank.Ace) {
                acesCount++;
                total += 11;
            }
            else {
                total += card.rank;
            }
        }
        while (total > 21 && acesCount > 0) {
            total -= 10;
            acesCount--;
        }
        return total;
    };
    return Game;
}());
var Card = /** @class */ (function () {
    function Card(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    Card.prototype.toString = function () {
        return "".concat(Rank[this.rank], " of ").concat(Suit[this.suit]);
    };
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        for (var suit in Suit) {
            if (isNaN(Number(suit)))
                continue; // Skip string values
            for (var rank in Rank) {
                if (isNaN(Number(rank)))
                    continue; // Skip string values
                this.cards.push(new Card(Number(suit), Number(rank)));
            }
        }
    }
    Deck.prototype.display = function () {
        this.cards.forEach(function (card) { return console.log(card.toString()); });
    };
    Deck.prototype.shuffle = function () {
        var _a;
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1)); //basicaly randomizes the order
            _a = [this.cards[j], this.cards[i]], this.cards[i] = _a[0], this.cards[j] = _a[1]; // an implementation of a shuffle algo def gonna have to give credit for this idea
        }
    };
    Deck.prototype.drawCard = function () {
        if (this.cards.length === 0) {
            console.log("Deck is empty");
            console.log("");
            return undefined;
        }
        return this.cards.pop();
    };
    return Deck;
}());
var playing;
var userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
console.log("");
if (userInputToPlay.toLowerCase() === 'p') {
    playing = true;
}
else if (userInputToPlay.toLowerCase() === 'q') {
    console.log("Have a good day!");
    playing = false;
    process.exit();
}
else if (userInputToPlay.toLowerCase() !== 'q' || userInputToPlay.toLowerCase() !== 'p') {
    console.log("Please enter a valid value");
    console.log("");
    playing = true;
    userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
}
while (playing) {
    var game = new Game();
    //game.initalizeBank();
    game.startGame();
    userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
    console.log("");
    if (userInputToPlay.toLowerCase() === 'p') {
        playing = true;
    }
    else if (userInputToPlay.toLowerCase() === 'q') {
        console.log("Have a good day!");
        playing = false;
        ;
        process.exit();
    }
    else if (userInputToPlay.toLowerCase() !== 'q' || userInputToPlay.toLowerCase() !== 'p') {
        console.log("Please enter a valid value");
        console.log("");
        playing = true;
        userInputToPlay = readline.question("Would you like to (p)lay or (q)uit? ");
    }
}
