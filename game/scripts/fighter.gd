class_name Fighter
extends CharacterBody2D

var team: int = 0
var fighter_id: int = 0
var display_name: String = "Fighter"
var hp: float = 100.0
var max_hp: float = 100.0
var mana: float = 100.0
var target: Fighter
var is_player := false
var attack_cd := 0.0
var skill_cd := 0.0
var hit_flash := 0.0
var dash_time := 0.0
var facing := 1.0
var arena_floor := 570.0
var gravity := 1500.0
var jump_force := -650.0
var effects: Array = []

func setup(p_team: int, p_id: int, p_name: String, player_control := false) -> void:
    team = p_team
    fighter_id = p_id
    display_name = p_name
    is_player = player_control
    max_hp = 100.0 + p_id * 8.0
    hp = max_hp
    mana = 100.0
    queue_redraw()

func _physics_process(delta: float) -> void:
    attack_cd = max(attack_cd - delta, 0.0)
    skill_cd = max(skill_cd - delta, 0.0)
    hit_flash = max(hit_flash - delta, 0.0)
    dash_time = max(dash_time - delta, 0.0)
    mana = min(mana + delta * 4.0, 100.0)

    if hp <= 0.0:
        velocity = Vector2.ZERO
        queue_redraw()
        return

    if not is_on_floor():
        velocity.y += gravity * delta
    else:
        velocity.y = 0.0

    if is_player:
        _player_control()
    else:
        _ai_control(delta)

    if dash_time > 0.0:
        velocity.x = facing * 1150.0
    move_and_slide()
    global_position.y = min(global_position.y, arena_floor)
    queue_redraw()

func _player_control() -> void:
    var axis := Input.get_axis("move_left", "move_right")
    velocity.x = move_toward(velocity.x, axis * 360.0, 180.0)
    if abs(axis) > 0.1:
        facing = sign(axis)
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_force
    if Input.is_action_just_pressed("attack"):
        basic_attack()
    if Input.is_action_just_pressed("skill"):
        cursed_skill()
    if Input.is_action_just_pressed("ultimate"):
        ultimate()

func _ai_control(delta: float) -> void:
    if not is_instance_valid(target) or target.hp <= 0.0:
        return
    var distance := target.global_position.x - global_position.x
    facing = sign(distance) if abs(distance) > 4.0 else facing
    if abs(distance) > 150.0:
        velocity.x = facing * 220.0
    else:
        velocity.x = move_toward(velocity.x, 0.0, 500.0)
        if attack_cd <= 0.0 and randf() < delta * 3.0:
            basic_attack()
        if skill_cd <= 0.0 and mana >= 35.0 and randf() < delta * 0.9:
            cursed_skill()

func basic_attack() -> void:
    if attack_cd > 0.0:
        return
    attack_cd = 0.38
    _spawn_slash(55.0, 1.0)
    if is_instance_valid(target) and abs(target.global_position.x - global_position.x) < 125.0:
        target.take_damage(8.0, global_position.x)

func cursed_skill() -> void:
    if skill_cd > 0.0 or mana < 35.0:
        return
    skill_cd = 2.2
    mana -= 35.0
    _spawn_slash(145.0, 2.8)
    if is_instance_valid(target) and abs(target.global_position.x - global_position.x) < 300.0:
        target.take_damage(24.0, global_position.x)
        target.velocity.x = facing * 480.0

func ultimate() -> void:
    if mana < 100.0:
        return
    mana = 0.0
    _spawn_slash(320.0, 8.0)
    if is_instance_valid(target) and abs(target.global_position.x - global_position.x) < 520.0:
        target.take_damage(55.0, global_position.x)
        target.velocity.x = facing * 900.0

func take_damage(amount: float, source_x: float) -> void:
    hp = max(hp - amount, 0.0)
    hit_flash = 0.14
    velocity.x = sign(global_position.x - source_x) * 260.0
    effects.append({"type":"hit","time":0.22,"pos":Vector2.ZERO})
    queue_redraw()

func _spawn_slash(size: float, power: float) -> void:
    effects.append({"type":"slash","time":0.25,"size":size,"power":power})
    queue_redraw()

func _process(delta: float) -> void:
    for e in effects:
        e.time -= delta
    effects = effects.filter(func(e): return e.time > 0.0)
    queue_redraw()

func _draw() -> void:
    var body_col := Color("#59d8ff") if team == 0 else Color("#ff4f78")
    if hit_flash > 0.0:
        body_col = Color.WHITE

    # Aura
    draw_circle(Vector2(0, -55), 45.0, Color(body_col, 0.10))
    draw_circle(Vector2(0, -55), 32.0, Color(body_col, 0.08))

    # Stick fighter
    draw_circle(Vector2(0, -105), 18.0, body_col)
    draw_line(Vector2(0, -87), Vector2(0, -45), body_col, 9.0, true)
    draw_line(Vector2(0, -75), Vector2(-28 * facing, -55), body_col, 7.0, true)
    draw_line(Vector2(0, -75), Vector2(28 * facing, -55), body_col, 7.0, true)
    draw_line(Vector2(0, -45), Vector2(-22, -5), body_col, 8.0, true)
    draw_line(Vector2(0, -45), Vector2(22, -5), body_col, 8.0, true)

    # Energy core
    draw_circle(Vector2(0, -67), 7.0, Color("#ffffff"))
    draw_circle(Vector2(0, -67), 12.0, Color(body_col, 0.22))

    # HP bar
    var bar_w := 90.0
    draw_rect(Rect2(-bar_w / 2.0, -140, bar_w, 7), Color(0.05,0.05,0.08,0.9))
    draw_rect(Rect2(-bar_w / 2.0, -140, bar_w * hp / max_hp, 7), body_col)
    draw_string(ThemeDB.fallback_font, Vector2(-32,-150), display_name, HORIZONTAL_ALIGNMENT_CENTER, 64, 12, Color.WHITE)

    for e in effects:
        if e.type == "slash":
            var alpha: float = clamp(e.time / 0.25, 0.0, 1.0)
            var radius: float = e.size * (1.0 - alpha * 0.25)
            for i in range(4):
                var a := -0.8 + i * 0.25
                var p1 := Vector2(10 * facing, -75) + Vector2(cos(a), sin(a)) * 15.0
                var p2 := Vector2(10 * facing, -75) + Vector2(cos(a), sin(a)) * radius
                draw_line(p1, p2, Color(0.65,0.9,1.0,alpha), 7.0 * e.power / 3.0, true)
        elif e.type == "hit":
            var alpha: float = clamp(e.time / 0.22, 0.0, 1.0)
            for i in range(8):
                var a := TAU * float(i) / 8.0
                var p := Vector2(cos(a), sin(a)) * (28.0 * (1.0-alpha))
                draw_line(Vector2.ZERO, p, Color(1.0,0.85,0.25,alpha), 4.0, true)
