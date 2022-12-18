import { ASceneController } from "src/anigraph";
import {ASceneModelWithIBRData} from "./ASceneModelWithIBRData";

export interface ASceneControllerWithIBR extends ASceneController{
    model:ASceneModelWithIBRData;
}
