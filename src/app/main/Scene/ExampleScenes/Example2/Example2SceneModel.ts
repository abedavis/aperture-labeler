import {
    A3DModelLoader,
    ACameraModel, AInteractionEvent,
    AModel, AObject3DModelWrapper,
    APointLightModel, AShaderMaterial, AShaderModel,
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
import {UnitQuadModel} from "../../../Nodes/UnitQuadModel";
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
    ExampleImageDisplay="exampleimagedisplay"
}

const RenderTargetWidth:number=512;
const RenderTargetHeight:number=512;

export class Example2SceneModel extends MainSceneModel {
    loaded3DModel!:AObject3DModelWrapper;
    playerMaterial!:AShaderMaterial;

    // This is optionally another camera model that we can use for rendering an initial pass
    renderToTextureCamera!:ACameraModel;

    // This is our render target for our render-to-texture pass
    textureRenderTargets:ARenderTarget[]=[];
    currentTextureRenderTargetIndex:number=0;
    lastTextureRenderTargetIndex:number=0;


    unitQuad!:UnitQuadModel;


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
        basicshader1ShaderMaterialModel.usesVertexColors=true;
        this.playerMaterial = this.materials.CreateShaderMaterial(MyMaterialNames.basicshader1);
        let dragonTransform = NodeTransform3D.FromPositionZUpAndScale(V3(), Vec3.UnitZ(),Vec3.UnitX().times(-1), 0.005);
        this.loaded3DModel = await this.loadModelFromFile("./models/ply/dragon_color_onground.ply", dragonTransform);




        /**
         * Below we set up two render targets to use for render-to-texture effects.
         */

        /**
         * Here we will create two texture render targets, which are textures that we can both render to and use for
         * rendering. We create two of them so that we can render to one while the other is being used as a material
         * texture. We will switch which one we use for which each frame.
         */
        this.textureRenderTargets.push(new ARenderTarget(RenderTargetWidth, RenderTargetHeight));
        this.textureRenderTargets.push(new ARenderTarget(RenderTargetWidth, RenderTargetHeight));

        /**
         * We will use a simple shader that just takes an input texture and displays it based on the texture coordinates
         * of geometry.
         */
        let imageDisplayShader = await AShaderModel.CreateModel("exampleimagedisplay");
        await this.materials.setMaterialModel(MyMaterialNames.ExampleImageDisplay, imageDisplayShader);

    }


    initCamera() {
        this.cameraModel = ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
        this.cameraModel.setPose(
            NodeTransform3D.LookAt(
                V3(-0.2, 0.8, 0.75), V3(0,0,0.5),
                V3(0,0,0.4)
            )
        )

        this.renderToTextureCamera=ACameraModel.CreatePerspectiveFOV(90, 1, 0.01, 10);
        this.cameraModel.addChild(this.renderToTextureCamera);

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



        /**
         * Now we will set up a simple quad to display the output of our render-to-texture pass. Here we are just placing
         * the quad at a convenient visible location in the scene.
         */
        let displayTexMaterial = this.materials.CreateShaderMaterial(MyMaterialNames.ExampleImageDisplay);
        this.unitQuad = new UnitQuadModel(displayTexMaterial);
        this.unitQuad.transform.position = V3(0.0,-1.0,0.5);
        this.unitQuad.transform.rotation = Quaternion.RotationZ(Math.PI).times(Quaternion.RotationX(-Math.PI*0.5));
        this.unitQuad.transform.scale = 2.0;
        this.addChild(this.unitQuad);

    }

    /**
     * Get the render target being rendered to in the current frame
     * @returns {ARenderTarget}
     */
    get currentTextureRenderTarget(){
        return this.textureRenderTargets[this.currentTextureRenderTargetIndex];
    }

    /**
     * Swap which of our two render targets is being used to texture the quad in our scene
     */
    updateUnitQuadInputTexture(){
        this.unitQuad.material.setTexture("input", this.textureRenderTargets[this.lastTextureRenderTargetIndex].targetTexture);
    }

    /**
     * To be called by the scene controller before the render-to-texture pass
     */
    prepRenderToTexturePass(){
        this.updateUnitQuadInputTexture();
    }

    /**
     * To be called by the scene controller before rendering the scene to the screen
     */
    prepFinalPass(){

        /**
         * Update which render target was used last
         * @type {number}
         */
        this.lastTextureRenderTargetIndex = this.currentTextureRenderTargetIndex;

        /**
         * Update which is the current render target
         * @type {number}
         */
        this.currentTextureRenderTargetIndex =(this.currentTextureRenderTargetIndex+1)%this.textureRenderTargets.length;

        /**
         * Update the unit quad's input texture.
         */
        this.updateUnitQuadInputTexture();
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


