"use strict";
class StableGambler {
    constructor(name, money, initial) {
        this.name = name;
        this.money = money;
        this.initial = initial;
    }
    getBetSize() {
        return Math.min(this.money, this.initial);
    }
    isFinished() {
        return this.money <= 0 || this.money >= this.money * 2;
    }
    hitTarget() {
        return this.money >= this.money * 2;
    }
    bankrupt() {
        return this.money <= 0;
    }
}
class HighRiskGambler {
    constructor(name, money, initial) {
        this.name = name;
        this.money = money;
        this.initial = initial;
    }
    getBetSize() {
        const yolo = 20;
        if (this.money < yolo) {
            return this.money;
        }
        else {
            return this.money / 2;
        }
    }
    isFinished() {
        return this.money <= 0 || this.money >= this.money * 5;
    }
    hitTarget() {
        return this.money >= this.money * 5;
    }
    bankrupt() {
        return this.money <= 0;
    }
}
class StreakGambler {
    constructor(name, money, initial, minimum, winMultiplier, lossMultiplier, target, current, win) {
        this.name = name;
        this.money = money;
        this.initial = initial;
        this.minimum = minimum;
        this.winMultiplier = winMultiplier;
        this.lossMultiplier = lossMultiplier;
        this.target = target;
        this.current = current;
        this.win = win;
    }
    getBetSize() {
        if (this.win) {
            this.current = Math.max(this.minimum, this.current * this.winMultiplier);
        }
        else {
            this.current = Math.max(this.minimum, this.current * this.lossMultiplier);
        }
        return this.current;
    }
    betAfterWin() {
        this.win = true;
    }
    betAfterLoss() {
        this.win = false;
    }
    isFinished() {
        return this.money <= 0 || this.money >= this.target;
    }
    hitTarget() {
        return this.money >= this.target;
    }
    bankrupt() {
        return this.money <= 0;
    }
}
class MartingaleGambler {
    constructor(name, money, initial, current, win) {
        this.name = name;
        this.money = money;
        this.initial = initial;
        this.current = current;
        this.win = win;
    }
    getBetSize() {
        if (this.win) {
            this.current = this.current;
        }
        else {
            this.current = this.current * 2;
        }
        if (this.current >= this.money) {
            this.current = this.money;
        }
        return this.current;
    }
    betAfterWin() {
        this.win = true;
    }
    betAfterLoss() {
        this.win = false;
    }
    isFinished() {
        return this.money >= this.money * 10 || this.money <= 0;
    }
    hitTarget() {
        return this.money >= this.money * 10;
    }
    bankrupt() {
        return this.money <= 0;
    }
}
//THIS IS THE GAME ABSTRACT CLASS DONT MISS IT!!!!!!!!!
class TailsIWin {
    constructor(casino) {
        this.players = [];
        this.gameName = "Tails I Win";
        this.casino = casino;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    playGame() {
        this.simulateGame();
    }
    simulateGame() {
        for (let player of this.players) {
            console.log(`Lets play Tails I Win with ${player.name}`);
            const betSize = player.getBetSize();
            console.log(`${player.name} bets ${betSize}`);
            const flipResult = Math.floor(Math.random() * 2);
            if (flipResult === 1) {
                const winnings = betSize * 1.9;
                player.money += winnings;
                player.money -= betSize;
                this.casino.addProfit(-winnings);
                console.log(`${player.name} wins! New balance: $${player.money.toFixed(2)}`);
                console.log(`${player.name} has made ${betSize}`);
                if (player instanceof StreakGambler) {
                    player.betAfterWin();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterWin();
                }
            }
            else {
                player.money -= betSize;
                this.casino.addProfit(betSize);
                console.log(`${player.name} loses. New balance: $${player.money.toFixed(2)}`);
                console.log(`${player.name} has lost ${betSize}`);
                if (player instanceof StreakGambler) {
                    player.betAfterLoss();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterLoss();
                }
            }
            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves the casino.`);
            }
            else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt and leaves the casino.`);
            }
        }
        this.players = [];
    }
}
class GuessTheNumber {
    constructor(casino) {
        this.players = [];
        this.gameName = "Guess the Number";
        this.casino = casino;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    playGame() {
        this.simulateGame();
    }
    simulateGame() {
        const winningNumber = Math.floor(Math.random() * 5);
        console.log(`The winning number is: ${winningNumber}`);
        for (let player of this.players) {
            console.log(`Lets play Guess The Number with ${player.name}`);
            const playerNumber = Math.floor(Math.random() * 5);
            console.log(`${player.name} picks: ${playerNumber}`);
            if (playerNumber === winningNumber) {
                const originalBet = player.getBetSize();
                console.log(`${player.name} bets ${originalBet}`);
                const winnings = originalBet * 4.5;
                player.money += winnings - originalBet;
                this.casino.addProfit(-winnings);
                console.log(`${player.name} wins and now has ${player.money}`);
                console.log(`${player.name} has made ${winnings}`);
                if (player instanceof StreakGambler) {
                    player.betAfterWin();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterWin();
                }
            }
            else {
                const betSize = player.getBetSize();
                console.log(`${player.name} bets ${betSize}`);
                player.money -= betSize;
                this.casino.addProfit(betSize);
                console.log(`${player.name} loses and now has ${player.money}`);
                console.log(`${player.name} has lost ${betSize}`);
                if (player instanceof StreakGambler) {
                    player.betAfterLoss();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterLoss();
                }
            }
            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves with ${player.money}`);
            }
            else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt.`);
            }
        }
        this.players = [];
    }
}
class OffTrackGuineaPigRacing {
    constructor(casino) {
        this.players = [];
        this.gameName = "Off Track Guinea Pig Racing";
        this.casino = casino;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    playGame() {
        this.simulateGame();
    }
    simulateGame() {
        const payouts = [1.9, 3.8, 7.6, 7.6];
        let winningPig = -1;
        const random = Math.random();
        if (random < 0.50) {
            winningPig = 0;
        }
        else if (random < 0.75) {
            winningPig = 1;
        }
        else if (random < 0.875) {
            winningPig = 2;
        }
        else {
            winningPig = 3;
        }
        console.log(`The winning guinea pig is: ${winningPig}`);
        for (let player of this.players) {
            console.log(`Lets play Off Track Guinea Pig Racing with ${player.name}`);
            const chosenPig = Math.floor(Math.random() * 4);
            console.log(`${player.name} bets on guinea pig: ${chosenPig}`);
            if (chosenPig === winningPig) {
                const originalBet = player.getBetSize();
                console.log(`${player.name} bets ${originalBet}`);
                const winnings = originalBet * payouts[chosenPig];
                player.money += winnings - originalBet;
                this.casino.addProfit(-winnings);
                console.log(`${player.name} wins and now has ${player.money}`);
                console.log(`${player.name} has made ${originalBet}`);
                if (player instanceof StreakGambler) {
                    player.betAfterWin();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterWin();
                }
            }
            else {
                const betSize = player.getBetSize();
                console.log(`${player.name} bets ${betSize}`);
                player.money -= betSize;
                this.casino.addProfit(betSize);
                console.log(`${player.name} loses and now has ${player.money}`);
                console.log(`${player.name} has lost ${betSize}`);
                if (player instanceof StreakGambler) {
                    player.betAfterLoss();
                }
                if (player instanceof MartingaleGambler) {
                    player.betAfterLoss();
                }
            }
            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves with ${player.money}`);
            }
            else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt.`);
            }
        }
        this.players = [];
    }
}
class Casino {
    constructor(maxRounds) {
        this._games = [
            new TailsIWin(this),
            new GuessTheNumber(this),
            new OffTrackGuineaPigRacing(this),
        ];
        this._profits = 0;
        this._gamblers = new Set([
            // Argument 2 is the amount they start with, 
            // Arg 3 is how much they bet
            new StableGambler("Alice", 100, 15),
            // Argument 2 is the amount they start with
            // Arg 3 is how much they start betting
            // the target is to make 5 times their starting balance, but 
            // you don't see that here because it's calculated inside the 
            // constructor instead of being passed as an argument.
            new HighRiskGambler("Bob", 50, 10),
            // Arg 4 is the minimum amount they will bet 
            // Arg 5 is how much they multiply their bet by when they win
            // Arg 6 is how much they multiply their bet by when they lose
            // Arg 7 is their target. How much they want to make. 
            // Arg 8 is if the player won or not
            new StreakGambler("Camille", 200, 10, 10, 2, 0.5, 500, 10, false),
            new MartingaleGambler("Ignat", 200, 10, 10, true),
        ]);
        this._maxRounds = maxRounds;
        this._currentRound = 0;
    }
    /**
     * Add profit to the casino for the day.
     * @param amount The amount of profit to add. If negative, it counts as a
     * loss.
     */
    addProfit(amount) {
        this._profits += amount;
    }
    /** For each game: have each gambler who is still present play.
     * Starts by printing how much money each gambler has.
     * If a gambler runs out of money or hits their target, they leave.
     * Then, plays the game with all players.
     */
    simulateOneRound() {
        const startingProfit = this._profits;
        console.log("-----------------------");
        console.log("beginning round", this._currentRound);
        for (let game of this._games) {
            this.determineWhoIsStillPlaying();
            // add each player who is still playing to the game.
            // have them use the bet size determined by their personality.
            for (let player of this._gamblers) {
                if (!player.isFinished()) {
                    game.addPlayer(player);
                }
            }
            const gameStartingProfit = this._profits;
            game.playGame();
            console.log("casino made", this._profits - gameStartingProfit, "on this game.");
            console.log();
        }
        console.log("round complete. casino made: ", this._profits - startingProfit);
        console.log("total profit:", this._profits);
        console.log("-----------------------");
    }
    /**
     * Run the simulation until either the maximum number of games is reached,
     * or no one is left in the casino.
     */
    simulate() {
        while (this._currentRound < this._maxRounds && this._gamblers.size > 0) {
            this.simulateOneRound();
            console.log();
            this._currentRound++;
        }
        console.log("simulation complete");
    }
    /**
     * Update and list the people who are still playing.
     */
    determineWhoIsStillPlaying() {
        const gamblersWhoLeft = [];
        // update and list of who is still playing
        for (let gambler of this._gamblers.keys()) {
            console.log(gambler.name, ": ", gambler.money);
            if (gambler.isFinished()) {
                // add this person to the list of gamblers to remove.
                // don't remove it right away: removing an element from a 
                // collection that we are iterating over is usually a bad
                // idea.
                gamblersWhoLeft.push(gambler);
            }
            // now, print why the person left if they did so
            if (gambler.hitTarget()) {
                console.log(gambler.name, "has hit their target! They leave the casino...");
            }
            else if (gambler.bankrupt()) {
                console.log(gambler.name, "has gone bankrupt! They leave the casino...");
            }
        }
        // remove the gamblers who left from the set
        for (let leaver of gamblersWhoLeft) {
            this._gamblers.delete(leaver);
        }
    }
}
const MAX_N_ROUNDS = 5;
// main: 
const casino = new Casino(MAX_N_ROUNDS);
casino.simulate();
