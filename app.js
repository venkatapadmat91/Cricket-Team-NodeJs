const express = require("express");
const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Returns a list of all players in the team

app.get("/players/", async (request, response) => {
  const getCricketQuery = `
    SELECT * FROM cricket_team;`;

  const cricketArray = await database.all(getCricketQuery);
  response.send(
    cricketArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Creates a new player in the team (database)

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number,role)
    VALUES 
       ( '${playerName}' , ${jerseyNumber}, '${role}');`;

  await database.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM 
    cricket_team WHERE player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
     UPDATE 
       cricket_team
     SET
          player_name = '${playerName}',
          jersey_number = '${jerseyNumber}',
          role = '${role}'
     WHERE 
        player_id = ${playerId};`;

  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
     DELETE FROM 
        cricket_team
      WHERE 
         player_id = ${playerId};`;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
