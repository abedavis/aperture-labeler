/**
 * @file Main scene model
 * @description Scene model for your application
 */

import {
    ACameraModel,
    AInteractionEvent, AModel, ANodeModel3D,
    Color,
    GetAppState,
    NodeTransform3D, Quaternion,
    V3,
    Vec2, Vec3
} from "../../../anigraph";
import {BaseSceneModel} from "../../BaseClasses";
import { ATexture} from "../../../anigraph";
import {TerrainModel} from "../Nodes/Terrain";
import {APointLightModel} from "../../../anigraph/scene/lights";
import {AppConfigs} from "../../AppConfigs";
import {PlayerModel} from "../Nodes/PlayerNode";
import {CharacterModel} from "../../BaseClasses/CharacterModel";
import {BotModel} from "../Nodes/CharacterNodes/BotModel";
import {ExampleThreeJSNodeModel} from "../Nodes/ExampleNodes/ExampleThreeJSNode";
import {ExampleParticleSystemModel} from "../Nodes/ExampleNodes/ExampleParticleSystemNode/ExampleParticleSystemModel";
import {SphereParticle} from "../Nodes/ExampleNodes/ExampleParticleSystemNode/SphereParticle";
import {Particle3D} from "../../../anigraph/physics/AParticle3D";


let appState = GetAppState();
export class MainSceneModel extends BaseSceneModel {
    /**
     * Our custom terrain model
     */
    terrain!:TerrainModel;

    /**
     * Our custom player model, and a texture to use for our player
     */
    _player!:CharacterModel;
    get player():CharacterModel{
        return this._player as CharacterModel;
    }
    set player(v:CharacterModel){
        this._player = v;
    }
    playerTexture!:ATexture;

    /**
     * An array of bots. Your
     */
    bots:BotModel[]=[];


    async PreloadAssets() {
        await super.PreloadAssets();
        await TerrainModel.LoadShader();
        await CharacterModel.LoadShader();
        await ExampleParticleSystemModel.LoadShader();
        // this.materials.setMaterialModel("textured", await ABasicShaderModel.CreateModel("basic"));

    }

    initCamera() {
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(0.0, -AppConfigs.CameraDefaultHeight, AppConfigs.CameraDefaultHeight), V3(0,0,0),
                V3(0,0,1)
            )
        )
    }

    /**
     * The view light is a light that is attached to the camera.
     */
    initViewLight(){

        /**
         * Create a point light
         * You can have up to 16 point lights in the scene at once by default
         */
        this.viewLight = new APointLightModel(
            this.camera.pose,
            Color.FromString("#ffffff"),
            0.5,
            AppConfigs.ViewLightRange,
            1
        );

        /**
         * Add it as a child of the camera model so that it will move with the camera
         */
        this.cameraModel.addChild(this.viewLight);
    }

    async initTerrain(){
        this.terrain = await TerrainModel.Create(
            AppConfigs.GroundTexture, // texture
            AppConfigs.TerrainScaleX, // scaleX
            AppConfigs.TerrainScaleY, // scaleY
            AppConfigs.TerrainDataTextureWidth, // number of vertices wide
            AppConfigs.TerrainDataTextureHeight, // number of vertices tall
            undefined, // transform for terrain, identity if left blank
            AppConfigs.TerrainWrapTextureX, // number of times texture should wrap across surface in X
            AppConfigs.TerrainWrapTextureY, // number of times texture should wrap across surface in Y
        );

        this.addChild(this.terrain);
    }



    async initCharacters(){


        /**
         * First we will initialze the player and add it to the scene.
         */
        this.playerTexture = await ATexture.LoadAsync("./images/tanktexburngreen.jpeg")
        this.player = await PlayerModel.Create(this.playerTexture);
        this.addChild(this.player);



        /**
         * Then we will create a bunch of bots with different cat faces...
         * Let's make each one a child of the last.
         */
        let parent:AModel = this;
        for(let e=0;e<6; e++) {
            let bot = await BotModel.Create(`./images/catfaces/catface0${e + 1}.jpeg`);
            bot.position = new Vec3((Math.random() - 0.5) * AppConfigs.TerrainScaleX, (Math.random() - 0.5) * AppConfigs.TerrainScaleY, 0);
            bot.mass = 50;
            this.bots.push(bot);
            parent.addChild(bot);
            parent = bot;
        }
    }


    async initScene() {
        await this.initTerrain();
        await this.initCharacters();

        this.addChild(new ExampleThreeJSNodeModel());

        /**
         * Now an example particle system.
         */
        let particles = new ExampleParticleSystemModel();
        particles.orbitRadius = 0.3;
        let radius = 0.05;
        particles.addParticle(new SphereParticle(undefined, undefined, radius));
        particles.addParticle(new SphereParticle(undefined, undefined, radius));
        particles.addParticle(new SphereParticle(undefined, undefined, radius));

        /**
         * We will add the particle system to one of the bots for kicks...
         */
        this.bots[this.bots.length-1].addChild(particles);

        /**
         * Now let's initialize the view light
         */
        this.initViewLight();
    }

    timeUpdate(t: number, ...args:any[]) {

        /**
         * We can call timeUpdate on all of the model nodes in the scene here, which will trigger any updates that they
         * individually define.
         */
        for(let c of this.getDescendantList()){
            c.timeUpdate(t);
        }

        /**
         * For interactions between models, we can trigger logic here. For example, if you want characters to walk on
         * uneven terrain, you can make that happen by completing the functions used here:
         */
        const self = this;
        function adjustHeight(character:Particle3D){
            let height = self.terrain.getTerrainHeightAtPoint(character.position.xy);
            if(character.position.z<height){character.position.z = height;}
        }

        /**
         * Here we would apply our adjust height function to the player
         */
        adjustHeight(this.player);

        /**
         * Now lets update bots
         */
        let orbitradius = 0.25;
        for(let ei=0;ei<this.bots.length;ei++){
            let e = this.bots[ei];

            /**
             * Characters have velocity and mass properties in case you want to implement particle physics
             * But for now we will just have them orbit each other.
             */
            e.position = new Vec3(Math.cos(t*(ei+1)), Math.sin(t*(ei+1)),0).times(orbitradius);

            /**
             * adjust their height
             */
            adjustHeight(e);
        }
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


