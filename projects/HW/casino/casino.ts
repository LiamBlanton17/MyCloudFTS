
abstract class Gambler {
    public name: string;
    public money: number;
    protected initial: number;

    constructor(name: string, money: number, initial: number) {
        this.name = name;
        this.money = money;
        this.initial = initial;
    }

    abstract getBetSize(): number;

    abstract isFinished(): boolean;

    abstract hitTarget(): boolean;

    abstract bankrupt(): boolean;

}

class StableGambler extends Gambler {
    constructor(name: string, money: number, initial: number) {
        super(name, money, initial);
    }


    getBetSize(): number {
        return Math.min(this.money, this.initial);
    }

    isFinished(): boolean {
        return this.money <= 0 ||this.money >= this.money*2;
    }

    hitTarget(): boolean {
        return this.money >= this.money*2;
    }

    bankrupt(): boolean {
        return this.money <= 0;
    }

}

class HighRiskGambler extends Gambler {
    constructor(name: string, money: number, initial: number) {
        super(name, money, initial);
    }

    getBetSize(): number {
        const yolo = 20;
        if(this.money < yolo){
            return this.money;
        } else {
            return this.money/2;
        }
    }

    isFinished(): boolean {
        return this.money <= 0 ||this.money >= this.money*5;
    }

    hitTarget(): boolean {
        return this.money >= this.money * 5
    }

    bankrupt(): boolean {
        return this.money <= 0;
    }


}

class StreakGambler extends Gambler {
    private minimum: number;
    private winMultiplier: number;
    private lossMultiplier: number;
    private target: number;
    private current: number;
    private win: boolean;
    

    constructor(
        name: string, 
        money: number, 
        initial: number, 
        minimum: number,
        winMultiplier: number,
        lossMultiplier: number,
        target: number,
        current: number,
        win: boolean,
        ) {
        super(name, money, initial)
        this.minimum = minimum;
        this.winMultiplier = winMultiplier;
        this. lossMultiplier = lossMultiplier;
        this.target = target;
        this.current = initial;
        this.win = win;
    }

    getBetSize(): number {
        if(this.win){
            this.current = Math.max(this.minimum, this.current * this.winMultiplier);
        } else{
            this.current = Math.max(this.minimum, this.current * this.lossMultiplier);
        }
        return this.current;
    }

    betAfterWin(): void {
        this.win = true;
    }

    betAfterLoss(): void {
        this.win = false;
    }

    isFinished(): boolean {
        return this.money <= 0 || this.money >= this.target;
    }

    hitTarget(): boolean {
        return this.money >= this.target;
    }

    bankrupt(): boolean {
        return this.money <= 0;
    }


}

class MartingaleGambler extends Gambler {
    private current: number;
    private win: boolean;
    constructor(name: string, money: number, initial: number, current: number, win: boolean) {
        super(name, money, initial)
        this.current = initial;
        this.win = win;
    }

    getBetSize(): number {
        if(this.win){
            this.current = this.current;
        } else {
            this.current = this.current*2;
        }
        if (this.current >= this.money){
            this.current = this.money;
        }
        return this.current;
    }

    betAfterWin(): void {
        this.win = true;
    }

    betAfterLoss(): void {
        this.win = false;
    }

    isFinished(): boolean {
        return this.money >= this.money*10 || this.money <= 0
    }

    hitTarget(): boolean {
        return this.money >= this.money*10
    }

    bankrupt(): boolean {
        return this.money <= 0
    }
    
}


//THIS IS THE GAME ABSTRACT CLASS DONT MISS IT!!!!!!!!!
abstract class Game {
    protected name: string;
    protected players: Gambler[] = [];
    protected casino: Casino;


    constructor(name: string, casino: Casino) {
        this.name = name;
        this.casino = casino;
    }

    abstract simulateGame(): void

    addPlayer(player: Gambler): void {
        this.players.push(player);
    }

    playGame(): void {
        this.simulateGame();
    }



}

class TailsIWin extends Game {
    constructor(casino: Casino) {
        super("Tails I Win", casino);
    }

    simulateGame(): void {

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

                if(player instanceof StreakGambler) { 
                    player.betAfterWin();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterWin();
                }
            } else {
                player.money -= betSize;

                this.casino.addProfit(betSize);

                console.log(`${player.name} loses. New balance: $${player.money.toFixed(2)}`);
                console.log(`${player.name} has lost ${betSize}`);

                if(player instanceof StreakGambler) { 
                    player.betAfterLoss();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterLoss();
                }
            }

            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves the casino.`);
            } else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt and leaves the casino.`);
            }
        }


        this.players = [];
    }

}

class GuessTheNumber extends Game {
    constructor(casino: Casino) {
        super("Guess the Number", casino)
    }

    simulateGame(): void {
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

                if(player instanceof StreakGambler) { 
                    player.betAfterWin();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterWin();
                }
            } else {
                const betSize = player.getBetSize();

                console.log(`${player.name} bets ${betSize}`);

                player.money -= betSize;

                this.casino.addProfit(betSize);

                console.log(`${player.name} loses and now has ${player.money}`);
                console.log(`${player.name} has lost ${betSize}`);

                if(player instanceof StreakGambler) { 
                    player.betAfterLoss();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterLoss();
                }
            }

            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves with ${player.money}`);
            } else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt.`);
            }
        }


        this.players = [];
    }

}

class OffTrackGuineaPigRacing extends Game {
    constructor(casino: Casino) {
        super("Guiea Pig Racing", casino)
    }

    simulateGame(): void {
        const payouts = [1.9, 3.8, 7.6, 7.6];

        let winningPig = -1;
        const random = Math.random();

        if (random < 0.50) { 
            winningPig = 0;
        } else if (random < 0.75) {
            winningPig = 1;
        } else if (random < 0.875) {
            winningPig = 2;
        } else {
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

                if(player instanceof StreakGambler) { 
                    player.betAfterWin();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterWin();
                }
            } else {
                const betSize = player.getBetSize();

                console.log(`${player.name} bets ${betSize}`);

                player.money -= betSize;

                this.casino.addProfit(betSize);

                console.log(`${player.name} loses and now has ${player.money}`);
                console.log(`${player.name} has lost ${betSize}`);

                if(player instanceof StreakGambler) { 
                    player.betAfterLoss();
                }
                if(player instanceof MartingaleGambler) { 
                    player.betAfterLoss();
                }
            }

            if (player.hitTarget()) {
                console.log(`${player.name} has hit their target and leaves with ${player.money}`);
            } else if (player.bankrupt()) {
                console.log(`${player.name} has gone bankrupt.`);
            }
        }

        this.players = [];
    }

}



class Casino {
    
    /** a list of games offered in the casino */
    private _games: Game[];      

    /** a set of guests to the casino */
    private _gamblers: Set<Gambler>;

    /** how much money the casino made today */
    private _profits: number; 

    /** the maximum number of rounds to play */
    private _maxRounds: number;
    private _currentRound: number;

    

    public constructor( maxRounds: number ) {
        this._games = [
            new TailsIWin( this),
            new GuessTheNumber( this),
            new OffTrackGuineaPigRacing( this ),
        ];

        this._profits = 0;

        this._gamblers = new Set([
            // Argument 2 is the amount they start with, 
            // Arg 3 is how much they bet
            new StableGambler( "Alice", 100, 15 ),

            // Argument 2 is the amount they start with
            // Arg 3 is how much they start betting
            // the target is to make 5 times their starting balance, but 
            // you don't see that here because it's calculated inside the 
            // constructor instead of being passed as an argument.
            new HighRiskGambler( "Bob", 50, 10 ),

            // Arg 4 is the minimum amount they will bet 
            // Arg 5 is how much they multiply their bet by when they win
            // Arg 6 is how much they multiply their bet by when they lose
            // Arg 7 is their target. How much they want to make. 
            // Arg 8 is if the player won or not
            new StreakGambler( "Camille", 200, 10, 10, 2, 0.5, 500, 10, false ),
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
    public addProfit( amount: number ): void {
        this._profits += amount;
    }

    /** For each game: have each gambler who is still present play.
     * Starts by printing how much money each gambler has. 
     * If a gambler runs out of money or hits their target, they leave.
     * Then, plays the game with all players.
     */
    public simulateOneRound(): void {
        const startingProfit = this._profits;

        console.log( "-----------------------" );
        console.log( "beginning round", this._currentRound );
        for( let game of this._games ) {
            this.determineWhoIsStillPlaying();

            // add each player who is still playing to the game.
            // have them use the bet size determined by their personality.
            for( let player of this._gamblers ) {
                if(!player.isFinished()){
                    game.addPlayer(player);
                }
            }

            const gameStartingProfit = this._profits;
            game.playGame();


            console.log( 
                "casino made", 
                this._profits - gameStartingProfit, "on this game.")
            console.log();
        }
        console.log( 
            "round complete. casino made: ", this._profits - startingProfit );
        console.log( "total profit:", this._profits );
        console.log( "-----------------------" );
    }

    /**
     * Run the simulation until either the maximum number of games is reached,
     * or no one is left in the casino.
     */
    public simulate(): void {
        while( this._currentRound < this._maxRounds && this._gamblers.size > 0 ) {
            this.simulateOneRound();
            console.log();
            this._currentRound++;
        }

        console.log( "simulation complete" );
    }

    /**
     * Update and list the people who are still playing.
     */
    private determineWhoIsStillPlaying() {
        const gamblersWhoLeft: Gambler[] = [];
        
        // update and list of who is still playing
        for( let gambler of this._gamblers.keys() ) {
            console.log( gambler.name, ": ", gambler.money );
            
            if( gambler.isFinished() ) {
                // add this person to the list of gamblers to remove.
                // don't remove it right away: removing an element from a 
                // collection that we are iterating over is usually a bad
                // idea.
                gamblersWhoLeft.push( gambler );
            }

            // now, print why the person left if they did so
            if( gambler.hitTarget() ) {
                console.log( 
                    gambler.name, 
                    "has hit their target! They leave the casino..."
                );
            }
            else if( gambler.bankrupt() ) {
                console.log( 
                    gambler.name,
                    "has gone bankrupt! They leave the casino..."
                );
            }
        }

        // remove the gamblers who left from the set
        for( let leaver of gamblersWhoLeft ) {
            this._gamblers.delete( leaver );
        }
    }
}



const MAX_N_ROUNDS = 5; 

  

// main: 

const casino = new Casino( MAX_N_ROUNDS ); 

  

casino.simulate(); 