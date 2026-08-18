export const ARENA={name:'Dockyard',bounds:{x:19.5,z:13.5},cover:[[-10,1.2,-5,3,2.4,2],[-3,1.5,4,4,3,2],[6,1.1,-4,2.5,2.2,3],[12,1.8,6,3,3.6,2],[-13,1.3,7,4,2.6,2],[1,1.4,-8,3,2.8,2]]};
export function keepInArena(p){p.x=Math.max(-ARENA.bounds.x,Math.min(ARENA.bounds.x,p.x));p.z=Math.max(-ARENA.bounds.z,Math.min(ARENA.bounds.z,p.z));return p}
export function nearestCover(position){let best=null,bd=Infinity;for(const c of ARENA.cover){const dx=c[0]-position.x,dz=c[2]-position.z,d=dx*dx+dz*dz;if(d<bd){bd=d;best={x:c[0],z:c[2],width:c[3],depth:c[5]}}}return best}
