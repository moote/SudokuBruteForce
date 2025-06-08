import { doSolveSudoku, findEmpty, isNumAllowed, gameStringToBoard, Board } from '../src/index'

// import jest
import { describe, test, expect } from '@jest/globals';

describe('Sudoku Solver', () => {
    test('isNumAllowed works correctly', () => {
        const board: Board = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
        expect(isNumAllowed(board, 0, 2, 1)).toBe(true);
        expect(isNumAllowed(board, 0, 2, 3)).toBe(false);
        expect(isNumAllowed(board, 0, 2, 5)).toBe(false);
    });

    test('findEmpty finds the first empty cell', () => {
        const board: Board = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 0]
        ];
        expect(findEmpty(board)).toEqual([8, 8]);
        board[8][8] = 8;
        expect(findEmpty(board)).toBeUndefined();
    });

    test('doSolveSudoku solves a valid puzzle', () => {
        const board: Board = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
        expect(doSolveSudoku(board)).toBe(true);
        // Check that the board is solved (no zeros)
        for (const row of board) {
            expect(row).not.toContain(0);
        }
    });

    test('gameStringToBoard returns a valid 9x9 board', () => {
        const gameString = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
        const board = gameStringToBoard(gameString);
        expect(board.length).toBe(9);
        for (const row of board) {
            expect(row.length).toBe(9);
            for (const cell of row) {
                expect(typeof cell).toBe('number');
                expect(cell).toBeGreaterThanOrEqual(0);
                expect(cell).toBeLessThanOrEqual(9);
            }
        }
    });
});