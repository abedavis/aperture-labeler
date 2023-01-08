// Copied from https://github.com/mrdoob/three.js/blob/3bc0667e519a03b3b71c5408f17b53adbb4c541f/examples/jsm/loaders/TIFFLoader.js
import {
	DataTextureLoader,
	LinearFilter,
	LinearMipmapLinearFilter,
    LoadingManager
} from 'three';
import UTIF from 'utif';
import {decode} from 'tiff';

class TIFFLoader extends DataTextureLoader {
    data!: Float32Array

	constructor(manager?: LoadingManager) {
		super(manager);
	}

	parse(buffer: Buffer | ArrayBuffer) {
        const ifds = decode(buffer);
		// const ifds = UTIF.decode( buffer );
		// UTIF.decodeImage( buffer, ifds[ 0 ] );
        // console.log(buffer);

		// const rgba = UTIF.toRGBA8( ifds[ 0 ] );
        

		// return {
		// 	width: ifds[ 0 ].width,
		// 	height: ifds[ 0 ].height,
		// 	data: rgba,
		// 	flipY: true,
		// 	magFilter: LinearFilter,
		// 	minFilter: LinearMipmapLinearFilter
		// };
        this.data = ifds[0].data as Float32Array;
        return {
			width: ifds[0].width,
			height: ifds[0].height,
			data: ifds[0].data,
			flipY: true,
			magFilter: LinearFilter,
			minFilter: LinearMipmapLinearFilter
		};

	}
}

export { TIFFLoader };