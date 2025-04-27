import { Vector3, Mesh, MeshStandardMaterial, Sphere, Box3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";
import Bullet from "./Bullets";
import ShootEffect from "../effects/ShootEffect";

type KeyboardState = {
	LeftPressed: boolean;
	RightPressed: boolean;
	UpPressed: boolean;
	DownPressed: boolean;
};

class PlayerTank extends GameEntity {
	private _rotation: number = 0;

	private _keyboardState: KeyboardState = {
		LeftPressed: false,
		RightPressed: false,
		DownPressed: false,
		UpPressed: false,
	};

	constructor(position: Vector3) {
		super(position, "player");

		//listen to the methods that track keyboard state
		window.addEventListener("keydown", this.handleKeyDown);
		window.addEventListener("keyup", this.handleKeyUp);
	}

	//handle key pressing
	private handleKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case "w":
				this._keyboardState.UpPressed = true;
				break;
			case "s":
				this._keyboardState.DownPressed = true;
				break;
			case "a":
				this._keyboardState.LeftPressed = true;
				break;
			case "d":
				this._keyboardState.RightPressed = true;
				break;
			default:
				break;
		}
	};

	private handleKeyUp = (e: KeyboardEvent) => {
		switch (e.key) {
			case "w":
				this._keyboardState.UpPressed = false;
				break;
			case "s":
				this._keyboardState.DownPressed = false;
				break;
			case "a":
				this._keyboardState.LeftPressed = false;
				break;
			case "d":
				this._keyboardState.RightPressed = false;
				break;
			case "f":
				this.shoot();
				break;
			default:
				break;
		}
	};

	private shoot = async () => {
		//create an offset pos
		console.log("Shoot function triggered");
		const offset = new Vector3(
			Math.sin(this._rotation) * 0.45,
			-Math.cos(this._rotation) * 0.45,
			0.5
		);

		const shootingPosition = this._mesh.position.clone().add(offset);
		const bullet = new Bullet(shootingPosition, this._rotation);
		await bullet.load();

		//add effect
		const shootEffect = new ShootEffect(shootingPosition, this._rotation);
		await shootEffect.load();

		GameScene.instance.addToScene(shootEffect);
		GameScene.instance.addToScene(bullet);
	};

	public load = async () => {
		const tankModel = ResourceManager.instance.getModel("tank");
		if (!tankModel) {
			throw "Unable to get tank model";
		}

		const tankBodyMesh = tankModel.scene.children.find(
			(m) => m.name === "Body"
		) as Mesh;

		const tankTurretMesh = tankModel.scene.children.find(
			(m) => m.name === "Turret"
		) as Mesh;

		const tankBodyTexture =
			ResourceManager.instance.getTexture("tank-body");
		const tankTurretTexture =
			ResourceManager.instance.getTexture("tank-turret");

		if (
			!tankBodyMesh ||
			!tankTurretMesh ||
			!tankBodyTexture ||
			!tankTurretTexture
		) {
			throw "Unable to load player model or textures";
		}

		const bodyMaterial = new MeshStandardMaterial({
			map: tankBodyTexture,
		});
		const turretMaterial = new MeshStandardMaterial({
			map: tankTurretTexture,
		});

		tankBodyMesh.material = bodyMaterial;
		tankTurretMesh.material = turretMaterial;

		this._mesh.add(tankBodyMesh);
		this._mesh.add(tankTurretMesh);

		//create a collider for the tank
		const collider = new Box3()
			.setFromObject(this._mesh)
			.getBoundingSphere(new Sphere(this._mesh.position.clone()));

		collider.radius *= 0.75;
		this._collider = collider;
	};

	public update = (deltaT: number) => {
		let computedRotation = this._rotation;
		let computedMovements = new Vector3();
		const moveSpeed = 2;

		if (this._keyboardState.LeftPressed) {
			computedRotation += Math.PI * deltaT;
		} else if (this._keyboardState.RightPressed) {
			computedRotation -= Math.PI * deltaT;
		}

		const fullCircle = Math.PI * 2;
		if (computedRotation > fullCircle) {
			computedRotation = fullCircle - computedRotation;
		} else if (computedRotation < 0) {
			computedRotation = fullCircle + computedRotation;
		}

		const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
		const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);

		if (this._keyboardState.UpPressed) {
			computedMovements = new Vector3(xMovement, -yMovement, 0);
		} else if (this._keyboardState.DownPressed) {
			computedMovements = new Vector3(-xMovement, yMovement, 0);
		}

		this._rotation = computedRotation;
		this.mesh.setRotationFromAxisAngle(
			new Vector3(0, 0, 1),
			computedRotation
		);

		//before updating the position check if there is a problem with the colliders
		const testingSphere = this._collider?.clone() as Sphere;
		testingSphere.center.add(computedMovements);

		//search for possible collisions
		const colliders = GameScene.instance.gameEntities.filter(
			(e) =>
				e !== this &&
				e.collider &&
				e.entityType !== "bullet" &&
				e.collider?.intersectsSphere(testingSphere)
		);

		if (colliders.length) {
			console.log(colliders);
			return;
		}

		this._mesh.position.add(computedMovements);

		//update the collider as well
		(this._collider as Sphere).center.add(computedMovements);
		//make the camera follow the player tank
		GameScene.instance.camera.position.set(
			this._mesh.position.x,
			this._mesh.position.y,
			GameScene.instance.camera.position.z
		);
	};
}

export default PlayerTank;
