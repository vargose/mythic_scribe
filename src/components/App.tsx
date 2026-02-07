import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { GameState } from '../game/types.js';
import { loadGameState, saveGameState } from '../game/storage.js';
import { processCommand } from '../game/commands.js';
import { CommandHistory } from '../utils/commandHistory.js';

const commandHistory = new CommandHistory();

export function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const { exit } = useApp();

  // Load game state on mount
  useEffect(() => {
    loadGameState().then(loadedState => {
      setState(loadedState);
      setMessages([
        'Welcome, Scribe, to the World of Eldoria!',
        'Your task is to document the creatures and lore of this land.',
        'Choose your path wisely, for danger lurks in the shadows.',
        "Type 'help' for a list of commands.",
        '',
      ]);
    });
  }, []);

  // Handle keyboard input
  useInput((inputChar: string, key: any) => {
    if (!state) return;

    if (key.return) {
      // Submit command
      const command = input.trim();
      if (command) {
        commandHistory.add(command);

        const result = processCommand(command, state);
        setState(result.newState);
        setMessages(prev => [...prev, `> ${command}`, ...result.messages, '']);

        // Save state after each command
        saveGameState(result.newState).catch(err => {
          console.error('Failed to save game:', err);
        });

        // Exit if requested
        if (result.shouldExit) {
          setTimeout(() => exit(), 100);
        }
      }
      setInput('');
    } else if (key.upArrow) {
      // Navigate history up
      commandHistory.previous();
      setInput(commandHistory.getCurrent());
    } else if (key.downArrow) {
      // Navigate history down
      commandHistory.next();
      setInput(commandHistory.getCurrent());
    } else if (key.backspace || key.delete) {
      // Handle backspace
      setInput(prev => prev.slice(0, -1));
    } else if (inputChar && !key.ctrl && !key.meta) {
      // Add character to input
      setInput(prev => prev + inputChar);
    }
  });

  if (!state) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box flexDirection="column" height="100%">
      {/* Game Log */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden" paddingX={1}>
        {messages.slice(-30).map((msg, i) => (
          <Text key={i}>{msg}</Text>
        ))}
      </Box>

      {/* Command Input */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text>
          <Text color="green">&gt; </Text>
          <Text>{input}</Text>
          <Text inverse> </Text>
        </Text>
      </Box>
    </Box>
  );
}
