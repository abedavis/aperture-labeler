import {Particle3D} from "../../physics/AParticle3D";
import {ANodeView} from "../../scene";
import {AGraphicGroup, AInstancedGraphic} from "../../rendering";
import {AParticleSystemModel} from "./AParticleSystemModel";
import {Color, Mat4} from "../../math";
import {AInstancedParticleSystemGraphic} from "./InstancedParticles";

export abstract class AParticleSystemView<P extends Particle3D> extends ANodeView{

    abstract createParticlesElement(...args:any[]):AInstancedParticleSystemGraphic<P>;

    particleGroup!:AGraphicGroup;
    _particlesElement!:AInstancedParticleSystemGraphic<P>;
    get particlesElement(){
        return this._particlesElement;
    }

    get model():AParticleSystemModel<P>{
        return this._model as AParticleSystemModel<P>;
    }



    init() {
        this.particleGroup = new AGraphicGroup();
        this.addGraphic(this.particleGroup);
        this._particlesElement = this.createParticlesElement();
        this.particleGroup.add(this.particlesElement);
    }

    setModelListeners() {
        super.setModelListeners();
        this.addParticleSubscriptions();
    }

    addParticleSubscriptions(){
        this.subscribe(this.model.addParticlesListener(()=>{
            this.update();
        }))
    }

    // update(...args:any[]) {
    //     for(let p=0;p<this.model.particles.length;p++){
    //         this.particlesElement.setParticle(p, this.model.particles[p]);
    //     }
    //     this.particlesElement.setNeedsUpdate();
    // }
}



