import {
	PerspectiveCamera,
	WebGLRenderer,
	Scene,
	Vector3,
	HemisphereLight,
	Clock,
} from "three";
import GameEntity from "../entities/GameEntity";
import GameMap from "../map/GameMap";
import ResourceManager from "../utils/ResourceManager";
import PlayerTank from "../entities/PlayerTank";
import Wall from "../map/Wall";
import EnemyTank from "../entities/EnemyTank";
import { socket } from "../main";
import axios from "axios";

interface position {
	id: string;
	position: {
		x: number;
		y: number;
		z: number;
		rotation: number;
	};
}

export default class GameScene {
	private static _instance = new GameScene();
	public static get instance() {
		return this._instance;
	}

	private _width: number;
	private _height: number;

	private _renderer: WebGLRenderer;
	private _camera: PerspectiveCamera;

	private readonly _scene = new Scene();

	//game entities array
	private _gameEntities: GameEntity[] = [];

	private _clock: Clock = new Clock();

	private _mapSize = 15;

	private _playerCoords: position[] = [];

	//exposing the cameras
	public get camera() {
		return this._camera;
	}

	public get gameEntities() {
		return this._gameEntities;
	}

	public get scene() {
		return this._scene;
	}

	private constructor() {
		this._width = window.innerWidth;
		this._height = window.innerHeight;

		this._renderer = new WebGLRenderer({
			alpha: true,
			antialias: true,
		});
		this._renderer.setPixelRatio(window.devicePixelRatio);
		this._renderer.setSize(this._width, this._height);

		//find the html element
		const targetElement = document.querySelector<HTMLDivElement>("#app");
		if (!targetElement) {
			throw "unable to find target element";
		}
		targetElement.appendChild(this._renderer.domElement);

		//setup camera
		const aspectRatio = this._width / this._height;
		this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 100);
		this._camera.position.set(7, 7, 15);

		window.addEventListener("resize", this.resize, false);

		const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize);
		this._gameEntities.push(gameMap);

		const playerTank = new PlayerTank(new Vector3(7, 7, 0));
		this.gameEntities.push(playerTank);

		const enemyTank = new EnemyTank(new Vector3(3, 3, 0));
		this._gameEntities.push(enemyTank);

		// const enemyTank1 = new EnemyTank(new Vector3(3, 7, 0));
		// this._gameEntities.push(enemyTank1);
		this.createWalls();
	}

	private createOtherPlayerTanks = async () => {
		console.log("Create tanks function triggered");

		//before initialization get get position and id of all the tanks
		const { data } = await axios.get(
			`${import.meta.env.VITE_SERVER_DOMAIN}/`
		);
		console.log(data.coords);
		this._playerCoords = data.coords;
		this._playerCoords = this._playerCoords.filter(
			(player) => player.id !== socket.id
		);

		for (const each of this._playerCoords) {
			console.log(each);
			const enemyTank = new EnemyTank(
				new Vector3(each.position.x, each.position.y, 0),
				each.position.rotation
			);
			await enemyTank.load();
			// // GameScene.instance.addToScene(enemyTank);
			// this._gameEntities.push(enemyTank);
			this._scene.add(enemyTank.mesh);
		}
		console.log(GameScene.instance.gameEntities);
	};

	private createWalls = () => {
		const edge = this._mapSize - 1;
		const wall = new Wall(new Vector3(0, 0, 0));
		this._gameEntities.push(wall);

		this._gameEntities.push(new Wall(new Vector3(edge, 0, 0)));
		this._gameEntities.push(new Wall(new Vector3(edge, edge, 0)));
		this._gameEntities.push(new Wall(new Vector3(0, edge, 0)));

		// fill in the gaps between the edge walls
		for (let i = 0; i < edge; i++) {
			this._gameEntities.push(new Wall(new Vector3(i, 0, 0)));
			this._gameEntities.push(new Wall(new Vector3(0, i, 0)));
			this._gameEntities.push(new Wall(new Vector3(edge, i, 0)));
			this._gameEntities.push(new Wall(new Vector3(i, edge, 0)));
		}
	};

	private resize = () => {
		this._width = window.innerWidth;
		this._height = window.innerHeight;
		this._renderer.setSize(this._width, this._height);
		this._camera.aspect = this._width / this._height;
		this._camera.updateProjectionMatrix();
	};

	public load = async () => {
		// const geo = new BoxGeometry();
		// const mat = new MeshBasicMaterial({
		// 	color: 0xff0000,
		// });
		// const mesh = new Mesh(geo, mat);
		// this._scene.add(mesh);

		//load game resources
		await ResourceManager.instance.load();
		console.log("Texture loaded Successfully");

		for (let index = 0; index < this._gameEntities.length; index++) {
			const element = this._gameEntities[index];
			await element.load();
			this._scene.add(element.mesh);
		}

		await this.createOtherPlayerTanks();

		//add light to the scene
		const light = new HemisphereLight(0xffffff, 0x080820, 1);
		this._scene.add(light);
	};

	public render = () => {
		requestAnimationFrame(this.render);
		//remove entities no longer needed
		this.disposeEntities();

		const deltaT = this._clock.getDelta();
		//update the stat of all entities
		for (let index = 0; index < this._gameEntities.length; index++) {
			const element = this._gameEntities[index];
			element.update(deltaT);
		}
		this._renderer.render(this._scene, this._camera);
	};

	//method to dynamically add entities to the scene
	public addToScene = (entity: GameEntity) => {
		this._gameEntities.push(entity);
		this._scene.add(entity.mesh);
	};

	private disposeEntities = () => {
		const entitiesToBeDisposed = this._gameEntities.filter(
			(e) => e.shouldDispose
		);
		entitiesToBeDisposed.forEach((element) => {
			this._scene.remove(element.mesh);
			element.dispose();
		});
		//update entities array
		this._gameEntities = [
			...this._gameEntities.filter((e) => !e.shouldDispose),
		];
	};
}
