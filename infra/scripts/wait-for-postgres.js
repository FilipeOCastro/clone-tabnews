const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stout) {
    if (stout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres Aceitando Conexões!\n");
  }
}

process.stdout.write("\n🔴 Aguardando Postgres Aceitar Conexões");

checkPostgres();
