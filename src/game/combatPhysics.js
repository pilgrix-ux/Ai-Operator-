export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function recoilKick(current,power,dt){const recovery=Math.min(1,dt*7);return current*(1-recovery)+power*recovery}
export function slideImpulse(direction,speed=10){const l=Math.hypot(direction.x,direction.z)||1;return{x:direction.x/l*speed,y:0,z:direction.z/l*speed}}
export function explosionImpulse(origin,point,strength=7){const x=point.x-origin.x,y=point.y-origin.y,z=point.z-origin.z;const d=Math.max(.25,Math.hypot(x,y,z));const s=strength/(d*d);return{x:x/d*s,y:y/d*s,z:z/d*s}}
export function damageFalloff(distance,near=10,far=40,minMultiplier=.45){if(distance<=near)return 1;if(distance>=far)return minMultiplier;const t=(distance-near)/(far-near);return 1-(1-minMultiplier)*t}
