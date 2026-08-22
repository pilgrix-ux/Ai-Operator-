class_name VFXSystem
extends Node2D

## Reusable, asset-free anime combat VFX for Android.
## Add this node to Main and call the public methods from combat events.

var particles: Array[Dictionary] = []
var shake := 0.0
var flash := 0.0
var slow_motion := 1.0

func hit(position: Vector2, power := 1.0, color := Color("#fff0a8")) -> void:
    burst(position, color, 34.0 * power, 0.20, 18)
    shake = max(shake, 5.0 * power)
    flash = max(flash, 0.055 * power)

func skill(position: Vector2, direction := 1.0, color := Color("#9b5cff")) -> void:
    charge(position, color, 0.24)
    particles.append({"kind":"beam", "pos":position, "dir":direction, "color":color, "life":0.34, "max":0.34, "size":120.0})
    shake = max(shake, 7.0)

func ultimate(position: Vector2, direction := 1.0, color := Color("#d84cff")) -> void:
    charge(position, color, 0.55)
    particles.append({"kind":"ultimate", "pos":position, "dir":direction, "color":color, "life":0.95, "max":0.95, "size":210.0})
    shake = max(shake, 16.0)
    flash = max(flash, 0.14)
    slow_motion = min(slow_motion, 0.35)

func charge(position: Vector2, color: Color, duration := 0.35) -> void:
    particles.append({"kind":"charge", "pos":position, "color":color, "life":duration, "max":duration, "size":30.0})

func burst(position: Vector2, color: Color, radius: float, duration := 0.25, count := 14) -> void:
    particles.append({"kind":"burst", "pos":position, "color":color, "life":duration, "max":duration, "size":radius, "count":count})

func _process(delta: float) -> void:
    var d := delta * slow_motion
    slow_motion = move_toward(slow_motion, 1.0, delta * 1.8)
    shake = move_toward(shake, 0.0, delta * 28.0)
    flash = move_toward(flash, 0.0, delta * 4.0)
    for p in particles:
        p.life -= d
    particles = particles.filter(func(p): return p.life > 0.0)
    queue_redraw()

func _draw() -> void:
    for p in particles:
        var a: float = clamp(p.life / p.max, 0.0, 1.0)
        var c: Color = p.color
        var pos: Vector2 = p.pos
        if p.kind == "charge":
            var q := 1.0 - a
            var r: float = 20.0 + p.size * q * 2.2
            draw_circle(pos, r * 0.55, Color(c, a * 0.15))
            draw_arc(pos, r, -PI, PI, 48, Color(c, a), 4.0)
            for i in range(10):
                var ang := float(i) * TAU / 10.0 + q * 4.0
                var p1 := pos + Vector2(cos(ang), sin(ang)) * r * 0.35
                var p2 := pos + Vector2(cos(ang), sin(ang)) * r
                draw_line(p1, p2, Color(c, a * 0.7), 2.0, true)
        elif p.kind == "burst":
            var r: float = p.size * (1.0 - a * 0.65)
            draw_circle(pos, r * 0.42, Color(c, a * 0.18))
            draw_arc(pos, r, 0.0, TAU, 40, Color(c, a), 5.0)
            for i in range(p.count):
                var ang := TAU * float(i) / float(p.count)
                var p1 := pos + Vector2(cos(ang), sin(ang)) * r * 0.25
                var p2 := pos + Vector2(cos(ang), sin(ang)) * r
                draw_line(p1, p2, Color(c, a * 0.85), 2.0, true)
        elif p.kind == "beam":
            var q := 1.0 - a
            var length: float = 90.0 + p.size * q * 2.4
            var dir: float = p.dir
            var start := pos + Vector2(20.0 * dir, 0)
            var end := start + Vector2(length * dir, 0)
            draw_line(start, end, Color(c, a * 0.18), 28.0, true)
            draw_line(start, end, Color(c, a), 10.0, true)
            draw_line(start, end, Color.WHITE, 2.5, true)
            draw_circle(end, 20.0 * a, Color(c, a * 0.25))
        elif p.kind == "ultimate":
            var q := 1.0 - a
            var r: float = 70.0 + p.size * q
            draw_circle(pos, r * 0.50, Color(c, a * 0.14))
            draw_circle(pos, r * 0.18, Color.WHITE, false, 5.0)
            draw_arc(pos, r, -1.05, 1.05, 72, Color(c, a), 15.0)
            draw_arc(pos, r * 0.72, -1.2, 1.2, 64, Color.WHITE, 3.0)
            for i in range(12):
                var ang := -1.05 + float(i) * 0.19
                var p1 := pos + Vector2(cos(ang), sin(ang)) * 25.0
                var p2 := pos + Vector2(cos(ang), sin(ang)) * r
                draw_line(p1, p2, Color(c, a * 0.75), 4.0, true)

    if flash > 0.0:
        draw_rect(Rect2(0, 0, 1280, 720), Color(1, 1, 1, flash))
