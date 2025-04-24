import { Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

class ResourceManager {
	private static _instance = new ResourceManager();
	public static get instance() {
		return this._instance;
	}

	private constructor() {}

	//resource list
	private _groundTexture: Texture[] = [];
	private _models = new Map<string, GLTF>();
	private _textures = new Map<string, Texture>();

	//public methods to access game loaded resources
	public getModel(modelName: string): GLTF | undefined {
		return this._models.get(modelName);
	}

	public getTexture(textureName: string): Texture | undefined {
		return this._textures.get(textureName);
	}

	//load entry point
	public load = async () => {
		const textureLoader = new TextureLoader();
		await this.loadGroundTextures(textureLoader);
		await this.loadTextures(textureLoader);
		await this.loadModels();
	};

	private loadModels = async () => {
		//instance a model loader
		const modelLoader = new GLTFLoader();
		const playerTank = await modelLoader.loadAsync("models/tank.glb");

		this._models.set("tank", playerTank);
	};

	private loadTextures = async (textureLoader: TextureLoader) => {
		const tankBodyTexture = await textureLoader.loadAsync(
			"textures/tank-body.png"
		);
		const tankTurretTexture = await textureLoader.loadAsync(
			"textures/tank-turret.png"
		);

		//add this to the game resources
		this._textures.set("tank-body", tankBodyTexture);
		this._textures.set("tank-turret", tankTurretTexture);

		//walls
		const wallTexture = await textureLoader.loadAsync("textures/wall.png");
		this._textures.set("wall", wallTexture);
	};

	private loadGroundTextures = async (textureLoader: TextureLoader) => {
		const groundTextureFiles = [
			"g1.png",
			"g2.png",
			"g3.png",
			"g4.png",
			"g5.png",
			"g6.png",
		];

		//load the textures
		for (let index = 0; index < groundTextureFiles.length; index++) {
			const element = groundTextureFiles[index];
			const texture = await textureLoader.loadAsync(
				`textures/${element}`
			);
			this._groundTexture.push(texture);
		}
	};

	public getRandomGroundTexture = () => {
		const texture =
			this._groundTexture[
				Math.floor(Math.random() * this._groundTexture.length)
			];
		return texture;
	};
}

export default ResourceManager;
