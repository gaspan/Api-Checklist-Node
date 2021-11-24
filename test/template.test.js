const request = require("supertest")("http://127.0.0.1:3000/api/v1/");
const expect = require("chai").expect;

describe("POST /checklists/templates", function () {
  it("returns data", async function () {
    const response = await request
        .post("/checklists/templates")
        .set('Accept', 'application/json')
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxOWNmYjdlNjNmMTQzMDJjYTc1NWMwYSIsImlhdCI6MTYzNzczNDczNywiZXhwIjoxNjQwMzI2NzM3fQ.KxyE-UfzCE0ZXXJkgcstCSEUQAxP_YuPQoQMZIiCHvM')
        .send({
            "data": {
              "attributes": {
                "name": "fii template",
                "checklist": {
                  "description": "my checklist",
                  "due_interval": 3,
                  "due_unit": "hour"
                },
                "items": [
                  {
                    "description": "my foo item",
                    "urgency": 2,
                    "due_interval": 40,
                    "due_unit": "minute"
                  },
                  {
                    "description": "my bar item",
                    "urgency": 3,
                    "due_interval": 30,
                    "due_unit": "minute"
                  }
                ]
              }
            }
          });

    expect(response.status).to.eql(201);
    const attributes = response.body.data.attributes;

    expect(attributes).to.have.all.keys("name", "checklist", "items");
    expect(attributes.name).to.eql("fii template");
    expect(attributes.checklist).to.be.an('object');
    expect(attributes.items).to.be.an('array');
    

  });
});