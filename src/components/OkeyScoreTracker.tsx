import React, { useState, useEffect } from 'react';
import { MinusCircle, Edit2, UserPlus, UserMinus, Plus, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import okey51Logo from '../assets/logo.png';

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
}

const STORAGE_KEY = 'okey-tracker-state';

const initialPlayers: Player[] = [
  { id: 1, name: 'Ozge', rounds: [[]], isEditing: false },
  { id: 2, name: 'John', rounds: [[]], isEditing: false },
  { id: 3, name: 'Kerim', rounds: [[]], isEditing: false }
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const gameState: GameState = {
      players,
      currentRound,
      expandedRounds
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [players, currentRound, expandedRounds]);

  const resetGame = () => {
    setPlayers(initialPlayers);
    setCurrentRound(0);
    setInputValues({});
    setExpandedRounds({});
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

  const addScore = (playerIndex: number, score: string) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].rounds[currentRound].push(Number(score));
    setPlayers(newPlayers);
    setInputValues(prev => ({
      ...prev,
      [players[playerIndex].id]: ''
    }));
  };

  const removeLastScore = (playerIndex: number) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].rounds[currentRound].pop();
    setPlayers(newPlayers);
  };

  const calculateRoundTotal = (scores: number[]): number => {
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const calculateGrandTotal = (player: Player): number => {
    return player.rounds.reduce((sum, round) => sum + calculateRoundTotal(round), 0);
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

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id)) + 1;
    const emptyRounds = Array(currentRound + 1).fill([]).map(() => []);
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <img 
              src={okey51Logo} 
              alt="Okey 51 Logo" 
              className="w-24 h-24"
            />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground">
              Score Tracker
            </h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={addPlayer}
              className="flex items-center gap-2 border-primary hover:bg-primary/10"
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
              variant="destructive" 
              onClick={resetGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </Button>
          </div>
        </div>

        <Card className="mb-6 backdrop-blur-sm bg-card/80 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4">
              {players.map((player) => (
                <div key={player.id} className="text-center">
                  <div className="text-lg font-semibold text-primary">{player.name}</div>
                  <div className="text-3xl font-bold">
                    {calculateGrandTotal(player)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {players.map((player, playerIndex) => (
          <Card key={player.id} className="w-full backdrop-blur-sm bg-card/80 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{player.isEditing ? (
                  <Input
                    className="w-40"
                    defaultValue={player.name}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        updatePlayerName(player.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="text-primary">{player.name}</span>
                )}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEditName(player.id)}
                    className="hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4" />
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
                    placeholder="Enter score"
                    value={inputValues[player.id] || ''}
                    onChange={(e) => handleInputChange(player.id, e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        addScore(playerIndex, (e.target as HTMLInputElement).value);
                      }
                    }}
                    className="w-full text-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => removeLastScore(playerIndex)}
                    className="flex items-center border-primary hover:bg-primary/10"
                    title="Remove last score"
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
  );
};

export default OkeyScoreTracker; 