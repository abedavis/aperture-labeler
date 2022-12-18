import {Color, Mat4} from "../../../index";
import {AInstancedParticleSystemGraphic} from "./AInstancedParticleSystemGraphic";
import {AInstancedParticleSystemModel} from "./AInstancedParticleSystemModel";
import {AParticleSystemView} from "../AParticleSystemView";
import {Particle3D} from "../../../physics/AParticle3D";



export abstract class AInstancedParticleSystemView<P extends Particle3D> extends AParticleSystemView<P>{
    static MAX_PARTICLES=300;
    abstract getColorForParticleIndex(i:number):Color;
    abstract getTransformForParticleIndex(i:number):Mat4;

    get particlesElement():AInstancedParticleSystemGraphic<P>{
        return this._particlesElement as AInstancedParticleSystemGraphic<P>;
    }
    get model():AInstancedParticleSystemModel<P>{
        return this._model as AInstancedParticleSystemModel<P>;
    }

    // createParticlesElement(...args:any[]): AInstancedParticlesGraphic<P>{
    //     return AInstancedParticlesGraphic.Create(AInstancedParticleSystemView.MAX_PARTICLES);
    // }

    init() {
        super.init();
    }

    update(...args:any[]) {
        for(let i=0;i<this.model.particles.length;i++){
            this.particlesElement.setColorAt(i, this.getColorForParticleIndex(i));
            this.particlesElement.setMatrixAt(i, this.getTransformForParticleIndex(i));
        }
        this.particlesElement.setNeedsUpdate();
    }

}
