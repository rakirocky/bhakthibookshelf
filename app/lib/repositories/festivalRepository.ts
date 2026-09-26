import { db } from "../db/db";

export interface FestivalDateRow {
  id: number;
  festival_key: string;
  /** YYYY-MM-DD */
  start_date: string;
  /** YYYY-MM-DD, inclusive; null for a one-day festival */
  end_date: string | null;
}

// Dates come back as plain YYYY-MM-DD strings (to_char), never JS Dates,
// so no server time zone can shift a festival by a day.
const COLUMNS = `
  id,
  festival_key,
  to_char(start_date, 'YYYY-MM-DD') AS start_date,
  to_char(end_date, 'YYYY-MM-DD') AS end_date
`;

export class FestivalRepository {
  static async getAll(): Promise<FestivalDateRow[]> {
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM festival_dates ORDER BY start_date, id`
    );
    return rows;
  }

  /** Rows whose date range overlaps [start, end] (inclusive). */
  static async findOverlapping(start: string, end: string): Promise<FestivalDateRow[]> {
    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM festival_dates
       WHERE start_date <= $2::date AND COALESCE(end_date, start_date) >= $1::date
       ORDER BY start_date`,
      [start, end]
    );
    return rows;
  }

  static async create(data: { festivalKey: string; start: string; end: string | null }) {
    const { rows } = await db.query(
      `INSERT INTO festival_dates (festival_key, start_date, end_date)
       VALUES ($1, $2::date, $3::date)
       RETURNING ${COLUMNS}`,
      [data.festivalKey, data.start, data.end]
    );
    return rows[0] as FestivalDateRow;
  }

  static async delete(id: number) {
    await db.query(`DELETE FROM festival_dates WHERE id = $1`, [id]);
  }
}
