export const registerSystemSettings = function() {

  /**
   * Configure the CSR version being used
   */
  game.settings.register("cyphersystem", "systemMigrationVersion", {
    name: "CSR Version",
    hint: "Select the Cypher System version you're using. Version 1 is the original 2015 edition with the four panel diamond cover; version 2 is the 2019 edition with the single red motif image cover",
    scope: "world",
    config: true,
    type: Number,
    default: 2,
    choices: {
      1: "Version 1",
      2: "Version 2",
    },
  });
}
