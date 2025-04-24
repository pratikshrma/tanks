import {
	Box3,
	Box3Helper,
	BoxGeometry,
	Mesh,
	MeshStandardMaterial,
	Vector3,
} from "three";
import GameEntity from "../entities/GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";

class Wall extends GameEntity {
	constructor(position: Vector3) {
		super(position, "general");
	}

	public load = async () => {
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new MeshStandardMaterial({
			map: ResourceManager.instance.getTexture("wall"),
		});
		this._mesh = new Mesh(geometry, material);

		//set position
		this._mesh.position.set(
			this._position.x,
			this._position.y,
			this._position.z
		);
		this._collider = new Box3().setFromObject(this._mesh);

		//FOR TESTING ONLY
		this._colliderHelper = new Box3Helper(this._collider, 0xff0000);
		GameScene.instance.scene.add(this._colliderHelper);
	};
}

export default Wall;
