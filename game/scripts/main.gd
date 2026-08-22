extends Node2D

const FighterScene = preload("res://scripts/fighter.gd")

var fighters: Array[Fighter] = []
var player: Fighter
var battle_time := 0.0
var arena_pulse := 0.0
var info_label: Label
var status_label: Label

func _ready() -> void:
    randomize()
    _create_fighters()
    _create_ui()
    queue_redraw()

func _create_fighters() -> void:
    var allies := ["Nova", "Rift", "Kairo"]
    var enemies := ["Vex", "Mori", "Ruin"]

    for i in range(3):
        var f: Fighter = FighterScene.new()
        add_child(f)
        f.position = Vector2(250 + i * 115, 570)
        f.arena_floor = 570.0
        f.setup(0, i, allies[i], i == 0)
        fighters.append(f)
        if i == 0:
            player = f

    for i in range(3):
        var e: Fighter = FighterScene.new()
        add_child(e)
        e.position = Vector2(1030 - i * 115, 570)
        e.arena_floor = 570.0
        e.setup(1, i, enemies[i], false)
        fighters.append(e)

    _assign_targets()

func _assign_targets() -> void:
    for f in fighters:
        if not is_instance_valid(f) or f.hp <= 0.0:
            continue
        var candidates: Array[Fighter] = []
        for other in fighters:
            if is_instance_valid(other) and other.team != f.team and other.hp > 0.0:
                candidates.append(other)
        if candidates.is_empty():
            f.target = null
            continue
        candidates.sort_custom(func(a: Fighter, b: Fighter) -> bool:
            return f.global_position.distance_squared_to(a.global_position) < f.global_position.distance_squared_to(b.global_position)
        )
        f.target = candidates[0]

func _create_ui() -> void:
    var layer := CanvasLayer.new()
    add_child(layer)

    info_label = Label.new()
    info_label.position = Vector2(28, 18)
    info_label.add_theme_font_size_override("font_size", 22)
    info_label.add_theme_color_override("font_color", Color("#eaf7ff"))
    layer.add_child(info_label)

    status_label = Label.new()
    status_label.position = Vector2(28, 48)
    status_label.add_theme_font_size_override("font_size", 15)
    status_label.add_theme_color_override("font_color", Color("#8fe8ff"))
    status_label.text = "BLUE: A/D move • SPACE jump • J attack • K cursed skill • L ultimate"
    layer.add_child(status_label)

    var controls := HBoxContainer.new()
    controls.position = Vector2(28, 625)
    controls.add_theme_constant_override("separation", 10)
    layer.add_child(controls)
    _add_button(controls, "◀", "move_left", Vector2(78, 62))
    _add_button(controls, "▶", "move_right", Vector2(78, 62))
    _add_button(controls, "JUMP", "jump", Vector2(92, 62))

    var attacks := HBoxContainer.new()
    attacks.position = Vector2(880, 625)
    attacks.add_theme_constant_override("separation", 10)
    layer.add_child(attacks)
    _add_button(attacks, "ATTACK", "attack", Vector2(100, 62))
    _add_button(attacks, "SKILL", "skill", Vector2(92, 62))
    _add_button(attacks, "ULT", "ultimate", Vector2(82, 62))

func _add_button(parent: Control, text: String, action: String, size: Vector2) -> void:
    var b := Button.new()
    b.text = text
    b.custom_minimum_size = size
    b.add_theme_font_size_override("font_size", 15)
    b.button_down.connect(func() -> void: Input.action_press(action))
    b.button_up.connect(func() -> void: Input.action_release(action))
    parent.add_child(b)

func _process(delta: float) -> void:
    battle_time += delta
    arena_pulse += delta
    _assign_targets()

    var alive_a := 0
    var alive_b := 0
    for f in fighters:
        if f.hp > 0.0:
            if f.team == 0:
                alive_a += 1
            else:
                alive_b += 1

    info_label.text = "CURSED CLASH 3V3   •   BLUE %d  VS  RED %d   •   %02d:%02d" % [alive_a, alive_b, int(battle_time) / 60, int(battle_time) % 60]
    if alive_a == 0 or alive_b == 0:
        status_label.text = "BATTLE COMPLETE • Press the run button to restart"
    elif is_instance_valid(player) and player.hp > 0.0:
        status_label.text = "NOVA • Mana %03d%% • K Skill • L Ultimate" % int(player.mana)
    else:
        status_label.text = "NOVA DOWN • Your team is still fighting"
    queue_redraw()

func _draw() -> void:
    var t := arena_pulse
    draw_rect(Rect2(0, 0, 1280, 720), Color("#050713"))

    # Deep layered arena atmosphere.
    for i in range(9):
        var y := 90.0 + i * 54.0
        var alpha := 0.035 + float(i) * 0.006
        draw_line(Vector2(0, y), Vector2(1280, y - 35), Color(0.20, 0.48, 0.75, alpha), 2.0)
    draw_circle(Vector2(640, 300), 330.0 + sin(t * 1.2) * 8.0, Color(0.16, 0.05, 0.30, 0.18))
    draw_circle(Vector2(640, 300), 245.0 + sin(t * 1.7) * 5.0, Color(0.02, 0.26, 0.42, 0.14))

    # Distant ruined silhouettes.
    for x in range(0, 1280, 90):
        var h := 45.0 + float((x * 17) % 120)
        draw_rect(Rect2(x, 570 - h, 55, h), Color(0.025, 0.035, 0.07, 0.95))
        draw_rect(Rect2(x + 12, 570 - h + 12, 8, 16), Color(0.25, 0.65, 0.85, 0.12))

    # Arena floor.
    draw_rect(Rect2(0, 570, 1280, 150), Color("#0b1020"))
    draw_rect(Rect2(0, 570, 1280, 5), Color("#38dfff"))
    for x in range(-80, 1360, 80):
        draw_line(Vector2(x, 570), Vector2(x + 55, 720), Color(0.15, 0.55, 0.78, 0.10), 2.0)
    for x in range(0, 1280, 160):
        draw_line(Vector2(x, 650), Vector2(x + 160, 650), Color(0.32, 0.55, 0.90, 0.08), 1.0)

    # Large central cursed sigil and rotating rings.
    var center := Vector2(640, 570)
    draw_arc(center, 190.0, PI, TAU, 96, Color(0.20, 0.85, 1.0, 0.16), 3.0)
    draw_arc(center, 140.0, PI, TAU, 96, Color(0.95, 0.15, 0.50, 0.13), 2.0)
    draw_arc(center, 90.0, PI, TAU, 64, Color(0.65, 0.30, 1.0, 0.14), 2.0)
    for i in range(8):
        var a := t * 0.25 + TAU * float(i) / 8.0
        var p1 := center + Vector2(cos(a), sin(a) * 0.35) * 110.0
        var p2 := center + Vector2(cos(a), sin(a) * 0.35) * 165.0
        draw_line(p1, p2, Color(0.35, 0.88, 1.0, 0.10), 2.0)

    # Energy particles in the air.
    for i in range(32):
        var px := fmod(float(i * 197) + t * (12.0 + i % 5), 1280.0)
        var py := 120.0 + fmod(float(i * 71), 420.0)
        var pulse := 0.20 + 0.12 * sin(t * 2.0 + i)
        draw_circle(Vector2(px, py), 1.5 + (i % 3), Color(0.35, 0.80, 1.0, pulse))
