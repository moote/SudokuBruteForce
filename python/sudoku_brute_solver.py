import urllib.request
import xml.etree.ElementTree as ET
import pprint
from typing import List, Optional

# constant for board string length
GAME_STRING_LENGTH = 81

Board = List[List[int]]

def solve_sudoku(url: str):
    """Solves a Sudoku puzzle from an OpenSudoku XML file at the given URL.
    Prints the board before and after solving.
        Args:            url (str): The URL of the OpenSudoku XML file."""
  
    board: Board = []

    try:
        board = read_opensudoku_xml_from_url(url)
        print("Solving Sudoku from URL:", url)
        pprint.pp(board)
    except Exception as e:
        print("Error:", e)
    
    try:
        if do_solve_sudoku(board):
            print("\n\nSudoku solved successfully:")
            pprint.pp(board)
        else:
            print("No solution exists")
    except Exception as e:
        print("Error:", e)

def do_solve_sudoku(board: Board) -> bool:
    """Recursively solves the Sudoku puzzle using backtracking.
    Returns True if solved, False otherwise."""
    empty = find_empty(board)
    if not empty:
        return True  # Solved
    row, col = empty
    for num in range(1, 10):
        if is_num_allowed(board, row, col, num):
            board[row][col] = num
            if do_solve_sudoku(board):
                return True
            board[row][col] = 0
    return False

def find_empty(board: Board) -> Optional[tuple]:
    """Finds an empty cell in the Sudoku board.
    Returns the row and column of the first empty cell (0), or None if no empty cells are found."""
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:
                return (i, j)
    return None

def is_num_allowed(board: Board, row: int, col: int, num: int) -> bool:
    """Checks if a number can be placed in the specified cell without violating Sudoku rules.
    Returns True if the number can be placed, False otherwise."""
    # Check row and column
    if any(board[row][x] == num for x in range(9)):
        return False
    if any(board[y][col] == num for y in range(9)):
        return False
    # Check 3x3 box
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def read_opensudoku_xml_from_url(url: str, puzzle_to_open: int = 0) -> Board:
    """Reads a Sudoku board from an OpenSudoku XML file at the given URL.
    Returns a 9x9 board as a list of lists of integers."""
    with urllib.request.urlopen(url) as response:
        xml_data = response.read().decode('utf-8')
    root = ET.fromstring(xml_data)
    # Find all game board elements
    games = root.findall('game')
    if not games:
        raise ValueError("No game board elements found in the OpenSudoku XML file")

    # Check all game board elements have the 'data' attribute and is valid length
    for game in games:
        validate_game_elementent(game)
        validate_game_string(game.attrib['data'])
    
    # Select board automatically or via user input
    game_element = None
    if len(games) == 0:
        # If no game board elements are found, raise an error
        raise ValueError("No game board elements found in the OpenSudoku XML file")
    elif len(games) == 1:
        # If exactly one game board is found, use it
        print(f"Found 1 game board in file, using it...")
        game_element = games[0]
    else:
        # If multiple game boards are found get user input to select a game board, unless puzzle_to_open is > -1
        if puzzle_to_open == 0:
            while True:
                try:
                    choice = int(input(f"Found {len(games)} game boards(s), please select one (1-{len(games)}): "))
                    if 1 <= choice <= len(games):
                        print(f"Selected game board {choice}")
                        break
                    else:
                        print(f"Invalid choice, please select a number between 1 and {len(games)}")
                except ValueError:
                    print("Invalid input, please enter a number")
            game_element = games[choice - 1]  # Select the chosen game board
        else:
            if puzzle_to_open < 1 or puzzle_to_open > len(games):
                raise ValueError(f"Invalid puzzle number {puzzle_to_open}, must be between 1 and {len(games)}")
            game_element = games[puzzle_to_open - 1]
    
    return game_string_to_board(game_element.attrib['data'])

def game_string_to_board(game_string: str) -> Board:
    """Converts a string representation of a Sudoku board into a 9x9 list of lists."""
    validate_game_string(game_string)
    return [[int(game_string[i * 9 + j]) for j in range(9)] for i in range(9)]

# Validators

def validate_game_elementent(game_element: ET.Element):
    """Validates that the game element exists and has a 'data' attribute."""
    if game_element is None or 'data' not in game_element.attrib:
        raise ValueError("Game element missing 'data' attribute")

def validate_game_string(game_string: str):
    """Validates that the board string length and content, exceptions raised on error."""
    if len(game_string) != GAME_STRING_LENGTH:
        raise ValueError(f"Invalid game string length: {len(game_string)} (expected {GAME_STRING_LENGTH})")
    if not all(c in '0123456789' for c in game_string):
        raise ValueError("Invalid characters in game string, must be digits 0-9")

# Example usage:
if __name__ == "__main__":
    url = "https://opensudoku.moire.org/opensudoku/very_hard.opensudoku"  # Replace with a valid OpenSudoku XML URL
    solve_sudoku(url)
    # Note: The URL should point to a valid OpenSudoku XML file containing a Sudoku puzzle.