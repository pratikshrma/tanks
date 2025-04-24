import { Box3, Box3Helper, Mesh, Sphere, Vector3 } from "three";

// discrimination for the type of entity
type EntityType = "general" | "player" | "bullet";

abstract class GameEntity {
	protected _position: Vector3;
	protected _mesh: Mesh = new Mesh();
	public get mesh() {
		return this._mesh;
	}

	protected _collider?: Box3 | Sphere;
	protected _colliderHelper?: Box3Helper;

	protected _entityType: EntityType;
	public get entityType() {
		return this._entityType;
	}

	//flag to let the GameScene know this entity will be disposed
	protected _shouldDispose = false;
	public get shouldDispose() {
		return this._shouldDispose;
	}

	public get collider() {
		return this._collider;
	}
	public get colliderHelper() {
		return this._colliderHelper;
	}

	constructor(position: Vector3, entityType: EntityType) {
		this._position = position;
		this.mesh.position.set(
			this._position.x,
			this._position.y,
			this._position.z
		);
		this._entityType = entityType;
	}

	public load = async () => {};
	public update = (deltaT: number) => {};

	//method to be called before disposing the entity (to free resources)
	public dispose = () => {};
}

export default GameEntity;
