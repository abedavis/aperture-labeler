import { ASceneController } from "src/anigraph";
import {ASceneModelWithIBRData} from "./ASceneModelWithIBRData";
import { IBRSceneView } from "./IBRSceneView";

export interface ASceneControllerWithIBR extends ASceneController{
    model:ASceneModelWithIBRData;
}
