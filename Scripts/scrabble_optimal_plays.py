import itertools

LETTER_SCORES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
}

# Standard 15x15 Scrabble board multiplier positions (0-indexed row, col)
_TW = {(0,0),(0,7),(0,14),(7,0),(7,14),(14,0),(14,7),(14,14)}
_DW = {(1,1),(2,2),(3,3),(4,4),(10,10),(11,11),(12,12),(13,13),
       (13,1),(12,2),(11,3),(10,4),(1,13),(2,12),(3,11),(4,10),(7,7)}
_TL = {(1,5),(1,9),(5,1),(5,5),(5,9),(5,13),
       (9,1),(9,5),(9,9),(9,13),(13,5),(13,9)}
_DL = {(0,3),(0,11),(2,6),(2,8),(3,0),(3,7),(3,14),
       (6,2),(6,6),(6,8),(6,12),(7,3),(7,11),
       (8,2),(8,6),(8,8),(8,12),(11,0),(11,7),(11,14),
       (12,6),(12,8),(14,3),(14,11)}


def square_type(r, c):
    p = (r, c)
    if p in _TW: return 'TW'
    if p in _DW: return 'DW'
    if p in _TL: return 'TL'
    if p in _DL: return 'DL'
    return ''


def score_placement(word, start_r, start_c, direction, anchor_indices):
    """
    Score a word placement accounting for board multipliers.
    anchor_indices: set of positions in the word already on the board —
                    those tiles get no letter premium, and their squares'
                    word premiums are already spent.
    """
    word_mult = 1
    letter_total = 0
    for i, letter in enumerate(word):
        r = start_r if direction == 'H' else start_r + i
        c = start_c + i if direction == 'H' else start_c
        if not (0 <= r < 15 and 0 <= c < 15):
            return -1
        base = LETTER_SCORES.get(letter, 0)
        sq = square_type(r, c)
        if i in anchor_indices:
            letter_total += base
        elif sq == 'TL':
            letter_total += base * 3
        elif sq == 'DL':
            letter_total += base * 2
        elif sq == 'DW':
            letter_total += base
            word_mult *= 2
        elif sq == 'TW':
            letter_total += base
            word_mult *= 3
        else:
            letter_total += base
    return letter_total * word_mult


def load_dictionary(filepath):
    try:
        with open(filepath, 'r') as f:
            return set(w.strip().upper() for w in f)
    except FileNotFoundError:
        print(f"Error: dictionary not found at {filepath}")
        return set()


def find_best_plays(rack, anchor_positions, valid_words):
    """
    anchor_positions: list of (letter, row, col) tuples for board anchors.
    Returns plays sorted by best board score (with multipliers applied).
    """
    rack = rack.upper()
    possible_plays = []
    seen_words = set()

    # Standalone words — report base score only (no board position known)
    for length in range(2, len(rack) + 1):
        for combo in itertools.permutations(rack, length):
            word = ''.join(combo)
            if word not in valid_words or word in seen_words:
                continue
            seen_words.add(word)
            base = sum(LETTER_SCORES.get(c, 0) for c in word)
            if length == 7:
                base += 50
            possible_plays.append((word, base, 'Standalone (base score)'))

    # Anchored words — try all valid placements, report best multiplied score
    for anchor_letter, anchor_r, anchor_c in anchor_positions:
        anchor_letter = anchor_letter.upper()
        pool = rack + anchor_letter

        for length in range(2, len(pool) + 1):
            for combo in itertools.permutations(pool, length):
                word = ''.join(combo)
                if anchor_letter not in word or word not in valid_words or word in seen_words:
                    continue
                seen_words.add(word)

                best_score = 0
                best_info = ''

                for anchor_idx in [j for j, ch in enumerate(word) if ch == anchor_letter]:
                    for direction in ['H', 'V']:
                        sr = anchor_r if direction == 'H' else anchor_r - anchor_idx
                        sc = anchor_c - anchor_idx if direction == 'H' else anchor_c
                        end_r = sr if direction == 'H' else sr + length - 1
                        end_c = sc + length - 1 if direction == 'H' else sc
                        if sr < 0 or sc < 0 or end_r >= 15 or end_c >= 15:
                            continue

                        s = score_placement(word, sr, sc, direction, {anchor_idx})
                        if s < 0:
                            continue
                        tiles_used = length - 1
                        if tiles_used == 7:
                            s += 50
                        if s > best_score:
                            best_score = s
                            arrow = '→' if direction == 'H' else '↓'
                            best_info = (f"({sr},{sc}){arrow}  "
                                         f"['{anchor_letter}'@({anchor_r},{anchor_c}) idx={anchor_idx}]")

                if best_score > 0:
                    possible_plays.append((word, best_score,
                        f"Hook '{anchor_letter}'@({anchor_r},{anchor_c})  best: {best_info}"))

    possible_plays.sort(key=lambda x: x[1], reverse=True)
    return possible_plays


if __name__ == '__main__':
    DICTIONARY_FILE = 'words.txt'

    # Your current rack
    RACK = 'TNONTGR'

    # --- Board anchor positions (letter, row, col) — 0-indexed from top-left ---
    # Update these to match the exact positions on your board.
    # Row 0 = top, Col 0 = left.  Verify by cross-referencing multiplier squares:
    #   TW (red)  at corners + midpoints: (0,0)(0,7)(0,14)(7,0)(7,14)(14,0)(14,7)(14,14)
    #   DW (pink) diagonals + center star: (1,1)(2,2)(3,3)(4,4)(7,7)(10,4)(11,3)(12,2)(13,1) etc.
    #   TL (dark blue): (1,5)(1,9)(5,1)(5,5)(5,9)(5,13)(9,1)(9,5)(9,9)(9,13)(13,5)(13,9)
    #   DL (light blue): (7,3)(7,11)(8,2)(8,6)(8,8)(8,12) etc.
    ANCHOR_POSITIONS = [
        # WISH  (row 5: W-I-S-H at cols 0-3)
        ('H', 5, 3),

        # DARKLY  (row 7: D-A-R-K-L-Y at cols 3-8;  L sits on DW center at (7,7)? or K?)
        ('Y', 7, 8),   # end of DARKLY — regular square
        ('D', 7, 3),   # start of DARKLY — DL square (already used)

        # HOMIES  (row 9: H-O-M-I-E-S at cols 3-8;  M on TL at (9,5))
        ('H', 9, 3),
        ('S', 9, 8),
        ('I', 9, 6),

        # VULPINE  (row 11: V-U-L-P-I-N-E at cols 1-7;  L on DW at (11,3), E on DL at (11,7))
        ('E', 11, 7),
        ('I', 11, 5),

        # CARAVANS  (row 13: C-A-R-A-V-A-N-S at cols 3-10;  R on TL (13,5), N on TL (13,9))
        ('S', 13, 10),
        ('A', 13, 4),
        ('A', 13, 6),

        # QUIRE  (row 14: Q-U-I-R-E at cols 0-4;  Q on TW (14,0), R on DL (14,3))
        ('E', 14, 4),
    ]
    # -----------------------------------------------------------------------

    dictionary = load_dictionary(DICTIONARY_FILE)
    if not dictionary:
        print('Using fallback dummy dictionary.\n')
        dictionary = {'TONG', 'TORN', 'GROT', 'GROTS', 'TONGS', 'THONG', 'THRONG',
                      'NORTH', 'THORN', 'STRONG', 'TROTH', 'TRON', 'GORY', 'GYRON',
                      'ROTTING', 'GROTTO', 'GROTTY', 'NOTING', 'TONING', 'INGOT',
                      'SNORT', 'INTRO', 'GROIN', 'TONER', 'TENOR', 'ROTTEN', 'GOTTEN'}

    print(f'Rack: {RACK}')
    print(f'Anchors: {[(a,r,c) for a,r,c in ANCHOR_POSITIONS]}')
    print()
    print('Note: scores include board multipliers for new tiles only.')
    print('Positions are estimated — verify against your actual board.')
    print()

    plays = find_best_plays(RACK, ANCHOR_POSITIONS, dictionary)

    print('TOP 20 PLAYS (by board score with multipliers):')
    print('-' * 72)
    print(f"{'WORD':<10} {'SCORE':>5}   PLACEMENT")
    print('-' * 72)
    for word, score, info in plays[:20]:
        print(f'{word:<10} {score:>5}   {info}')
