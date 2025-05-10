import express, { type Request, type Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createClient } from "redis";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: ["http://localhost:5173"],
});

const client = createClient({
	username: "Pratik",
	password: "T5!Gp6347@ujswg",
	socket: {
		host: "redis-11470.crce182.ap-south-1-1.ec2.redns.redis-cloud.com",
		port: 11470,
	},
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();
await client.set("foo", "bar");
const result = await client.get("foo");
console.log(result); // >>> bar

app.get("/", (req: Request, res: Response) => {
	res.send("Hello World");
});

io.on("connection", (socket) => {
	console.log("A user Connected", socket.id);
	socket.emit("welcome", `Welcome User ${socket.id}`);
	socket.on("client-moved", async (data) => {
		console.log(data.id, " tank moved", Math.random());
		const result = await client.set(data.id, data.position);
		console.log(result);
		// socket.broadcast.emit("send-movement", {
		// 	id: data.id,
		// 	message: "This tank is moving",
		// });
	});
});

server.listen(3000, () => {
	console.log("Server is listening at port 3000");
});
