/* global describe context it before beforeEach after afterEach */
import supertest from "supertest";
import {expect} from "chai";
import fs from "fs";
import path from "path";
const url = "http://localhost:3003/";
const request = supertest(url);
import PreparersService from "../../src/services/PreparersService";
import PreparersDAO from "../../src/models/PreparersDAO";

describe("preparers", () => {
  describe("getPreparers", () => {
    context("when database is populated", () => {
      let preparersService: PreparersService;
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/preparers.json"), "utf8"));
      let preparersDAO = null;

      beforeAll((done) => {
        preparersDAO = new PreparersDAO();
        preparersService = new PreparersService(preparersDAO);
        const mockBuffer = preparersData.slice();

        const batches = [];
        while (mockBuffer.length > 0) {
          batches.push(mockBuffer.splice(0, 25));
        }

        batches.forEach((batch) => {
          preparersService.insertPreparerList(batch);
        });

        done();
      });

      it("should return all preparers in the database", (done) => {
        const expectedResponse = JSON.parse(JSON.stringify(preparersData));

        request.get("preparers")
          .end((err, res: any) => {
            if (err) { expect.fail(err); }
            expect(res.statusCode).to.equal(200);
            expect(res.headers["access-control-allow-origin"]).to.equal("*");
            expect(res.headers["access-control-allow-credentials"]).to.equal("true");
            expect(res.body.length).to.equal(expectedResponse.length);
            done();
          });
      });

      afterAll((done) => {
        const dataBuffer = preparersData;

        const batches = [];
        while (dataBuffer.length > 0) {
          batches.push(dataBuffer.splice(0, 25));
        }

        batches.forEach((batch) => {
          preparersService.deletePreparerList(
            batch.map((item: any) => {
              return item.preparerId;
            })
          );
        });

        done();
      });
    });
  });

  context("when database is empty", () => {
    it("should return error code 404", (done) => {
      request.get("preparers").expect(404, done);
    });
  });

  beforeEach((done) => {
    setTimeout(done, 500);
  });
  afterEach((done) => {
    setTimeout(done, 500);
  });
});