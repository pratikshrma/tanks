import express, { type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createClient } from "redis";
import cors from "cors";

const app = express();
const server = createServer(app);
app.use(cors());
const io = new Server(server, {
	cors: ["http://localhost:5173"],
});

const client = createClient({
	url: "redis://localhost:6379",
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

app.get("/", async (req: Request, res: Response) => {
	const allKeys = await client.scan("0");
	const coords = await Promise.all(
		allKeys.keys.map(async (key) => {
			return {
				id: key,
				position: await client.hGetAll(key),
			};
		})
	);
	console.log(coords);
	return res.status(200).json({
		coords,
	});
});

app.get("/flush", async (req: Request, res: Response) => {
	const result = await client.flushAll("ASYNC");
	res.send("Flushed the redis");
});

io.on("connection", (socket) => {
	console.log("A user Connected", socket.id);
	socket.emit("welcome", `Welcome User ${socket.id}`);
	socket.on("client-moved", async (data) => {
		console.log(data.id, " tank moved", Math.random());
		const result = await client.hSet(data.id, data.position);
		console.log(result);
		// socket.broadcast.emit("send-movement", {
		// 	id: data.id,
		// 	message: "This tank is moving",
		// });
	});

	socket.on("disconnect", async () => {
		await client.del(socket.id);
	});
});

server.listen(3000, () => {
	console.log("Server is listening at port 3000");
});
