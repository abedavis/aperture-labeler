import {
    A3DModelLoader,
    ACameraModel, AInteractionEvent,
    AModel, AObject3DModelWrapper,
    APointLightModel, AShaderMaterial,
    Color,
    GetAppState,
    NodeTransform3D, Quaternion,
    V3, Vec2,
    Vec3
} from "../../../../../anigraph";
import {BaseSceneModel, CharacterModel, CharacterModelInterface} from "../../../../BaseClasses";
import {
    BotModel,
    ExampleParticleSystemModel,
    ExampleThreeJSNodeModel,
    PlayerModel,
    SphereParticle,
    TerrainModel
} from "../../../Nodes";
import {ATexture} from "../../../../../anigraph/rendering/ATexture";
import {AppConfigs} from "../../../../AppConfigs";
import {Particle3D} from "../../../../../anigraph/physics/AParticle3D";
import {LoadedCharacterModel} from "../../../../BaseClasses/LoadedCharacterModel";
import {ExampleLoadedCharacterModel} from "../../../Nodes/Loaded/ExampleLoadedCharacterModel";
import {ABasicShaderModel} from "../../../../../anigraph/rendering/shadermodels/ABasicShaderModel";
import {AddStandardUniforms} from "../HowToAddUniformToControlPanel";
import {json} from "stream/consumers";
import {BillboardParticleSystemModel} from "../../../Nodes/BillboardParticleSystem";
// import {AddStandardUniforms} from "../HowToAddUniformToControlPanel";

let appState = GetAppState();

/**
 * Here we will define some enums that are simple strings.
 * These will be what we call different shader model instances. Note that we could just type these strings directly into
 * the code when we use them, but defining them as an enum will help avoid bugs caused by typos, and it will let you use
 * refactoring features of your IDE if you want to change these variables later.
 */
enum MyMaterialNames{
    basicshader1="basicshader1",
    mymaterial2="mymaterial2",
}


export class Example1SceneModel extends BaseSceneModel {
    /**
     * Our custom terrain model
     */
    terrain!:TerrainModel;

    /**
     * Our custom player model, and a texture to use for our player
     */
    _player!:CharacterModelInterface;
    get player():CharacterModelInterface{
        return this._player as LoadedCharacterModel;
    }
    set player(v:CharacterModelInterface){
        this._player = v;
    }
    loaded3DModel!:AObject3DModelWrapper;
    playerMaterial!:AShaderMaterial;


    catModel!:AObject3DModelWrapper;
    catTexture!:ATexture;

    /**
     * An array of bots. Your
     */
    bots:BotModel[]=[];

    billboardParticles!:BillboardParticleSystemModel;


    async loadModelFromFile(path:string, transform?:NodeTransform3D){
        /**
         * Here we need to load the .ply file into an AObject3DModelWrapper instance
         */
        let meshObject = await A3DModelLoader.LoadFromPath(path)
        meshObject.sourceTransform = transform??new NodeTransform3D();
        return meshObject;
    }


    async PreloadAssets() {
        await super.PreloadAssets();
        await TerrainModel.LoadShader();
        await CharacterModel.LoadShader();
        await ExampleParticleSystemModel.LoadShader();


        const self = this;

        /**
         * Here we will create a shader model and name it with the string defined in `MyMaterialNames.basicshader1`.
         * The shaderName argument to CreateModel is the name used in the shader folder and glsl files under
         * `public/shaders/`
         */
        let basicshader1ShaderMaterialModel = await ABasicShaderModel.CreateModel("customexample1");
        await this.materials.setMaterialModel(MyMaterialNames.basicshader1, basicshader1ShaderMaterialModel);

        /**
         * If we want to use vertex colors in our shader, we need to set useVertexColors to true.
         * This will turn vertex colors on by default for materials created with this model.
         * Each time you create a material, you can turn off vertex colors for that material if you want.
         */
        basicshader1ShaderMaterialModel.usesVertexColors=true;

        /**
         * Once a shader model is set like this, we can access it with the material name we assigned it to like so:
         */
        this.playerMaterial = this.materials.CreateShaderMaterial(MyMaterialNames.basicshader1);



        /**
         * Ok, now let's load a 3D model to use for our player.
         */


        /**
         * We could use a dragon with vertex colors specified in a .ply file
         */
        // let dragonTransform = NodeTransform3D.FromPositionZUpAndScale(V3(), Vec3.UnitZ(),Vec3.UnitX().times(-1), 0.005);
        // this.loaded3DModel = await this.loadModelFromFile("./models/ply/dragon_color_onground.ply", dragonTransform);


        /**
         * Or a cat!!! Here it is defined as a .glb file, which you can export from blender by exporting a mesh as a gltf format
         */
        let catTransform = NodeTransform3D.FromPositionZUpAndScale(V3(), Vec3.UnitZ().times(1), Vec3.UnitY().times(-1), 0.02);
        this.loaded3DModel = await this.loadModelFromFile("./models/gltf/cat.glb", catTransform);
        /**
         * Our cat comes with a texture, so lets add it to the character material
         */
        let catTexture = await ATexture.LoadAsync("./models/gltf/Cat_diffuse.jpg");
        this.playerMaterial.setTexture('diffuse', catTexture);

    }


    initCamera() {
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);

        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(-0.2, 0.8, 0.75), V3(0,0,0.5),
                V3(0,0,0.4)
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
        // this.playerTexture = await ATexture.LoadAsync("./images/tanktexburngreen.jpeg")
        // this.player = await PlayerModel.Create(this.playerTexture);

        /**
         * Here we will initialize our player using the loaded .ply model and the shader material model we attached to
         * the string MyMaterialNames.basicshader1
         * @type {ExampleLoadedCharacterModel}
         */
        this.player = new ExampleLoadedCharacterModel(
            this.loaded3DModel,
            this.playerMaterial
        );
        AddStandardUniforms(this.player.material);
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

        /**
         * Let's add the particle system controls to the control pannel...
         */
        BillboardParticleSystemModel.AddParticleSystemControls();

        /**
         * And now let's create our particle system
         */
        this.billboardParticles = new BillboardParticleSystemModel(200);
        this.addChild(this.billboardParticles);

    }

    timeUpdate(t: number, ...args:any[]) {
        this.basicUpdate(t, ...args);
        // this.spinBots(t, ...args);
    }

    /**
     * Here we will separate out logic that check to see if a particle (characters implement the particle interface, so
     * this can be used on characters as well) intersects the terrain.
     * @param particle
     */
    adjustParticleHeight(particle:Particle3D){
        let height = this.terrain.getTerrainHeightAtPoint(particle.position.xy);
        if(particle.position.z<height){particle.position.z = height;}
    }

    basicUpdate(t:number, ...args:any[]){
        /**
         * We can call timeUpdate on all of the model nodes in the scene here, which will trigger any updates that they
         * individually define.
         */
        for(let c of this.getDescendantList()){
            c.timeUpdate(t);
        }

        this.adjustParticleHeight(this.player);
        for(let ei=0;ei<this.bots.length;ei++){
            let e = this.bots[ei];
            /**
             * adjust their height
             */
            this.adjustParticleHeight(e);
        }
    }

    spinBots(t:number, ...args:any[]){
        /**
         * Now lets update bots
         */
        let orbitradius = 0.25;
        for(let ei=0;ei<this.bots.length;ei++){
            let e = this.bots[ei];
            e.position.xy = new Vec2(Math.cos(t*(ei+1)), Math.sin(t*(ei+1))).times(orbitradius);
            this.adjustParticleHeight(e);
        }
    }


    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


