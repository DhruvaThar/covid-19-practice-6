const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const pathDB = path.join(__dirname, "covid19India.db");
let db = null;
initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: pathDB,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET API 1

app.get("/states/", async (request, response) => {
  const allStatesQuery = `
    SELECT * FROM state;`;
  const allStates = await db.all(allStatesQuery);
  response.send(allStates);
});

// GET API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateQuery = `
    SELECT * FROM state WHERE state_id = ${stateId};`;
  const getState = await db.get(stateQuery);
  response.send(getState);
});

// POST API 3

app.post("/districts/", (request, response) => {
  const newDistrict = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = newDistrict;
  const Query = `
    INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES(
        "${districtName}",
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;
  response.send("District Successfully Added");
});

// GET API 4

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getState = `
    SELECT * FROM district WHERE district_id = ${districtId};`;
  const output = await db.all(getState);
  response.send(output);
});

// DELETE API 5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const selectDistrict = `
    DELETE FROM district WHERE district_id = ${districtId};`;
  await db.run(selectDistrict);
  response.send("District Removed");
});

// PUT API 6

app.put("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const updateDistrict = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = updateDistrict;
  const putQuery = `
    UPDATE district 
    SET 
    district_name = "${districtName}",
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId};`;
  await db.run(putQuery);
  response.send("District Details Updated");
});

// GET API 7

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const stateQuery = `
    SELECT 
    cases AS totalCases,
    cured AS totalCured,
    active AS totalActive,
    deaths AS totalDeaths
    FROM district
    WHERE state_id = ${stateId};`;
  const output = await db.get(stateQuery);
  response.send(output);
});

//GET API 8

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const Query = `
    SELECT state.state_name AS stateName
    FROM district INNER JOIN state ON district.state_id = state.state_id
    WHERE district.district_id = ${districtId};`;
  const result = await db.get(Query);
  response.send(result);
});

module.exports = app;
