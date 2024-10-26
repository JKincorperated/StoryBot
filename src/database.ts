import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export type serverConfig = {
    server_id: string,
    channel_id: string,
    output_channel_id: string,
    current_passage: string,
    last_sender: string
}

/**
 * open_database
*/
export async function open_database() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    db.exec(`
        CREATE TABLE IF NOT EXISTS server_config (
            server_id TEXT PRIMARY KEY,
            channel_id TEXT,
            output_channel_id TEXT,
            current_passage TEXT,
            last_sender TEXT
        )
    `);

    return db;
}