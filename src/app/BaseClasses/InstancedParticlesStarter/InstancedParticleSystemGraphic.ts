import {AMaterial} from "../../../anigraph";
import {Particle3D} from "../../../anigraph/physics/AParticle3D";
import * as THREE from "three";
import {AInstancedParticleSystemGraphic} from "../../../anigraph/effects/particles/InstancedParticles";

export class InstancedParticleSystemGraphic<P extends Particle3D> extends AInstancedParticleSystemGraphic<P>{
    static Create(nParticles:number=100, material?:AMaterial|THREE.Material, ...args:any[]){
        let psystem = new this();
        psystem.init(nParticles, material)
        return psystem;
    }
}
