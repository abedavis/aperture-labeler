import {AParticleSystemModel} from "../../../../anigraph/effects/particles/AParticleSystemModel";
import {ASerializable, Color, GetAppState, V3, Vec3} from "../../../../anigraph";
import {AppConfigs} from "../../../AppConfigs";
import {BillboardParticle} from "./BillboardParticle";


let appState = GetAppState();

@ASerializable("BillboardParticleSystemModel")
export class BillboardParticleSystemModel extends AParticleSystemModel<BillboardParticle>{
    //particles:ABillboardParticle[]
    lastEmittedIndex:number=0;
    lastTimeUpdate:number=-1;

    /**
     * This is an example of how you can add particle system controls to the control panel
     * @constructor
     */
    static AddParticleSystemControls(){
        appState.addSliderIfMissing(AppConfigs.VelocitySliderName, 0.5, 0,1,0.01);
        appState.addSliderIfMissing(AppConfigs.GravitySliderName, 0.5, 0,1,0.01);
        appState.addSliderIfMissing(AppConfigs.ForceStrengthSliderName, 0.5, 0,1,0.01);
        appState.addSliderIfMissing(AppConfigs.ParticleMassSliderName, 1, 0,100,0.01);
    }

    /**
     * This will emit a new particle. The starter implementation does this in a round-robin order, so it will recycle
     * the particle that was emitted least recently.
     * @param position
     * @param velocity
     * @param mass
     * @param radius
     * @param t0
     */
    emit(position:Vec3, velocity:Vec3, mass?:number, radius?:number, t0:number=-1){
        let i=(this.lastEmittedIndex+1)%(this.nParticles);
        this.particles[i].position = V3(Math.random()*0.5, Math.random()-0.5, Math.random());
        this.particles[i].velocity = V3(Math.random()*0.5, Math.random()-0.5, Math.random()).times(0.1);
        this.particles[i].mass = 3;
        this.particles[i].size = 1;
        this.particles[i].visible=true;
        this.particles[i].t0=t0;
        this.particles[i].color = Color.Random();
        this.lastEmittedIndex=i;
    }

    /**
     * Here you initialize the particles
     * @param nParticles
     */
    initParticles(nParticles:number){
        for(let i=0;i<nParticles;i++){
            let newp = new BillboardParticle();

            /**
             * Here we will initialize the particles to be invisible.
             * This won't do anything on its own, though; you will have to ensure that invisible particles are not visible in your corresponding custom view class.
             */
            newp.visible=false;

            /**
             * Let's add the particle...
             */
            this.addParticle(newp);
        }
    }

    constructor(nParticles?:number, ...args:any[]) {
        super();
        this.initParticles(nParticles??AppConfigs.MAX_PARTICLES);
        this.signalParticlesUpdated();
    }

    timeUpdate(t: number, ...args:any[]) {
        super.timeUpdate(t, ...args);

        /**
         * This is one way to check and see if we are in our first timeUpdate call.
         * We initialized this.lastTimeUpdate to -1, so if it is less than 0 we know it's our first time calling this function.
         */
        if(this.lastTimeUpdate<0){
            this.lastTimeUpdate=t;
        }

        let timePassed = t-this.lastTimeUpdate;
        this.lastTimeUpdate=t;

        /**
         * Let's emit a new particle
         */
        let particleSize = 1;
        let startPosition = this.getWorldTransform().position;
        let startSpeed = appState.getState(AppConfigs.ForceStrengthSliderName)??0.1;
        let startVelocity = V3(Math.random()-0.5, Math.random()-0.5, 1.0).times(startSpeed);
        let newParticleMass = appState.getState(AppConfigs.ParticleMassSliderName)??1;
        this.emit(startPosition,
            startVelocity,
            newParticleMass,
            particleSize,
            t
        );

        /**
         * Here we will define some behavior for our particles. This is a bare minimum simple forward euler simulation.
         */
        for(let i=0;i<this.particles.length;i++){
            let p =this.particles[i];
            p.position=p.position.plus(
                p.velocity.times(
                    appState.getState(AppConfigs.VelocitySliderName)*timePassed
                )
            );
        }

        /**
         * This is important! You need to signal that the particles have been updated to trigger re-rendering of the view!
         */
        this.signalParticlesUpdated();
    }

}
