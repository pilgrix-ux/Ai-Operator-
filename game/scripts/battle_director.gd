extends Node

# Match director: team switching, cinematic hit-stop, pause, and victory state.
# Designed for Godot Android and desktop keyboard testing.

var match_over := false
var switched := 0
var pause_panel: Panel
var result_panel: Panel
var result_title: Label
var result_subtitle: Label
var banner: Label
var banner_time := 0.0
var slow_time := 0.0
var last_alive_a := 3
var last_alive_b := 3

func _ready() -> void:
    _build_overlay()

func _process(delta: float) -> void:
    var battle = get_parent()
    if not battle:
        return
    banner_time = max(banner_time - delta, 0.0)
    slow_time = max(slow_time - delta, 0.0)
    if banner_time <= 0.0 and is_instance_valid(banner):
        banner.visible = false

    if Input.is_action_just_pressed("switch_fighter"):
        _switch_to_next()

    var alive_a := 0
    var alive_b := 0
    for f in battle.fighters:
        if is_instance_valid(f) and f.hp > 0.0:
            if f.team == 0:
                alive_a += 1
            else:
                alive_b += 1
    if alive_a < last_alive_a or alive_b < last_alive_b:
        if alive_a < last_alive_a:
            _combat_banner("ALLY DOWN", Color("#58dfff"))
        else:
            _combat_banner("ENEMY DOWN", Color("#ff5b86"))
    last_alive_a = alive_a
    last_alive_b = alive_b

    if not match_over and (alive_a == 0 or alive_b == 0):
        match_over = true
        _show_result(alive_a > 0)

    if slow_time > 0.0:
        Engine.time_scale = 0.18
    elif Engine.time_scale != 1.0:
        Engine.time_scale = 1.0

func _switch_to_next() -> void:
    var battle = get_parent()
    var current = battle.player
    if not is_instance_valid(current):
        return
    var candidates: Array = []
    for f in battle.fighters:
        if is_instance_valid(f) and f.team == 0 and f.hp > 0.0:
            candidates.append(f)
    if candidates.size() < 2:
        return
    var idx := candidates.find(current)
    idx = (idx + 1) % candidates.size()
    current.is_player = false
    battle.player = candidates[idx]
    battle.player.is_player = true
    battle.player.facing = 1.0 if battle.player.global_position.x < 640.0 else -1.0
    switched += 1
    _combat_banner("CONTROL: " + battle.player.display_name, Color("#8cf2ff"))

func _build_overlay() -> void:
    var layer := CanvasLayer.new()
    layer.layer = 30
    add_child(layer)

    banner = Label.new()
    banner.position = Vector2(430, 82)
    banner.add_theme_font_size_override("font_size", 34)
    banner.add_theme_color_override("font_color", Color.WHITE)
    banner.visible = false
    layer.add_child(banner)

    var pause := Button.new()
    pause.text = "Ⅱ"
    pause.position = Vector2(1195, 18)
    pause.custom_minimum_size = Vector2(58, 50)
    pause.add_theme_font_size_override("font_size", 24)
    pause.pressed.connect(_toggle_pause)
    layer.add_child(pause)

    var switch_button := Button.new()
    switch_button.text = "SWITCH"
    switch_button.position = Vector2(1030, 18)
    switch_button.custom_minimum_size = Vector2(150, 50)
    switch_button.add_theme_font_size_override("font_size", 16)
    switch_button.pressed.connect(_switch_to_next)
    layer.add_child(switch_button)

    pause_panel = Panel.new()
    pause_panel.position = Vector2(450, 190)
    pause_panel.size = Vector2(380, 300)
    pause_panel.visible = false
    layer.add_child(pause_panel)
    var pause_title := Label.new()
    pause_title.text = "BATTLE PAUSED"
    pause_title.position = Vector2(65, 40)
    pause_title.add_theme_font_size_override("font_size", 30)
    pause_panel.add_child(pause_title)
    var resume := Button.new()
    resume.text = "RESUME"
    resume.position = Vector2(85, 115)
    resume.size = Vector2(210, 55)
    resume.pressed.connect(_toggle_pause)
    pause_panel.add_child(resume)
    var restart := Button.new()
    restart.text = "RESTART BATTLE"
    restart.position = Vector2(85, 185)
    restart.size = Vector2(210, 55)
    restart.pressed.connect(_restart)
    pause_panel.add_child(restart)

    result_panel = Panel.new()
    result_panel.position = Vector2(370, 150)
    result_panel.size = Vector2(540, 380)
    result_panel.visible = false
    layer.add_child(result_panel)
    result_title = Label.new()
    result_title.position = Vector2(95, 65)
    result_title.add_theme_font_size_override("font_size", 54)
    result_panel.add_child(result_title)
    result_subtitle = Label.new()
    result_subtitle.position = Vector2(70, 140)
    result_subtitle.add_theme_font_size_override("font_size", 20)
    result_panel.add_child(result_subtitle)
    var again := Button.new()
    again.text = "FIGHT AGAIN"
    again.position = Vector2(165, 240)
    again.size = Vector2(210, 62)
    again.pressed.connect(_restart)
    result_panel.add_child(again)

func _combat_banner(text: String, c: Color) -> void:
    if not is_instance_valid(banner):
        return
    banner.text = text
    banner.add_theme_color_override("font_color", c)
    banner.visible = true
    banner_time = 0.75
    slow_time = 0.10

func _show_result(win: bool) -> void:
    if is_instance_valid(result_panel):
        result_panel.visible = true
        result_title.text = "VICTORY" if win else "DEFEAT"
        result_title.add_theme_color_override("font_color", Color("#67e9ff") if win else Color("#ff5b78"))
        result_subtitle.text = "Your squad conquered the arena." if win else "The cursed squad has fallen."
    Engine.time_scale = 0.0

func _toggle_pause() -> void:
    if match_over:
        return
    var paused := get_tree().paused
    get_tree().paused = not paused
    if is_instance_valid(pause_panel):
        pause_panel.visible = not paused

func _restart() -> void:
    Engine.time_scale = 1.0
    get_tree().paused = false
    get_tree().reload_current_scene()
