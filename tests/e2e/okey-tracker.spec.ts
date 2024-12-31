import { test, expect } from '@playwright/test';

test.describe('Okey Score Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be fully loaded
    await page.waitForSelector('[data-testid="score-tracker"]');
  });

  test('should have correct initial state', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Okey.*Score Tracker/);
    
    // Check initial players (using more specific selectors)
    const playerNames = await page.locator('.text-primary.truncate').allTextContents();
    expect(playerNames).toContain('Kerim');
    expect(playerNames).toContain('Ozge');
    expect(playerNames).toContain('John');
    
    // Check initial round (using data-testid)
    const roundIndicator = page.locator('[data-testid="round-indicator"]');
    await expect(roundIndicator).toContainText('Round 1');
  });

  test('should add scores correctly', async ({ page }) => {
    // Add a score for first player
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');

    // Check if score is displayed
    await expect(page.getByText('+51')).toBeVisible();
    
    // Check if total is updated
    await expect(page.getByText('51').first()).toBeVisible();
  });

  test('should remove last score', async ({ page }) => {
    // Add and then remove a score
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // Click remove button
    await page.getByTitle('Remove last score').first().click();
    
    // Check if score is removed
    await expect(page.getByText('+51')).not.toBeVisible();
  });

  test('should start new round', async ({ page }) => {
    // Add a score in first round
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // Wait for score to be added
    await expect(page.getByText('+51')).toBeVisible();
    
    // Start new round
    await page.getByRole('button', { name: 'New Round' }).click();
    
    // Wait for and check if round number is updated
    const roundIndicator = page.locator('[data-testid="round-indicator"]');
    await expect(roundIndicator).toContainText('Round 2');
  });

  test('should edit player name', async ({ page }) => {
    // Find and wait for edit button
    const editButton = page.getByRole('button').filter({ has: page.locator('svg[data-testid="edit-icon"]') }).first();
    await editButton.waitFor();
    await editButton.click();
    
    // Wait for input to be visible and focused
    const nameInput = page.getByRole('textbox');
    await nameInput.waitFor();
    
    // Type new name and press enter
    await nameInput.fill('New Name');
    await nameInput.press('Enter');
    
    // Wait for and check if name is updated (using more specific selector)
    await expect(page.locator('.text-primary.truncate >> text="New Name"')).toBeVisible();
  });

  test('should prevent adding players after game starts', async ({ page }) => {
    // Add a score to start the game
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // Check if Add Player button is disabled
    await expect(page.getByText('Add Player')).toBeDisabled();
  });

  test('should handle End Game button state correctly', async ({ page }) => {
    // End Game button should be disabled initially
    await expect(page.getByText('End Game')).toBeDisabled();
    
    // Add a score
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // End Game button should be enabled after adding score
    await expect(page.getByText('End Game')).toBeEnabled();
  });

  test('should end game and show winner', async ({ page }) => {
    // Add different scores to players
    const inputs = await page.getByPlaceholder('Enter score (+ or -)').all();
    
    // Add scores to create a clear winner
    await inputs[0].fill('51');
    await inputs[0].press('Enter');
    await inputs[1].fill('101');
    await inputs[1].press('Enter');
    await inputs[2].fill('151');
    await inputs[2].press('Enter');
    
    // End the game
    await page.getByText('End Game').click();
    
    // Check winner screen
    await expect(page.getByText(/wins!/)).toBeVisible();
    await expect(page.getByText('Final Score: 51')).toBeVisible();
    
    // Check rankings
    await expect(page.getByText('2.')).toBeVisible();
    await expect(page.getByText('3.')).toBeVisible();
  });

  test('should persist state after page reload', async ({ page }) => {
    // Add a score
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // Wait for state to be saved
    await page.waitForTimeout(100);
    
    // Reload page
    await page.reload();
    
    // Check if score persists
    await expect(page.getByText('+51')).toBeVisible();
  });


  test('should persist game ended state after reload', async ({ page }) => {
    // Add scores and end game
    const firstPlayerInput = page.getByPlaceholder('Enter score (+ or -)').first();
    await firstPlayerInput.fill('51');
    await firstPlayerInput.press('Enter');
    
    // Wait for state to be saved
    await page.waitForTimeout(100);
    
    await page.getByRole('button', { name: 'End Game' }).click();
    
    // Wait for state to be saved
    await page.waitForTimeout(100);
    
    // Reload page
    await page.reload();
    
    // New Game button should still be visible
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible();
  });
}); 