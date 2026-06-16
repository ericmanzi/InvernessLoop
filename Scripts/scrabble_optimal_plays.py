import itertools

# Standard Scrabble tile values
LETTER_SCORES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
}


def load_dictionary(filepath):
    """Loads a text file of valid Scrabble words into a set."""
    try:
        with open(filepath, 'r') as file:
            return set(word.strip().upper() for word in file)
    except FileNotFoundError:
        print(f"Error: Could not find dictionary file at {filepath}")
        print("Please download a word list (e.g., sowpods.txt) and update the path.")
        return set()


def calculate_score(word, tiles_used_from_rack):
    """Calculates the base score of a word, including the 50-point bingo bonus."""
    score = sum(LETTER_SCORES.get(char, 0) for char in word)
    if tiles_used_from_rack == 7:
        score += 50
    return score


def find_best_plays(rack, anchor_letters, valid_words):
    """
    Finds all valid words using the rack and ONE anchor letter from the board.
    Does not account for double/triple word/letter multipliers or cross-checks.
    """
    rack = rack.upper()
    anchor_letters = [a.upper() for a in anchor_letters]
    possible_plays = []
    seen_words = set()

    # Test standalone words (just the rack, no anchor)
    for i in range(2, len(rack) + 1):
        for combo in itertools.permutations(rack, i):
            word = "".join(combo)
            if word in valid_words and word not in seen_words:
                seen_words.add(word)
                score = calculate_score(word, len(word))
                possible_plays.append((word, score, "Standalone"))

    # Test words hooked onto a board anchor
    for anchor in anchor_letters:
        pool = rack + anchor
        for i in range(2, len(pool) + 1):
            for combo in itertools.permutations(pool, i):
                word = "".join(combo)
                if anchor in word and word in valid_words and word not in seen_words:
                    seen_words.add(word)
                    # Tiles used from rack is total word length minus the 1 anchor tile
                    tiles_used = len(word) - 1
                    score = calculate_score(word, tiles_used)
                    possible_plays.append((word, score, f"Hooked to '{anchor}'"))

    possible_plays.sort(key=lambda x: x[1], reverse=True)
    return possible_plays


if __name__ == "__main__":
    # --- SETUP: CHANGE THESE VALUES ---
    DICTIONARY_FILE = "words.txt"  # Create this file or download a wordlist
    RACK = "AAEFINS"               # Your current tiles
    BOARD_ANCHORS = ["M", "U"]     # Open letters on the board you can build off of
    # ----------------------------------

    dictionary = load_dictionary(DICTIONARY_FILE)
    if not dictionary:
        print("Using fallback dummy dictionary for demonstration purposes...\n")
        dictionary = {"FAINES", "INFUSE", "AM", "SAFE", "FAME", "AN", "IN", "SIN", "FINES", "SANE"}

    print(f"Your Rack: {RACK}")
    print(f"Board Anchors: {BOARD_ANCHORS}\n")
    print("Finding optimal plays...\n")

    plays = find_best_plays(RACK, BOARD_ANCHORS, dictionary)

    if not plays:
        print("No valid plays found.")
    else:
        print("TOP 10 PLAYS:")
        print("-" * 40)
        print(f"{'WORD':<15} | {'SCORE':<7} | {'TYPE'}")
        print("-" * 40)
        for word, score, play_type in plays[:10]:
            print(f"{word:<15} | {score:<7} | {play_type}")
