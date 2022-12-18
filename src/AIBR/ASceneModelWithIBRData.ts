import { ASceneModel } from "src/anigraph";
import {IBRSceneData} from "./IBRSceneData";
import {IBRDataModel} from "./IBRDataModel";

export interface ASceneModelWithIBRData extends ASceneModel{
    ibr:IBRDataModel;
}
