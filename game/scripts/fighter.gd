class_name Fighter
extends CharacterBody2D

var team: int = 0
var fighter_id: int = 0
var display_name := "Fighter"
var hp := 100.0
var max_hp := 100.0
var mana := 100.0
var target: Fighter
var is_player := false
var attack_cd := 0.0
var skill_cd := 0.0
var ultimate_cd := 0.0
var combo_step := 0
var combo_timer := 0.0
var hit_flash := 0.0
var hurt_time := 0.0
var dash_time := 0.0
var dash_cd := 0.0
var ai_think := 0.0
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
    max_hp = 125.0 + p_id * 12.0
    hp = max_hp
    mana = 100.0
    queue_redraw()

func _physics_process(delta: float) -> void:
    attack_cd = max(attack_cd - delta, 0.0)
    skill_cd = max(skill_cd - delta, 0.0)
    ultimate_cd = max(ultimate_cd - delta, 0.0)
    combo_timer = max(combo_timer - delta, 0.0)
    hit_flash = max(hit_flash - delta, 0.0)
    hurt_time = max(hurt_time - delta, 0.0)
    dash_time = max(dash_time - delta, 0.0)
    dash_cd = max(dash_cd - delta, 0.0)
    mana = min(mana + delta * 5.0, 100.0)

    if combo_timer <= 0.0:
        combo_step = 0

    if hp <= 0.0:
        velocity = Vector2.ZERO
        queue_redraw()
        return

    if not is_on_floor():
        velocity.y += gravity * delta
    else:
        velocity.y = 0.0

    if hurt_time <= 0.0:
        if is_player:
            _player_control()
        else:
            _ai_control(delta)

    if dash_time > 0.0:
        velocity.x = facing * 1050.0
    move_and_slide()
    global_position.x = clamp(global_position.x, 90.0, 1190.0)
    global_position.y = min(global_position.y, arena_floor)
    queue_redraw()

func _player_control() -> void:
    var axis := Input.get_axis("move_left", "move_right")
    velocity.x = move_toward(velocity.x, axis * 390.0, 210.0)
    if abs(axis) > 0.1:
        facing = sign(axis)
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_force
        _burst(Vector2(0, 0), Color("#64e8ff"), 18.0, 0.20)
    if Input.is_action_just_pressed("attack"):
        basic_attack()
    if Input.is_action_just_pressed("skill"):
        cursed_skill()
    if Input.is_action_just_pressed("ultimate"):
        ultimate()

func _ai_control(delta: float) -> void:
    ai_think -= delta
    if not is_instance_valid(target) or target.hp <= 0.0:
        velocity.x = move_toward(velocity.x, 0.0, 500.0)
        return
    if ai_think > 0.0:
        return
    ai_think = randf_range(0.06, 0.16)

    var distance := target.global_position.x - global_position.x
    var abs_distance := abs(distance)
    facing = sign(distance) if abs_distance > 5.0 else facing

    # Smart spacing: close the gap, but don't stand inside the opponent.
    if abs_distance > 170.0:
        velocity.x = facing * (245.0 + fighter_id * 20.0)
        if randf() < 0.07 and dash_cd <= 0.0:
            _dash_toward_target()
    elif abs_distance < 72.0:
        velocity.x = -facing * 95.0
        if randf() < 0.10 and dash_cd <= 0.0:
            _dash_toward_target()
    else:
        velocity.x = move_toward(velocity.x, 0.0, 650.0)

    # Reactions: jump over pressure and sometimes evade projectiles/skills.
    if is_on_floor() and randf() < 0.025:
        velocity.y = jump_force * 0.82
    if hurt_time <= 0.0:
        if attack_cd <= 0.0 and abs_distance < 135.0 and randf() < 0.48:
            basic_attack()
        elif skill_cd <= 0.0 and mana >= 35.0 and abs_distance < 340.0 and randf() < 0.32:
            cursed_skill()
        elif mana >= 100.0 and ultimate_cd <= 0.0 and abs_distance < 540.0 and randf() < 0.22:
            ultimate()

func _dash_toward_target() -> void:
    dash_cd = 1.2
    dash_time = 0.16
    _burst(Vector2(0, -55), Color("#b76cff") if team == 1 else Color("#54eaff"), 28.0, 0.22)

func basic_attack() -> void:
    if attack_cd > 0.0 or hurt_time > 0.0:
        return
    attack_cd = 0.30
    combo_step = (combo_step % 3) + 1
    combo_timer = 0.70
    var damage := 8.0 + combo_step * 2.0
    var reach := 120.0 + combo_step * 10.0
    _spawn_slash(reach, 1.0 + combo_step * 0.25, combo_step)
    if _target_in_range(reach):
        target.take_damage(damage, global_position.x)
        target.velocity.x = facing * (220.0 + combo_step * 55.0)
        _impact(target.global_position, Color("#fff0a6"), 24.0 + combo_step * 8.0)

func cursed_skill() -> void:
    if skill_cd > 0.0 or mana < 35.0 or hurt_time > 0.0:
        return
    skill_cd = 2.0
    mana -= 35.0
    var energy_color := Color("#ff7a36") if team == 0 else Color("#b45cff")
    _spawn_energy_wave(energy_color, 290.0, 0.42)
    if _target_in_range(320.0):
        target.take_damage(24.0 + fighter_id * 2.0, global_position.x)
        target.velocity.x = facing * 520.0
        target.hurt_time = 0.16
        _impact(target.global_position, energy_color, 58.0)

func ultimate() -> void:
    if mana < 100.0 or ultimate_cd > 0.0 or hurt_time > 0.0:
        return
    mana = 0.0
    ultimate_cd = 3.0
    var energy_color := Color("#ff9b38") if team == 0 else Color("#d85cff")
    _spawn_ultimate(energy_color)
    if _target_in_range(560.0):
        target.take_damage(58.0 + fighter_id * 4.0, global_position.x)
        target.velocity.x = facing * 900.0
        target.hurt_time = 0.38
        _impact(target.global_position, energy_color, 110.0)

func _target_in_range(reach: float) -> bool:
    if not is_instance_valid(target) or target.hp <= 0.0:
        return false
    var dx := target.global_position.x - global_position.x
    return abs(dx) <= reach and sign(dx) == facing

func take_damage(amount: float, source_x: float) -> void:
    if hp <= 0.0:
        return
    hp = max(hp - amount, 0.0)
    hit_flash = 0.12
    hurt_time = 0.10
    var push := sign(global_position.x - source_x)
    if push == 0:
        push = -facing
    velocity.x = push * 310.0
    effects.append({"type":"hit", "time":0.26, "max_time":0.26, "pos":Vector2(0, -65), "color":Color("#fff2a8")})
    if hp <= 0.0:
        effects.append({"type":"defeat", "time":0.7, "max_time":0.7, "pos":Vector2(0, -60), "color":Color("#ff4f78")})
    queue_redraw()

func _spawn_slash(size: float, power: float, combo: int) -> void:
    var c := Color("#63eaff") if team == 0 else Color("#ff5d86")
    effects.append({"type":"slash", "time":0.28, "max_time":0.28, "size":size, "power":power, "combo":combo, "color":c})
    _burst(Vector2(18 * facing, -75), c, 18.0 + combo * 7.0, 0.18)
    queue_redraw()

func _spawn_energy_wave(c: Color, reach: float, duration: float) -> void:
    effects.append({"type":"wave", "time":duration, "max_time":duration, "reach":reach, "color":c})
    _burst(Vector2(25 * facing, -68), c, 46.0, duration)
    queue_redraw()

func _spawn_ultimate(c: Color) -> void:
    effects.append({"type":"ultimate", "time":0.72, "max_time":0.72, "reach":560.0, "color":c})
    _burst(Vector2(35 * facing, -65), c, 95.0, 0.55)
    queue_redraw()

func _burst(pos: Vector2, c: Color, radius: float, duration: float = 0.25) -> void:
    effects.append({"type":"burst", "time":duration, "max_time":duration, "radius":radius, "pos":pos, "color":c})

func _impact(pos: Vector2, c: Color, radius: float) -> void:
    if is_instance_valid(target):
        target.effects.append({"type":"burst", "time":0.28, "max_time":0.28, "radius":radius, "pos":Vector2(0,-65), "color":c})

func _process(delta: float) -> void:
    for e in effects:
        e.time -= delta
    effects = effects.filter(func(e): return e.time > 0.0)
    queue_redraw()

func _draw() -> void:
    var body_col := Color("#53dcff") if team == 0 else Color("#ff4d7d")
    if hit_flash > 0.0:
        body_col = Color.WHITE

    # Layered energy aura.
    var aura_alpha := 0.08 + 0.035 * sin(Time.get_ticks_msec() * 0.006 + fighter_id)
    draw_circle(Vector2(0, -62), 52.0, Color(body_col, aura_alpha))
    draw_circle(Vector2(0, -62), 38.0, Color(body_col, aura_alpha * 1.8))

    # Stylized original stick fighter.
    draw_circle(Vector2(0, -105), 18.0, Color("#0b0d17"))
    draw_circle(Vector2(0, -105), 14.0, body_col)
    draw_line(Vector2(0, -87), Vector2(0, -45), body_col, 9.0, true)
    draw_line(Vector2(0, -75), Vector2(-30 * facing, -55), body_col, 7.0, true)
    draw_line(Vector2(0, -75), Vector2(31 * facing, -54), body_col, 7.0, true)
    draw_line(Vector2(0, -45), Vector2(-23, -5), body_col, 8.0, true)
    draw_line(Vector2(0, -45), Vector2(24, -5), body_col, 8.0, true)

    # Core and small shoulder sparks.
    draw_circle(Vector2(0, -67), 8.0, Color.WHITE)
    draw_circle(Vector2(0, -67), 15.0, Color(body_col, 0.22))
    draw_circle(Vector2(-25, -56), 3.0, Color(body_col, 0.75))
    draw_circle(Vector2(26, -55), 3.0, Color(body_col, 0.75))

    # Name, HP and mana bars.
    var bar_w := 96.0
    draw_rect(Rect2(-bar_w / 2.0, -143, bar_w, 8), Color(0.02,0.02,0.04,0.92))
    draw_rect(Rect2(-bar_w / 2.0, -143, bar_w * hp / max_hp, 8), body_col)
    draw_rect(Rect2(-bar_w / 2.0, -133, bar_w, 4), Color(0.02,0.02,0.04,0.85))
    draw_rect(Rect2(-bar_w / 2.0, -133, bar_w * mana / 100.0, 4), Color("#9b63ff"))
    draw_string(ThemeDB.fallback_font, Vector2(-42, -151), display_name, HORIZONTAL_ALIGNMENT_CENTER, 84, 12, Color.WHITE)

    for e in effects:
        var alpha: float = clamp(e.time / e.max_time, 0.0, 1.0)
        if e.type == "slash":
            var radius: float = e.size * (1.0 - alpha * 0.18)
            var c: Color = e.color
            for i in range(6):
                var a := -1.0 + i * 0.30
                var start := Vector2(12 * facing, -76) + Vector2(cos(a), sin(a)) * 10.0
                var end := Vector2(12 * facing, -76) + Vector2(cos(a), sin(a)) * radius
                draw_line(start, end, Color(c, alpha), (5.0 + float(e.combo)) * e.power, true)
            draw_arc(Vector2(15 * facing, -76), radius * 0.55, -1.2, 1.2, 28, Color(c, alpha * 0.55), 3.0)
        elif e.type == "wave":
            var c: Color = e.color
            var p := 1.0 - alpha
            var radius: float = 35.0 + e.reach * p
            draw_circle(Vector2(25 * facing, -68), radius, Color(c, alpha * 0.07))
            draw_arc(Vector2(25 * facing, -68), radius, -0.9, 0.9, 40, Color(c, alpha), 8.0)
            draw_arc(Vector2(25 * facing, -68), radius * 0.72, -0.7, 0.7, 32, Color.WHITE, 2.0)
        elif e.type == "ultimate":
            var c: Color = e.color
            var p := 1.0 - alpha
            var radius: float = 80.0 + e.reach * p * 0.75
            draw_circle(Vector2(35 * facing, -65), radius * 0.35, Color(c, alpha * 0.22))
            draw_circle(Vector2(35 * facing, -65), radius * 0.16, Color.WHITE, false, 4.0)
            draw_arc(Vector2(35 * facing, -65), radius, -1.0, 1.0, 60, Color(c, alpha), 13.0)
            for i in range(8):
                var a := -0.95 + i * 0.27
                var p1 := Vector2(35 * facing, -65) + Vector2(cos(a), sin(a)) * 35.0
                var p2 := Vector2(35 * facing, -65) + Vector2(cos(a), sin(a)) * radius
                draw_line(p1, p2, Color(c, alpha * 0.65), 3.0, true)
        elif e.type == "burst":
            var c: Color = e.color
            var p := 1.0 - alpha
            var radius: float = e.radius * (0.35 + p)
            var center: Vector2 = e.pos
            draw_circle(center, radius * 0.30, Color(c, alpha * 0.22))
            for i in range(12):
                var a := TAU * float(i) / 12.0
                var p1 := center + Vector2(cos(a), sin(a)) * radius * 0.25
                var p2 := center + Vector2(cos(a), sin(a)) * radius
                draw_line(p1, p2, Color(c, alpha), 2.5 + 2.0 * alpha, true)
        elif e.type == "hit":
            var c: Color = e.color
            var center: Vector2 = e.pos
            for i in range(10):
                var a := TAU * float(i) / 10.0
                var p2 := center + Vector2(cos(a), sin(a)) * (22.0 + 35.0 * (1.0-alpha))
                draw_line(center, p2, Color(c, alpha), 4.0, true)
        elif e.type == "defeat":
            var c: Color = e.color
            var p := 1.0 - alpha
            draw_circle(Vector2(0,-60), 45.0 + p * 55.0, Color(c, alpha * 0.12))
            draw_arc(Vector2(0,-60), 45.0 + p * 55.0, 0, TAU, 40, Color(c, alpha), 5.0)
