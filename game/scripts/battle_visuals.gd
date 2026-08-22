extends Node2D

var seen: Dictionary = {}
var pulse := 0.0
var shake := 0.0
var flash := 0.0
var overlay: ColorRect

func _ready() -> void:
    overlay = ColorRect.new()
    overlay.color = Color(1, 1, 1, 0)
    overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
    overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    var layer := CanvasLayer.new()
    layer.layer = 20
    add_child(layer)
    layer.add_child(overlay)

func _process(delta: float) -> void:
    pulse += delta
    shake = max(shake - delta, 0.0)
    flash = max(flash - delta, 0.0)
    overlay.color.a = min(flash * 3.5, 0.16)
    for f in get_parent().get_children():
        if f is Fighter and not seen.has(f):
            _attach_fighter_visual(f)
            seen[f] = true
        if f is Fighter:
            _watch_effects(f)
    if shake > 0.0:
        get_parent().position = Vector2(randf_range(-shake, shake), randf_range(-shake, shake))
    else:
        get_parent().position = Vector2.ZERO

func _attach_fighter_visual(f: Fighter) -> void:
    var art := Sprite2D.new()
    art.name = "AnimatedFighterArt"
    art.texture = load("res://assets/fighters/nova.svg" if f.team == 0 else "res://assets/fighters/vex.svg")
    art.position = Vector2(0, -118)
    art.scale = Vector2(0.46, 0.46)
    art.z_index = 2
    f.add_child(art)
    f.set_meta("battle_art", art)

func _watch_effects(f: Fighter) -> void:
    var art: Sprite2D = f.get_meta("battle_art", null)
    if art:
        var moving := abs(f.velocity.x) > 35.0
        var t := pulse * (11.0 if moving else 3.0)
        art.position.y = -118 + sin(t) * (4.0 if moving else 1.5)
        art.rotation = lerp(art.rotation, clamp(f.velocity.x / 2500.0, -0.10, 0.10), 0.18)
        art.flip_h = f.facing < 0.0
        var stretch := 1.0
        if f.attack_cd > 0.0: stretch = 1.05
        art.scale = Vector2(0.46 * stretch, 0.46 / stretch)
    for e in f.effects:
        if e.type == "hit" or e.type == "ultimate":
            shake = max(shake, 5.0 if e.type == "hit" else 14.0)
            flash = max(flash, 0.045 if e.type == "hit" else 0.11)
