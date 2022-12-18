import {
    A3DModelLoader,
    ACameraModel, AInteractionEvent,
    AModel, AObject3DModelWrapper,
    APointLightModel, ASceneElement, AShaderMaterial, AShaderModel,
    Color,
    GetAppState,
    NodeTransform3D, Quaternion,
    V3, Vec2,
    Vec3
} from "../../../../../anigraph";
import {CharacterModel} from "../../../../BaseClasses";
import {
    ExampleParticleSystemModel,
    SphereParticle,
    TerrainModel
} from "../../../Nodes";
import {AppConfigs} from "../../../../AppConfigs";
import {Particle3D} from "../../../../../anigraph/physics/AParticle3D";
import {ExampleLoadedCharacterModel} from "../../../Nodes/Loaded/ExampleLoadedCharacterModel";
import {ABasicShaderModel} from "../../../../../anigraph/rendering/shadermodels/ABasicShaderModel";
import {AddStandardUniforms} from "../HowToAddUniformToControlPanel";
import {ARenderTarget} from "../../../../../anigraph/rendering/multipass/ARenderTarget";
import {MainSceneModel} from "../../MainSceneModel";

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
    ExampleImageDisplay="exampleimagedisplay"
}



export class Example3SceneModel extends MainSceneModel {
    loaded3DModel!:AObject3DModelWrapper;
    playerMaterial!:AShaderMaterial;

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
        let dragonTransform = NodeTransform3D.FromPositionZUpAndScale(V3(), Vec3.UnitZ(),Vec3.UnitX().times(-1), 0.005);
        this.loaded3DModel = await this.loadModelFromFile("./models/ply/dragon_color_onground.ply", dragonTransform);
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
        this.player = new ExampleLoadedCharacterModel(
            this.loaded3DModel,
            this.playerMaterial
        );
        this.player.transform.rotation = Quaternion.RotationZ(Math.PI*0.5);
        AddStandardUniforms(this.player.material);
        this.addChild(this.player);
    }


    async initScene() {
        await this.initTerrain();
        await this.initCharacters();

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
         * Now let's initialize the view light
         */
        this.initViewLight();
        // this.cameraModel.addChild(this.unitQuad);

    }

    /**
     * We update the scene here
     * @param t
     * @param args
     */
    timeUpdate(t: number, ...args:any[]) {
        // this.unitQuad.transform.position = V3();
        // this.unitQuad.transform.rotation = Quaternion.RotationX(t*0.1);
        this.basicUpdate(t, ...args);
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
    }

    getCoordinatesForCursorEvent(event: AInteractionEvent){
        return event.ndcCursor??new Vec2();
    }
}


