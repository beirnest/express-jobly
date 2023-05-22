"use strict";

const request = require("supertest");
const app = require("../app");

const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");
const { test } = require("node:test");

describe("test sqlForPartialUpdate", function () {
    test("Returns 'no data' if no data is provided", function() {
        try {
            const data = {};
            sqlForPartialUpdate(data, {
                firstName: "Tim",
                lastName: "Beirne",
                type: "admin"
              });
          } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
          }
    });
    
    it("Provides correct cols for setCols", function () {
        const data = {firstName: "Tim", lastName: "Beirne", type: "admin"};
        const returnedData = sqlForPartialUpdate(data, {
            firstName: "Tim",
            lastName: "Beirne",
            type: "user"
          });
          expect(returnedData.setCols).toEqual("\"Tim\"=$1, \"Beirne\"=$2, \"user\"=$3");
    });

    it("Provides correct data values", function () {
        const data = {firstName: "Tim", lastName: "Beirne", type: "admin"};
        const returnedData = sqlForPartialUpdate(data, {
            firstName: "Tim",
            lastName: "Beirne",
            type: "user"
          });
          expect(returnedData.values).toEqual(["Tim", "Beirne", "admin"]);
    });
  })