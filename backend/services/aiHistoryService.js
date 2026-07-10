import pool from "../config/db.js";

// ================= SAVE CHAT =================

export const saveChatHistoryService = async (
    userId,
    question,
    response
) => {

    const result = await pool.query(
        `
        INSERT INTO ai_chat_history
        (
            user_id,
            question,
            response
        )
        VALUES ($1,$2,$3)
        RETURNING *;
        `,
        [
            userId,
            question,
            response
        ]
    );

    return result.rows[0];

};

// ================= GET HISTORY =================

export const getChatHistoryService = async (
    userId
) => {

    const result = await pool.query(
        `
        SELECT
            id,
            question,
            response,
            created_at
        FROM ai_chat_history
        WHERE user_id = $1
        ORDER BY created_at DESC;
        `,
        [userId]
    );

    return result.rows;

};

// ================= LAST N CHATS =================

export const getRecentChatsService = async (
    userId,
    limit = 5
) => {

    const result = await pool.query(
        `
        SELECT
            question,
            response
        FROM ai_chat_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
        `,
        [
            userId,
            limit
        ]
    );

    return result.rows.reverse();

};


// ================= DELETE CHAT =================

export const deleteChatService = async (
    userId,
    chatId
) => {

    const result = await pool.query(
        `
        DELETE FROM ai_chat_history
        WHERE id = $1
        AND user_id = $2
        RETURNING *;
        `,
        [
            chatId,
            userId
        ]
    );

    return result.rows[0];

};