const express = require('express');
const app = express();
const PORT = 3000;
const { Pool } = require('pg');

// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'QAP3',
    password: 'password',
    port: 5432,
});

app.use(express.json());


// Function to create tasks table
async function createTasksTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                description TEXT NOT NULL,
                status TEXT NOT NULL
            );
        `);
        console.log("Tasks table created successfully.");
    }
    catch (error) {
        console.error("Error creating tasks table: ", error);
    }
}

// GET /tasks - Get all tasks
app.get('/tasks', async (request, response) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        response.json(result.rows);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (request, response) => {
    const { id, description, status } = request.body;
    if (!description || !status) {
        return response.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pool.query (
            `INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *`,
            [description, status]
        );
        response.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// PUT /tasks/:id - Update a task's status
app.put('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);
    const { status } = request.body;
    const task = tasks.find(t => t.id === taskId);

    try {
        const result = await pool.query(
            `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
            [status, taskId]
        );

        // Check if the task exists
        if (result.rowCount === 0) {
            return response.status(404).json({ error: 'Task not found' });
        }

        // Send the updated task as the response
        response.json({ message: 'Task updated successfully' });
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', async (request, response) => {
    const taskId = parseInt(request.params.id, 10);

    try {
        const result = await pool.query(
            `DELETE FROM tasks WHERE id = $1 RETURNING *`,
            [taskId]
        );

        response.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error(error);
        response.status(500).send('Server error');
    }
});

// Initialize database and start server
createTasksTable()
    .then(() => app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`)));
