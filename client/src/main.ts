import "./style.css";
import GameScene from "./scene/GameScene";
import { io } from "socket.io-client";
export const socket = io("http://localhost:3000/");

await GameScene.instance.load();
GameScene.instance.render();
