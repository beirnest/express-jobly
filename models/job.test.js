"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 40000,
    equity: "0.01",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job.title).toEqual("new");
    expect(job.salary).toEqual(40000);
    expect(job.equity).toEqual("0.01");
    expect(job.companyHandle).toEqual("c1");


    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows[0].title).toEqual("new");
    expect(result.rows[0].salary).toEqual(40000);
    expect(result.rows[0].equity).toEqual("0.01");
    expect(result.rows[0].company_handle).toEqual("c1");;
  });
});

describe("findAll", function () {
    test("works: all", async function () {
      let jobs = await Job.findAll();
      expect(jobs[0].title).toEqual("Job1");
      expect(jobs[1].title).toEqual("Job2");
      expect(jobs[2].title).toEqual("Job3");
      expect(jobs[3].title).toEqual("Job4");
    });
});

describe("get", function () {
    test("works", async function () {
      let job = await Job.get(testJobIds[0]);
      expect(job).toEqual({ id: testJobIds[0], title: "Job1", salary: 100, equity: "0.1", companyHandle: "c1" });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.get(6568);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 500,
    equity: "0.5",
  };

  test("works", async function () {
    let job = await Job.update(testJobIds[0], updateData);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "New",
      salary: 500,
      equity: "0.5",
      companyHandle: "c1",
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'New'`);
    expect(result.rows).toEqual([{
      title: "New",
      salary: 500,
      equity: "0.5",
      company_handle: "c1",
      id: testJobIds[0],
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(65656565, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

});

describe("remove", function () {
    test("works", async function () {
      await Job.remove(testJobIds[0]);
      const res = await db.query(
          "SELECT id FROM jobs WHERE title='Job1'");
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(6568);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
});

