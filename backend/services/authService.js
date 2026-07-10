import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUserService = async (userData) => {

    const {
        full_name,
        email,
        password
    } = userData;

    const existingUser = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
        `
        INSERT INTO users
        (
            full_name,
            email,
            password
        )
        VALUES ($1, $2, $3)
        `,
        [
            full_name,
            email,
            hashedPassword
        ]
    );

    return {
        message: "User registered successfully."
    };

};

export const loginUserService = async (userData) => {

    const {
        email,
        password
    } = userData;

    const existingUser = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    if (existingUser.rows.length === 0) {

        throw new Error("Invalid Email or Password.");

    }

    const user = existingUser.rows[0];

    const isPasswordCorrect =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isPasswordCorrect) {

        throw new Error("Invalid Email or Password.");

    }
    const token = jwt.sign(
    {
        id: user.id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "24h"
    }
);

return {
    message: "Login successful.",
    token,
    user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
    }
};

};