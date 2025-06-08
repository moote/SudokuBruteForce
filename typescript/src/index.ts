import * as https from 'https';
import { parseStringPromise } from 'xml2js';

const GAME_STRING_LENGTH = 81;

export type Board = number[][];

/**
 * Solves a Sudoku puzzle from an OpenSudoku XML file at the given URL.
 * Prints the board before and after solving.
 */
export async function solveSudoku(url: string, puzzleToOpen: number = 0): Promise<void> {
    try {
        const board = await readOpenSudokuXmlFromUrl(url, puzzleToOpen);
        console.log("Solving Sudoku from URL:", url);
        printBoard(board);
        if (doSolveSudoku(board)) {
            console.log("\n\nSudoku solved successfully:");
            printBoard(board);
        } else {
            console.log("No solution exists");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

/**
 * Recursively solves the Sudoku puzzle using backtracking.
 * Returns true if solved, false otherwise.
 */
export function doSolveSudoku(board: Board): boolean {
    const empty = findEmpty(board);
    if (!empty) return true; // Solved
    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
        if (isNumAllowed(board, row, col, num)) {
            board[row][col] = num;
            if (doSolveSudoku(board)) return true;
            board[row][col] = 0;
        }
    }
    return false;
}

/**
 * Finds an empty cell in the Sudoku board.
 * Returns the row and column of the first empty cell (0), or undefined if no empty cells are found.
 */
export function findEmpty(board: Board): [number, number] | undefined {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return undefined;
}

/**
 * Checks if a number can be placed in the specified cell without violating Sudoku rules.
 * Returns true if the number can be placed, false otherwise.
 */
export function isNumAllowed(board: Board, row: number, col: number, num: number): boolean {
    // Check row and column
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
    }
    // Check 3x3 box
    const startRow = 3 * Math.floor(row / 3);
    const startCol = 3 * Math.floor(col / 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

/**
 * Reads a Sudoku board from an OpenSudoku XML file at the given URL.
 * Returns a 9x9 board as a 2D array of numbers.
 */
export async function readOpenSudokuXmlFromUrl(url: string, puzzleToOpen: number = 0): Promise<Board> {
    const xmlData = await fetchUrl(url);
    const result = await parseStringPromise(xmlData);
    // Find all <game> elements
    const games = result && result['opensudoku'] && result['opensudoku']['game']
        ? result['opensudoku']['game']
        : result['game'] || [];
    if (!games || games.length === 0) {
        throw new Error("No game board elements found in the OpenSudoku XML file");
    }
    // Validate all game elements
    for (const game of games) {
        validateGameElement(game);
        validateGameString(game.$.data);
    }
    // Select board automatically or via user input
    let gameElement: any;
    if (games.length === 1) {
        console.log(`Found 1 game board in file, using it...`);
        gameElement = games[0];
    } else {
        if (puzzleToOpen === 0) {
            // In Node.js, no prompt by default; just use the first one for simplicity
            console.log(`Found ${games.length} game boards, using the first one (override with puzzleToOpen param)`);
            gameElement = games[0];
        } else {
            if (puzzleToOpen < 1 || puzzleToOpen > games.length) {
                throw new Error(`Invalid puzzle number ${puzzleToOpen}, must be between 1 and ${games.length}`);
            }
            gameElement = games[puzzleToOpen - 1];
        }
    }
    return gameStringToBoard(gameElement.$.data);
}

/**
 * Converts a string representation of a Sudoku board into a 9x9 array.
 */
export function gameStringToBoard(gameString: string): Board {
    validateGameString(gameString);
    const board: Board = [];
    for (let i = 0; i < 9; i++) {
        const row: number[] = [];
        for (let j = 0; j < 9; j++) {
            row.push(Number(gameString[i * 9 + j]));
        }
        board.push(row);
    }
    return board;
}

// Validators

function validateGameElement(gameElement: any) {
    if (!gameElement || !gameElement.$ || typeof gameElement.$.data !== 'string') {
        throw new Error("Game element missing 'data' attribute");
    }
}

function validateGameString(gameString: string) {
    if (gameString.length !== GAME_STRING_LENGTH) {
        throw new Error(`Invalid game string length: ${gameString.length} (expected ${GAME_STRING_LENGTH})`);
    }
    if (!/^[0-9]{81}$/.test(gameString)) {
        throw new Error("Invalid characters in game string, must be digits 0-9");
    }
}

/**
 * Helper function to fetch data from a URL (HTTPS).
 */
function fetchUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

/**
 * Utility function to print the board to the console.
 */
function printBoard(board: Board) {
    for (const row of board) {
        console.log(row.join(' '));
    }
}

// Example usage:
if (require.main === module) {
    const url = "https://opensudoku.moire.org/opensudoku/very_hard.opensudoku"; // Replace with a valid OpenSudoku XML URL
    solveSudoku(url);
}