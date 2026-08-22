extends Node2D

const FighterScene = preload("res://game/scripts/fighter.gd")
var fighters: Array[Fighter] = []
var player: Fighter
var camera_shake := 0.0
var battle_time := 0.0
var info_label: Label

func _ready() -> void:
    randomize()
    _create_fighters()
    _create_ui()
    queue_redraw()

func _create_fighters() -> void:
    var names := ["Nova", "Rift", "Kairo"]
    for i in range(3):
        var f := FighterScene.new()
        add_child(f)
        f.position = Vector2(300 + i * 80, 570)
        f.arena_floor = 570.0
        f.setup(0, i, names[i], i == 0)
        fighters.append(f)
        if i == 0:
            player = f

    var enemy_names := ["Vex", "Mori", "Ruin"]
    for i in range(3):
        var e := FighterScene.new()
        add_child(e)
        e.position = Vector2(980 - i * 80, 570)
        e.arena_floor = 570.0
        e.setup(1, i, enemy_names[i], false)
        fighters.append(e)

    _assign_targets()

func _assign_targets() -> void:
    for f in fighters:
        var candidates := fighters.filter(func(x): return x.team != f.team and x.hp > 0.0)
        if not candidates.is_empty():
            candidates.sort_custom(func(a,b): return a.global_position.distance_to(f.global_position) < b.global_position.distance_to(f.global_position))
            f.target = candidates[0]

func _create_ui() -> void:
    var layer := CanvasLayer.new()
    add_child(layer)

    info_label = Label.new()
    info_label.position = Vector2(30, 24)
    info_label.add_theme_font_size_override("font_size", 22)
    info_label.text = "3V3 CURSED CLASH  •  A/D MOVE  SPACE JUMP  J ATTACK  K SKILL  L ULT"
    layer.add_child(info_label)

    var controls := HBoxContainer.new()
    controls.position = Vector2(35, 625)
    controls.add_theme_constant_override("separation", 12)
    layer.add_child(controls)
    _add_button(controls, "◀", "move_left")
    _add_button(controls, "▶", "move_right")
    _add_button(controls, "JUMP", "jump")

    var attacks := HBoxContainer.new()
    attacks.position = Vector2(900, 610)
    attacks.add_theme_constant_override("separation", 10)
    layer.add_child(attacks)
    _add_button(attacks, "ATTACK", "attack")
    _add_button(attacks, "SKILL", "skill")
    _add_button(attacks, "ULT", "ultimate")

func _add_button(parent: Control, text: String, action: String) -> void:
    var b := Button.new()
    b.text = text
    b.custom_minimum_size = Vector2(100, 64)
    b.add_theme_font_size_override("font_size", 16)
    b.button_down.connect(func(): Input.action_press(action))
    b.button_up.connect(func(): Input.action_release(action))
    parent.add_child(b)

func _process(delta: float) -> void:
    battle_time += delta
    _assign_targets()
    var alive_a := fighters.filter(func(f): return f.team == 0 and f.hp > 0).size()
    var alive_b := fighters.filter(func(f): return f.team == 1 and f.hp > 0).size()
    info_label.text = "3V3 CURSED CLASH   |   BLUE %d   VS   RED %d   |   %02d:%02d" % [alive_a, alive_b, int(battle_time) / 60, int(battle_time) % 60]
    queue_redraw()

func _draw() -> void:
    # Arena background
    draw_rect(Rect2(0,0,1280,720), Color("#090b18"))
    for i in range(10):
        var y := 80.0 + i * 55.0
        draw_line(Vector2(0,y), Vector2(1280,y), Color(0.2,0.3,0.5,0.10), 1.0)
    draw_circle(Vector2(640, 310), 300.0, Color(0.15,0.08,0.30,0.25))
    draw_circle(Vector2(640, 310), 210.0, Color(0.05,0.25,0.38,0.16))

    # Floor and energy lines
    draw_rect(Rect2(0,570,1280,150), Color("#111528"))
    draw_line(Vector2(0,570), Vector2(1280,570), Color("#5ee7ff"), 3.0)
    for x in range(0,1280,80):
        draw_line(Vector2(x,570), Vector2(x+35,720), Color(0.3,0.7,1.0,0.10), 2.0)

    # Center sigil
    draw_arc(Vector2(640,570), 180, PI, TAU, 64, Color(0.4,0.8,1.0,0.18), 3.0)
    draw_arc(Vector2(640,570), 120, PI, TAU, 64, Color(1.0,0.2,0.5,0.12), 2.0)
