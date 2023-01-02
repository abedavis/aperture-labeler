/**
 * @file Manages the configuration settings for the widget.
 * @author Abe Davis
 * @description Main react component for the app. If you want to add additional react widgets you are welcome, but this
 * generally shouldn't be necessary.
 */

import {GetAppState} from "./MainAppState";
import {Layout} from "./style";
import {AThreeJSContextComponent, ControlPanel} from "../../anigraph";
import React, {useState} from "react";


import {MainSceneRootModel} from "./Scene/MainSceneRootModel";
import {MainSceneController} from "./Scene/MainSceneController";
const SceneModel = new MainSceneRootModel();
SceneModel.confirmInitialized();
const SceneController = new MainSceneController(SceneModel);

// import {MainSceneRootModel} from "./AnotherScene/MainSceneRootModel";
// import {MainSceneController} from "./AnotherScene/MainSceneController";
// const SceneModel = new MainSceneRootModel();
// SceneModel.confirmInitialized();
// const SceneController = new MainSceneController(SceneModel);

/**
 * Comment out the code above and uncomment the code below to run the Example1Scene
 * Which has a loaded 3D model and the billboard particle system skeleton code
 */
// import {Example1SceneModel} from "./Scene/ExampleScenes/Example1";
// import {Example1SceneController} from "./Scene/ExampleScenes/Example1";
// const SceneModel = new Example1SceneModel();
// SceneModel.confirmInitialized();
// const SceneController = new Example1SceneController(SceneModel);


// import {Example2SceneModel} from "./Scene/ExampleScenes/Example2";
// import {Example2SceneController} from "./Scene/ExampleScenes/Example2";
// const SceneModel = new Example2SceneModel();
// SceneModel.confirmInitialized();
// const SceneController = new Example2SceneController(SceneModel);

// import {Example3SceneModel} from "./Scene/ExampleScenes/Example3";
// import {Example3SceneController} from "./Scene/ExampleScenes/Example3";
// const SceneModel = new Example3SceneModel();
// SceneModel.confirmInitialized();
// const SceneController = new Example3SceneController(SceneModel);



let appState = GetAppState();

export function MainComponent() {
    return (
        <div>
            <ControlPanel appState={appState}></ControlPanel>
                <Layout>
                    <div className={"container-fluid"}>
                    <div className={"row"}>
                        <h1><a
                            href={"https://www.cs.cornell.edu/courses/cs4620/2022fa/assignments/docs/category/creative-1"}>Creative 01</a></h1>
                    </div>
                    <div className={"row"}>
                        <AThreeJSContextComponent
                            controller={SceneController}
                        />
                    </div>
                    </div>
                </Layout>

        </div>
    );
}
