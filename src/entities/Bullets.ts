import {
	Box3,
	Material,
	Mesh,
	MeshStandardMaterial,
	Sphere,
	SphereGeometry,
	Vector3,
} from "three";
import GameEntity from "./GameEntity";
import GameScene from "../scene/GameScene";
import ExplosionEffect from "../effects/ExplosionEffect";

class Bullet extends GameEntity {
	private _angle: number;

	constructor(position: Vector3, angle: number) {
		super(position, "bullet");
		this._angle = angle;
	}

	public load = async () => {
		const bulletGeo = new SphereGeometry(0.085);
		const bulletMat = new MeshStandardMaterial({ color: 0xff0000 });
		this._mesh = new Mesh(bulletGeo, bulletMat);

		this._mesh.position.set(this._position.x, this._position.y, 0);

		this._collider = new Box3()
			.setFromObject(this._mesh)
			.getBoundingSphere(new Sphere(this._mesh.position));
	};

	//update method
	public update = async (deltaT: number) => {
		const traveSpeed = 9;
		const computedMovement = new Vector3(
			traveSpeed * Math.sin(this._angle) * deltaT,
			-traveSpeed * Math.cos(this._angle) * deltaT,
			0
		);

		//move the bullet and its collider
		this._mesh.position.add(computedMovement);

		//check for collision
		const collider = GameScene.instance.gameEntities.filter(
			(e) =>
				e !== this &&
				e.collider &&
				e.entityType !== "player" &&
				e.collider.intersectsSphere(this._collider as Sphere)
		);

		if (collider.length) {
			//just before disposing it add that effect
			const explosionEffect = new ExplosionEffect(
				this._mesh.position,
				0.1
			);
			await explosionEffect.load().then(() => {
				GameScene.instance.addToScene(explosionEffect);
			});

			console.log("Should load the smoke effect now");

			this._shouldDispose = true;
		}
	};

	public dispose = () => {
		(this._mesh.material as Material).dispose();
		this._mesh.geometry.dispose();
	};
}

export default Bullet;
