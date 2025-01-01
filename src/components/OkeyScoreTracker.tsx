import React, { useState, useEffect } from 'react';
import { MinusCircle, Edit2, UserPlus, UserMinus, Plus, ChevronDown, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import okey51Logo from '../assets/logo.png';
import SparklesText from "@/components/ui/sparkles-text";
import { BorderBeam } from "./ui/border-beam";
import confetti from 'canvas-confetti';

interface Player {
  id: number;
  name: string;
  rounds: number[][];
  isEditing: boolean;
}

interface GameState {
  players: Player[];
  currentRound: number;
  expandedRounds: Record<string, boolean>;
  isGameEnded: boolean;
}

const STORAGE_KEY = 'okey-tracker-state';

const initialPlayers: Player[] = [
  { id: 1, name: 'Kerim', rounds: [[]], isEditing: false },
  { id: 2, name: 'Ozge', rounds: [[]], isEditing: false },
  { id: 3, name: 'John', rounds: [[]], isEditing: false }
];

const OkeyScoreTracker: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { players } = JSON.parse(savedState) as GameState;
      return players;
    }
    return initialPlayers;
  });

  const [currentRound, setCurrentRound] = useState<number>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { currentRound } = JSON.parse(savedState) as GameState;
      return currentRound;
    }
    return 0;
  });

  const [inputValues, setInputValues] = useState<Record<number, string>>({});
  const [expandedRounds, setExpandedRounds] = useState<Record<string, boolean>>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { expandedRounds } = JSON.parse(savedState) as GameState;
      return expandedRounds;
    }
    return {};
  });

  const [isGameEnded, setIsGameEnded] = useState<boolean>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const { isGameEnded } = JSON.parse(savedState) as GameState;
      return isGameEnded;
    }
    return false;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const gameState: GameState = {
      players,
      currentRound,
      expandedRounds,
      isGameEnded
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [players, currentRound, expandedRounds, isGameEnded]);

  const resetGame = () => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset all state to initial values
    setPlayers(initialPlayers.map(player => ({
      ...player,
      rounds: [[]]
    })));
    setCurrentRound(0);
    setInputValues({});
    setExpandedRounds({});
    setIsGameEnded(false);
  };

  const toggleRound = (playerId: number, roundIndex: number) => {
    setExpandedRounds(prev => ({
      ...prev,
      [`${playerId}-${roundIndex}`]: !prev[`${playerId}-${roundIndex}`]
    }));
  };

  const isRoundExpanded = (playerId: number, roundIndex: number) => {
    return expandedRounds[`${playerId}-${roundIndex}`] ?? (roundIndex === currentRound);
  };

  const addScore = (playerIndex: number, scoreStr: string) => {
    const score = parseInt(scoreStr, 10);
    if (isNaN(score)) return;

    const newPlayers = [...players];
    newPlayers[playerIndex].rounds[currentRound].push(score);
    setPlayers(newPlayers);
    setInputValues(prev => ({
      ...prev,
      [players[playerIndex].id]: ''
    }));
  };

  const removeLastScore = (playerIndex: number) => {
    setPlayers(prevPlayers => {
      const newPlayers = JSON.parse(JSON.stringify(prevPlayers));
      const currentRoundScores = newPlayers[playerIndex].rounds[currentRound];
      if (currentRoundScores.length > 0) {
        currentRoundScores.pop();
      }
      return newPlayers;
    });
  };

  const calculateRoundTotal = (scores: number[]): number => {
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const calculateGrandTotal = (player: Player): number => {
    return player.rounds.reduce((sum, round) => sum + calculateRoundTotal(round), 0);
  };

  const getCurrentWinner = (): Player | null => {
    if (!hasAnyScores()) return null;
    
    return players.reduce((winner, player) => {
      const playerTotal = calculateGrandTotal(player);
      const winnerTotal = winner ? calculateGrandTotal(winner) : Infinity;
      return playerTotal < winnerTotal ? player : winner;
    }, null as Player | null);
  };

  const startNewRound = () => {
    const newExpandedRounds: Record<string, boolean> = {};
    players.forEach(player => {
      player.rounds.forEach((_, index) => {
        newExpandedRounds[`${player.id}-${index}`] = false;
      });
    });
    players.forEach(player => {
      newExpandedRounds[`${player.id}-${currentRound + 1}`] = true;
    });
    setExpandedRounds(newExpandedRounds);

    setCurrentRound(prev => prev + 1);
    setPlayers(players.map(player => ({
      ...player,
      rounds: [...player.rounds, []]
    })));
    setInputValues({});
  };

  const toggleEditName = (playerId: number) => {
    setPlayers(players.map(player => ({
      ...player,
      isEditing: player.id === playerId ? !player.isEditing : player.isEditing
    })));
  };

  const updatePlayerName = (playerId: number, newName: string) => {
    setPlayers(players.map(player => ({
      ...player,
      name: player.id === playerId ? newName : player.name,
      isEditing: false
    })));
  };

  const hasAnyScores = (): boolean => {
    return players.some(player => 
      player.rounds.some(round => round.length > 0)
    );
  };

  const addPlayer = () => {
    if (hasAnyScores()) {
      // Could add a toast notification here if you want to show an error message
      return;
    }
    
    const newId = Math.max(...players.map(p => p.id)) + 1;
    const emptyRounds = Array(currentRound + 1).fill(null).map(() => []);
    setPlayers([...players, {
      id: newId,
      name: `Player ${newId}`,
      rounds: emptyRounds,
      isEditing: true
    }]);
  };

  const removePlayer = (playerId: number) => {
    setPlayers(players.filter(player => player.id !== playerId));
    setInputValues(prev => {
      const newValues = { ...prev };
      delete newValues[playerId];
      return newValues;
    });
  };

  const handleInputChange = (playerId: number, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const endGame = () => {
    setIsGameEnded(true);
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
 
    const frame = () => {
      if (Date.now() > end) return;
 
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });
 
      requestAnimationFrame(frame);
    };
 
    frame();
  };

  const getPlayerRankings = () => {
    return [...players].sort((a, b) => calculateGrandTotal(a) - calculateGrandTotal(b));
  };

  if (isGameEnded) {
    const winner = getCurrentWinner();
    const rankings = getPlayerRankings();
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <img 
            src={okey51Logo} 
            alt="Okey 51 Logo" 
            className="w-24 h-24"
          />
          <Button
            variant="outline"
            onClick={resetGame}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            New Game
          </Button>
        </div>
        
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
          <Trophy className="w-24 h-24 text-primary mb-4" />
          <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
            {winner?.name} wins!
          </span>
          <div className="mt-8 text-4xl font-bold text-primary">
            Final Score: {winner ? calculateGrandTotal(winner) : 0}
          </div>
          <div className="mt-6 space-y-2">
            {rankings.slice(1).map((player, index) => (
              <div key={player.id} className="text-center text-muted-foreground">
                <span className="text-lg">
                  {index + 2}. {player.name} - {calculateGrandTotal(player)}
                </span>
              </div>
            ))}
          </div>
          <BorderBeam size={250} duration={12} delay={9} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto" data-testid="score-tracker">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <img 
              src={okey51Logo} 
              alt="Okey 51 Logo" 
              className="w-24 h-24"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
                Score Tracker
              </h1>
              <div className="text-lg text-muted-foreground" data-testid="round-indicator">
                Round <span className="text-primary font-semibold">{currentRound + 1}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={addPlayer}
              disabled={hasAnyScores()}
              title={hasAnyScores() ? "Cannot add players after game has started" : "Add new player"}
              className="flex items-center gap-2 border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
              Add Player
            </Button>
            <Button 
              variant="outline" 
              onClick={startNewRound}
              className="flex items-center gap-2 border-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" />
              New Round
            </Button>
            <Button 
              variant="outline"
              onClick={endGame}
              className="flex items-center gap-2 border-primary hover:bg-primary/10"
              disabled={!hasAnyScores()}
            >
              <Trophy className="w-4 h-4" />
              End Game
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-6 backdrop-blur-sm bg-card/80 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-4">
              {players.map((player) => {
                const total = calculateGrandTotal(player);
                const isWinner = hasAnyScores() && player.id === getCurrentWinner()?.id;
                return (
                  <div key={player.id} className="text-center">
                    <div className="text-lg font-semibold text-primary flex items-center justify-center gap-2">
                      
                      {isWinner ? (
                        <SparklesText text={player.name} className='text-lg font-semibold text-primary flex items-center' sparklesCount={2}/>
                      ) : (
                        player.name
                      )}
                    </div>
                    <div className={`text-3xl font-bold ${isWinner ? 'text-primary' : ''}`}>
                      {total}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Player Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {players.map((player, playerIndex) => (
            <Card key={player.id} className="w-full backdrop-blur-sm bg-card/80 shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle>{player.isEditing ? (
                      <Input
                        className="w-full"
                        defaultValue={player.name}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            updatePlayerName(player.id, (e.target as HTMLInputElement).value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="text-primary truncate block">{player.name}</span>
                    )}</CardTitle>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEditName(player.id)}
                      className="hover:bg-primary/10"
                    >
                      <Edit2 className="w-4 h-4" data-testid="edit-icon" />
                    </Button>
                    {players.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(player.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Enter score (+ or -)"
                      value={inputValues[player.id] || ''}
                      onChange={(e) => handleInputChange(player.id, e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                          const value = (e.target as HTMLInputElement).value;
                          // Allow negative numbers by using the raw input value
                          addScore(playerIndex, value);
                        }
                      }}
                      className="w-full text-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => removeLastScore(playerIndex)}
                      className="flex items-center border-primary hover:bg-primary/10"
                      title="Remove last score"
                      disabled={players[playerIndex].rounds[currentRound].length === 0}
                    >
                      <MinusCircle className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {player.rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className="border border-primary/20 rounded-lg p-2">
                        <button 
                          onClick={() => toggleRound(player.id, roundIndex)}
                          className="w-full flex justify-between items-center text-sm text-muted-foreground hover:bg-primary/5 rounded p-1"
                        >
                          <span>Round {roundIndex + 1}</span>
                          <div className="flex items-center gap-2">
                            <span>Total: {calculateRoundTotal(round)}</span>
                            {isRoundExpanded(player.id, roundIndex) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </div>
                        </button>
                        {isRoundExpanded(player.id, roundIndex) && (
                          <div className="mt-2 space-y-1 pl-2">
                            {round.map((score, scoreIndex) => (
                              <div 
                                key={scoreIndex}
                                className={`text-lg ${score < 0 ? 'text-destructive' : 'text-primary'}`}
                              >
                                {score > 0 ? '+' : ''}{score}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OkeyScoreTracker; 