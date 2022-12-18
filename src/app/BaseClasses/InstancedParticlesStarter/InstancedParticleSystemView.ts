import {AParticle3D, Particle3D} from "../../../anigraph/physics/AParticle3D";
import {AParticleSystemView} from "../../../anigraph/effects/particles/AParticleSystemView";
import {InstancedParticleSystemModel} from "./InstancedParticleSystemModel";
import {AInstancedGraphic, Color, Mat4, NodeTransform3D, Quaternion} from "../../../anigraph";
import {AppConfigs} from "../../AppConfigs";
import {InstancedParticleSystemGraphic} from "./InstancedParticleSystemGraphic";
import {AInstancedParticleSystemView} from "../../../anigraph/effects/particles/InstancedParticles";

export abstract class InstancedParticleSystemView<P extends Particle3D> extends AInstancedParticleSystemView<P>{

    get particlesElement():InstancedParticleSystemGraphic<P>{
        return this._particlesElement as InstancedParticleSystemGraphic<P>;
    }
    get model():InstancedParticleSystemModel<P>{
        return this._model as InstancedParticleSystemModel<P>;
    }

    createParticlesElement(...args:any[]): InstancedParticleSystemGraphic<P> {
        return InstancedParticleSystemGraphic.Create(AppConfigs.MAX_PARTICLES);
    }

    init() {
        super.init();
    }

}
