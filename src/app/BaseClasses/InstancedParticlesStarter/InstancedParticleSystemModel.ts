import {AParticleSystemModel} from "../../../anigraph/effects/particles/AParticleSystemModel";
import {AParticle3D, Particle3D} from "../../../anigraph/physics/AParticle3D";
import {Vec3} from "../../../anigraph";
import {AInstancedParticleSystemModel} from "../../../anigraph/effects/particles/InstancedParticles";

export abstract class InstancedParticleSystemModel<P extends Particle3D> extends AInstancedParticleSystemModel<P>{

    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);
        this.signalParticlesUpdated();
    }

}
