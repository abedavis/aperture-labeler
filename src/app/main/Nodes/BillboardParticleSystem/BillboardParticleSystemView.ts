import {AParticle3D} from "../../../../anigraph/physics/AParticle3D";
import {BillboardParticleSystemModel} from "./BillboardParticleSystemModel";
import {Color, Mat4, NodeTransform3D, Quaternion, Vec3} from "../../../../anigraph";
import {
    AInstancedParticleSystemGraphic,
} from "../../../../anigraph/effects/particles/InstancedParticles";
import {BillboardParticleSystemGraphic} from "./BillboardParticleSystemGraphic";
import {
    InstancedParticleSystemView
} from "../../../BaseClasses/InstancedParticlesStarter/InstancedParticleSystemView";
import {BillboardParticle} from "./BillboardParticle";

export class BillboardParticleSystemView extends InstancedParticleSystemView<BillboardParticle>{
    static MAX_PARTICLES = 300;

    get particlesElement():BillboardParticleSystemGraphic{
        return this._particlesElement as BillboardParticleSystemGraphic;
    }
    get model():BillboardParticleSystemModel{
        return this._model as BillboardParticleSystemModel;
    }

    createParticlesElement(...args:any[]): BillboardParticleSystemGraphic {
        return AInstancedParticleSystemGraphic.Create(BillboardParticleSystemView.MAX_PARTICLES);
    }

    init() {
        super.init();
    }

    update(...args:any[]) {
        super.update(...args);
    }

    /**
     * This function should return the color to be applied to the particle associated with the provided particle index
     * @param particle
     */
    getColorForParticleIndex(i: number): Color {
        // throw new Error("Method not implemented.");
        return this.model.particles[i].color;
    }

    /**
     * This function should return the transformation to be applied to geometry associated with the provided particle
     * @param particle
     */
    getTransformForParticleIndex(i: number): Mat4 {
        // throw new Error("Method not implemented.");
        let particle = this.model.particles[i];
        let nt=new NodeTransform3D(particle.position,new Quaternion(), particle.size);
        return nt.getMat4();
    }
}
