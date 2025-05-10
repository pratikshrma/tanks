import { DodecahedronGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import GameEntity from "../entities/GameEntity";
import { randomIntInRange, randomSign } from "../utils/MathUtils";

class ExplosionEffect extends GameEntity {
	private _fireMesh = new Mesh();
	private _size: number;
	private _effectDuration = 0.5; //in seconds
	private _currentDuration: number;

	constructor(position: Vector3, size: number) {
		super(position, "general");
		this._size = size;
		this._currentDuration = this._effectDuration / 2;
	}

	public load = async () => {
		console.log("Load function for the explosion triggered");
		const particleGeometry = new DodecahedronGeometry(this._size, 0);

		const fireMaterial = new MeshPhongMaterial({
			color: 0xff0000,
			transparent: true,
		});

		const totalParticle = randomIntInRange(1, 5);
		for (let i = 0; i < totalParticle; i++) {
			const particleAngle = Math.random() * Math.PI * 2;
			const fireGeometry = particleGeometry.clone(); //need to clone to have unique particles
			// const particleSize =
			// 	0.3 * this._size +
			// 	Math.random() * this._size * 0.4 * randomSign();

			// fireGeometry.scale(particleSize, particleSize, particleSize);

			// fireGeometry.rotateX(Math.random() * Math.PI);
			// fireGeometry.rotateY(Math.random() * Math.PI);
			// fireGeometry.rotateZ(Math.random() * Math.PI);

			const fireParticle = new Mesh(fireGeometry, fireMaterial);
			fireParticle.userData = {
				angle: particleAngle,
				speed: 0.5 + Math.random() * 2.5,
			};
			this._fireMesh.add(fireParticle);

			// const smokeEffectOffset = new Vector3(
			// 	Math.random() * this._size * randomSign(),
			// 	Math.random() * this._size * randomSign(),
			// 	Math.random() * this._size * randomSign()
			// );
			// const smokeParticle = new Mesh(particleGeometry, fireMaterial);
			// smokeParticle.position.add(smokeEffectOffset);
			// this._fireMesh.add(smokeParticle);
		}
		this._mesh.add(this._fireMesh);
	};

	public update = (deltaT: number) => {
		this._effectDuration -= deltaT;
		if (this._effectDuration <= 0) {
			console.log("should dispose now");
			this._shouldDispose = true;
			return;
		}

		// const scale = this._currentDuration / this._effectDuration;

		this._fireMesh.children.forEach((element) => {
			const fireParticle = element as Mesh;
			const angle = fireParticle.userData["angle"];
			const speed = fireParticle.userData["speed"];

			const computedMovement = new Vector3(
				speed * Math.sin(angle) * deltaT,
				-speed * Math.cos(angle) * deltaT,
				0
			);

			// fireParticle.scale.set(scale, scale, scale);
			fireParticle.position.add(computedMovement);

			(fireParticle.material as MeshPhongMaterial).opacity =
				this._effectDuration;

			// fireParticle.position.add(new Vector3(0, 0, 3 * deltaT));
		});
	};

	public dispose = () => {
		this._fireMesh.children.forEach((element) => {
			(element as Mesh).geometry.dispose();
			((element as Mesh).material as MeshPhongMaterial).dispose();
			this._fireMesh.remove(element);
		});
		this._mesh.remove(this._fireMesh);
	};
}

export default ExplosionEffect;
