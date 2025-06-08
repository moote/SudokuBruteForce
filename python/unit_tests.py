import unittest
from sudoku_brute_solver import (
    do_solve_sudoku,
    find_empty,
    is_num_allowed,
    read_opensudoku_xml_from_url
)

class TestSudokuBruteSolver(unittest.TestCase):
    def test_is_num_allowed(self):
        board = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ]
        self.assertTrue(is_num_allowed(board, 0, 2, 1))
        self.assertFalse(is_num_allowed(board, 0, 2, 3))
        self.assertFalse(is_num_allowed(board, 0, 2, 5))

    def test_find_empty(self):
        board = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 4, 5, 6, 7, 8, 9, 1],
            [5, 6, 7, 8, 9, 1, 2, 3, 4],
            [8, 9, 1, 2, 3, 4, 5, 6, 7],
            [3, 4, 5, 6, 7, 8, 9, 1, 2],
            [6, 7, 8, 9, 1, 2, 3, 4, 5],
            [9, 1, 2, 3, 4, 5, 6, 7, 0]
        ]
        self.assertEqual(find_empty(board), (8, 8))
        board[8][8] = 8
        self.assertIsNone(find_empty(board))

    def test_do_solve_sudoku(self):
        board = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ]
        self.assertTrue(do_solve_sudoku(board))
        # Check that the board is solved (no zeros)
        for row in board:
            self.assertNotIn(0, row)

    def test_read_opensudoku_xml_from_url_invalid(self):
        # This test expects an exception for an invalid URL or invalid XML
        with self.assertRaises(Exception):
            read_opensudoku_xml_from_url("https://example.com/invalid.xml")

    def test_read_opensudoku_xml_from_url_valid(self):
        # This test expects a valid open sudoku file with 100 puzzles
        url = "https://opensudoku.moire.org/opensudoku/very_hard.opensudoku"
        try:
            board = read_opensudoku_xml_from_url(url, 1)
            self.assertIsInstance(board, list)
            self.assertEqual(len(board), 9)
            for row in board:
                self.assertEqual(len(row), 9)
        except Exception as e:
            self.fail(f"read_opensudoku_xml_from_url raised an exception: {e}")

if __name__ == "__main__":
    unittest.main()