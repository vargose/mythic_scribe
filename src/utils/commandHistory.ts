/**
 * Command history manager for up/down arrow navigation
 */
export class CommandHistory {
  private history: string[] = [];
  private currentIndex: number = -1;

  /**
   * Add a command to history
   * Skips empty and duplicate consecutive commands
   */
  add(command: string): void {
    const trimmed = command.trim();

    // Skip empty commands
    if (!trimmed) {
      return;
    }

    // Skip duplicate consecutive commands
    if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
      return;
    }

    this.history.push(trimmed);
    this.currentIndex = this.history.length; // Reset to end
  }

  /**
   * Navigate to previous command (up arrow)
   */
  previous(): void {
    if (this.history.length === 0) {
      return;
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  /**
   * Navigate to next command (down arrow)
   */
  next(): void {
    if (this.currentIndex < this.history.length) {
      this.currentIndex++;
    }
  }

  /**
   * Get current command in history
   * Returns empty string if at end or no history
   */
  getCurrent(): string {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return '';
  }
}
