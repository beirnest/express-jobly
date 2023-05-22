"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle }
     *
     * Returns { id, title, salary, equity, company_handle }
     * */
  
    static async create({ title, salary, equity, companyHandle }) {
      const result = await db.query(
            `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
          [
            title,
            salary,
            equity,
            companyHandle,
          ],
      );
      const job = result.rows[0];
  
      return job;
    }
  
    /** Find all jobs.
     *
     * Returns [{ id, title, salary, equity, company_handle }, ...]
     * */
  
    static async findAll({ minSalary, hasEquity, searchTitle } = {}) {
      let query = `SELECT j.id,
                          j.title,
                          j.salary,
                          j.equity,
                          j.company_handle AS "companyHandle",
                          c.name AS "companyName"
                   FROM jobs j 
                     LEFT JOIN companies AS c ON c.handle = j.company_handle`;
      let whereExpressions = [];
      let queryValues = [];
  
      //If search terms exists, add them to the SQL query
  
      if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
      }
  
      if (hasEquity === true) {
        whereExpressions.push(`equity > 0`);
      }
  
      if (searchTitle !== undefined) {
        queryValues.push(`%${searchTitle}%`);
        console.log(queryValues);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
      }
  
      if (whereExpressions.length > 0) {
        query += " WHERE " + whereExpressions.join(" AND ");
      }
  
      // Finalize query and return results
  
      query += " ORDER BY title";
      const jobsRes = await db.query(query, queryValues);
      return jobsRes.rows;
    }
  
    /** Given a job id, return data about job.
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     **/
  
    static async get(id) {
      const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
          [id]);
  
      const job = jobRes.rows[0];
  
      if (!job) throw new NotFoundError(`No job: ${id}`);
  
      return job;
    }
  
    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: {title, salary, equity}
     *
     * Returns {id, title, salary, equity, ccompanyHandle}
     *
     * Throws NotFoundError if not found.
     */
  
    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(
          data,
          {
            title: "title",
            salary: "salary",
            equity: "equity"
          });
      const handleVarIdx = "$" + (values.length + 1);
  
      const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${handleVarIdx} 
                        RETURNING id,
                                  title, 
                                  salary, 
                                  equity, 
                                  company_handle AS "companyHandle"`;
      const result = await db.query(querySql, [...values, id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job: ${id}`);
  
      return job;
    }
  
    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/
  
    static async remove(id) {
      const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
          [id]);
      const jobs = result.rows[0];
  
      if (!jobs) throw new NotFoundError(`No job: ${id}`);
    }
  }
  
  
  module.exports = Job;
  