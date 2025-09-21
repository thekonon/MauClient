from PIL import Image, ImageDraw, ImageFont

# Card dimensions
card_width, card_height = 600, 900

# Load a font
try:
    font = ImageFont.truetype("arial.ttf", 160)
except:
    font = ImageFont.load_default()

symbol_shift = (150, 120)
border_radius = 80
border_thickness = 10

symbol_size_top_bot = 60


# Utility: cubic Bezier interpolation
def cubic_bezier(p0, p1, p2, p3, steps=30):
    points = []
    for t in [i / steps for i in range(steps + 1)]:
        x = (
            (1 - t) ** 3 * p0[0]
            + 3 * (1 - t) ** 2 * t * p1[0]
            + 3 * (1 - t) * t**2 * p2[0]
            + t**3 * p3[0]
        )
        y = (
            (1 - t) ** 3 * p0[1]
            + 3 * (1 - t) ** 2 * t * p1[1]
            + 3 * (1 - t) * t**2 * p2[1]
            + t**3 * p3[1]
        )
        points.append((x, y))
    return points


# Function to draw a heart with Bezier curves
def draw_heart(draw, x, y, size, color=(255, 0, 0, 255)):
    half = size / 2
    top = y - half * 0.6  # higher top dip
    bottom = y + half
    left = x - half
    right = x + half

    # Left half curve
    p0 = (x, y)  # bottom tip
    p1 = (x + half, y - half*0.8)  # outward bulge
    p2 = (x + size*0.8, y + half*0.8)  # upper lobe
    p3 = (x, y + size)  # top middle dip
    left_curve = cubic_bezier(p0, p1, p2, p3)

    # Left half curve
    p0 = (x, y)  # bottom tip
    p1 = (x - half, y - half*0.8)  # outward bulge
    p2 = (x - size*0.8, y + half*0.8)  # upper lobe
    p3 = (x, y + size)  # top middle dip
    right_curve = cubic_bezier(p0, p1, p2, p3)

    heart_path = left_curve+right_curve
    draw.polygon(
        heart_path,
        fill=color,
    )


def draw_diamond(draw, x, y, size, color=(255, 0, 0, 255)):
    """Draw a red diamond"""
    modifier = 0.7
    half = size / 2
    points = [
        (x, y - half),  # top
        (x + half * modifier, y),  # right
        (x, y + half),  # bottom
        (x - half * modifier, y),  # left
    ]
    draw.polygon(points, fill=color)


def draw_spade(draw, x, y, size, color=(0, 0, 0, 255)):
    """Draw a black spade"""
    top_curve_radius = size * 0.25
    bottom_point_y = y + size * 0.5
    left_x = x - size * 0.5
    right_x = x + size * 0.5
    top_y = y - size * 0.25

    # Top two circles (like heart top)
    draw.ellipse((left_x, top_y, x, top_y + top_curve_radius * 2), fill=color)
    draw.ellipse((x, top_y, right_x, top_y + top_curve_radius * 2), fill=color)

    # Bottom triangle (point down)
    draw.polygon(
        [
            (left_x, top_y + top_curve_radius),
            (right_x, top_y + top_curve_radius),
            (x, bottom_point_y),
        ],
        fill=color,
    )

    # Small stem
    stem_width = size * 0.2
    stem_height = size * 0.3
    draw.polygon(
        [
            (x - stem_width / 2, bottom_point_y),
            (x + stem_width / 2, bottom_point_y),
            (x, bottom_point_y + stem_height),
        ],
        fill=color,
    )


def draw_club(draw, x, y, size, color=(0, 0, 0, 255)):
    """Draw a black club"""
    circle_radius = size * 0.3
    bottom_point_y = y + size * 0.4

    # Three circles
    draw.ellipse(
        (
            x - circle_radius,
            y - circle_radius * 1.5,
            x + circle_radius,
            y - circle_radius * 0.5,
        ),
        fill=color,
    )  # top
    draw.ellipse(
        (
            x - circle_radius * 1.3,
            y - circle_radius * 0.2,
            x - circle_radius * 0.3,
            y + circle_radius * 0.8,
        ),
        fill=color,
    )  # left
    draw.ellipse(
        (
            x + circle_radius * 0.3,
            y - circle_radius * 0.2,
            x + circle_radius * 1.3,
            y + circle_radius * 0.8,
        ),
        fill=color,
    )  # right

    # Stem
    stem_width = size * 0.2
    stem_height = size * 0.3
    draw.polygon(
        [
            (x - stem_width / 2, bottom_point_y),
            (x + stem_width / 2, bottom_point_y),
            (x, bottom_point_y + stem_height),
        ],
        fill=color,
    )


def generate_card(number, shape_function=draw_heart, name="", color=(200, 0, 0, 255)):
    # Create transparent card
    img = Image.new("RGBA", (card_width, card_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw white card background with rounded corners
    draw.rounded_rectangle(
        [(0, 0), (card_width, card_height)],
        radius=border_radius,
        fill=(255, 255, 255, 255),  # white card
        outline=color,  # red border
        width=border_thickness,
    )

    # Top-left number and heart
    draw.text((40, 40), str(number), font=font, fill=color)
    shape_function(draw, *symbol_shift, symbol_size_top_bot)

    # Bottom-right number and heart (rotated)
    temp = Image.new("RGBA", (card_width, card_height), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp)
    temp_draw.text((40, 40), str(number), font=font, fill=color)
    shape_function(temp_draw, *symbol_shift, symbol_size_top_bot)
    rotated = temp.rotate(180)
    img.alpha_composite(rotated)

    # Define heart patterns for 7–10
    # Each inner list is a row, numbers are x positions offsets
    # 0 = center, -offset = left, +offset = right
    offset = 100
    patterns = {
        7: [[0], [-offset, offset], [0], [-offset, offset], [0]],
        8: [
            [0],
            [-offset, offset],
            [0 - offset * 2, offset * 2],
            [-offset, offset],
            [0],
        ],
        9: [
            [0],
            [-offset, offset],
            [-offset * 2, 0, offset * 2],
            [-offset, offset],
            [0],
        ],
        10: [
            [0],
            [-offset, offset],
            [-offset, offset],
            [-offset, offset],
            [-offset, offset],
            [0],
        ],
    }

    # Vertical positions for rows (evenly spaced within middle 60% of card)
    rows = len(patterns[number])
    top_margin = card_height * 0.2
    bottom_margin = card_height * 0.2
    usable_height = card_height - top_margin - bottom_margin

    row_y_positions = [
        top_margin + (i + 0.5) * (usable_height / rows) for i in range(rows)
    ]

    # Draw hearts according to pattern
    for y, row in zip(row_y_positions, patterns[number]):
        for x_offset in row:
            x = card_width // 2 + x_offset
            shape_function(draw, x, y, 100)

    # Save the card
    filename = f"public/assets/pythonGen/{name[0].capitalize()}{number}.png"
    img.save(filename)
    print(f"Card saved as '{filename}'")


def generate_face_card(
    letter, shape_function=draw_heart, name="", color=(200, 0, 0, 255)
):

    local_symbol_shift = (symbol_shift[0] + 50, symbol_shift[1])
    # Create transparent card
    img = Image.new("RGBA", (card_width, card_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw white card background with rounded corners

    draw.rounded_rectangle(
        [(0, 0), (card_width, card_height)],
        radius=border_radius,
        fill=(255, 255, 255, 255),  # white card
        outline=color,
        width=border_thickness,
    )

    # Top-left letter and shape
    draw.text((40, 40), letter, font=font, fill=color)
    shape_function(draw, *local_symbol_shift, symbol_size_top_bot)

    # Bottom-right letter and shape (rotated)
    temp = Image.new("RGBA", (card_width, card_height), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp)
    temp_draw.text((40, 40), letter, font=font, fill=color)
    shape_function(temp_draw, *local_symbol_shift, symbol_size_top_bot)
    rotated = temp.rotate(180)
    img.alpha_composite(rotated)

    # Print the letter in the center (big)
    center_font_size = 400
    try:
        center_font = ImageFont.truetype("arial.ttf", center_font_size)
    except:
        center_font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), letter, font=center_font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]

    draw.text(
        ((card_width - w) / 2, (card_height - h) / 2),
        letter,
        font=center_font,
        fill=color,
    )
    draw.text(
        ((card_width - w) / 2, (card_height - h) / 2),
        letter,
        font=center_font,
        fill=color,
    )

    # Save the card
    filename = f"public/assets/pythonGen/{name[0].capitalize()}{letter}.png"
    img.save(filename)
    print(f"Face card saved as '{filename}'")


# Generate cards from 7 to 10
letters = ["J", "Q", "K", "A"]
shape_functions = [
    (draw_heart, (255, 0, 0, 255), "heart"),
    # (draw_club, (0, 0, 0, 255), "club"),
    # (draw_diamond, (255, 0, 0, 255), "diamond"),
    # (draw_spade, (0, 0, 0, 255), "spade"),
]

for shape in shape_functions:
    for num in range(7, 11):
        generate_card(num, shape_function=shape[0], name=shape[2], color=shape[1])
    for letter in letters:
        generate_face_card(
            letter, shape_function=shape[0], name=shape[2], color=shape[1]
        )
