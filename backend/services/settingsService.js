import pool from "../config/db.js";

// Get Current Method
export const getCostBasisMethodService = async () => {

    const result = await pool.query(
        "SELECT cost_basis_method FROM settings LIMIT 1"
    );

    return result.rows[0];
};

// Update Method
export const updateCostBasisMethodService = async (method) => {

    const result = await pool.query(
        `
        UPDATE settings
        SET cost_basis_method=$1
        RETURNING *;
        `,
        [method.toUpperCase()]
    );

    return result.rows[0];
};