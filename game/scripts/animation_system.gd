class_name AnimationSystem
extends Node2D

## Lightweight procedural animation controller for original stick fighters.
## Keeps the project asset-light for Godot Android while providing readable
## anticipation, attack, recoil, dash and idle motion.

var state := "idle"
var state_time := 0.0
var facing := 1.0
var attack_index := 0
var speed_scale := 1.0
var squash := 1.0
var stretch := 1.0
var recoil := 0.0

func set_state(next_state: String, duration := 0.0) -> void:
    state = next_state
    state_time = duration if duration > 0.0 else 0.0

func update_animation(delta: float, moving := false) -> void:
    state_time += delta
    if state == "idle" and moving:
        state = "run"
        state_time = 0.0
    elif state == "run" and not moving:
        state = "idle"
        state_time = 0.0
    recoil = move_toward(recoil, 0.0, delta * 5.5)

func pose() -> Dictionary:
    var t := state_time * 10.0 * speed_scale
    var bob := sin(t) * 2.0
    var leg := sin(t) * 0.12
    var arm := cos(t) * 0.10
    var lean := 0.0

    if state == "run":
        bob = abs(sin(t)) * -5.0
        leg = sin(t) * 0.38
        arm = cos(t) * 0.32
        lean = 0.12 * facing
    elif state == "attack":
        var p := clamp(state_time / 0.34, 0.0, 1.0)
        var arc := sin(p * PI)
        lean = 0.16 * facing * arc
        arm = -0.55 * facing * arc
        leg = 0.20 * facing * arc
        bob = -5.0 * arc
    elif state == "skill":
        var p := clamp(state_time / 0.48, 0.0, 1.0)
        var charge := sin(clamp(p, 0.0, 0.7) / 0.7 * PI * 0.5)
        lean = -0.18 * facing * charge
        arm = -0.85 * facing * charge
        bob = -7.0 * charge
    elif state == "ultimate":
        var p := clamp(state_time / 0.85, 0.0, 1.0)
        var charge := sin(min(p / 0.55, 1.0) * PI * 0.5)
        lean = -0.22 * facing * charge
        arm = -1.0 * facing * charge
        leg = 0.28 * facing * charge
        bob = -12.0 * charge
    elif state == "hit":
        lean = -0.35 * facing
        bob = 4.0
        arm = 0.5
        leg = -0.22
    elif state == "dash":
        lean = 0.42 * facing
        bob = -3.0
        arm = -0.42 * facing
        leg = 0.18 * facing

    return {
        "bob": bob,
        "leg": leg,
        "arm": arm,
        "lean": lean,
        "scale": Vector2(1.0 + squash * 0.0, 1.0 + stretch * 0.0),
        "recoil": recoil
    }
