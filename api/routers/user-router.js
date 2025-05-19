import { Router } from "express";
import { query } from "../configs/postgres-connection.js";
const userRouter = Router();

userRouter.get("/", async (req, res) => {
  try {
    const users = await query("SELECT * FROM public.accounts ORDER BY id ASC ");
    console.log(users);
    res.status(200).json(users.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
userRouter.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const newUser = query(
      "INSERT INTO public.accounts (Name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json((await newUser).rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default userRouter;
