import {ASerializable} from "../../../base";
import {NodeTransform3D, Vec3} from "../../../math";
import {ACameraModel} from "../../../scene";
import {AParticleSystemModel} from "../AParticleSystemModel";
import {Particle3D} from "../../../physics/AParticle3D";


const DEFAULT_MASS:number=1;
const DEFAULT_N_PARTICLES=10;
enum BillboardParticleEnums{
    CameraSubscription="CameraSubscription"
}

@ASerializable("AInstancedParticleSystemModel")
export abstract class AInstancedParticleSystemModel<P extends Particle3D> extends AParticleSystemModel<P>{

    abstract initParticles(nParticles:number):void;

    // initParticles(nParticles:number){
    //     for(let i=0;i<nParticles;i++){
    //         let newp = new ABillboardParticle();
    //         newp.visible=false;
    //         this.addParticle(newp);
    //     }
    // }

    constructor(nParticles?:number) {
        super();
        this.initParticles(nParticles??DEFAULT_N_PARTICLES);
        this.signalParticlesUpdated();
    }

    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
    }

}
