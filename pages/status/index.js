import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  // const response = useSWR("/api/v1/status", fetchApi, {
  //   refreshInterval: 100,
  //   dedupingInterval: 1000,
  // });

  return (
    <>
      <h1>Status</h1>
      {/* <pre>{JSON.stringify(response.data, null, 2)}</pre> */}
      <UpdateAt />
      <DataBaseInfo />
    </>
  );
}

function UpdateAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 100,
    dedupingInterval: 1000,
  });

  let updatedAtText = "Loading...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }

  return <div>Last Update: {updatedAtText}</div>;
}

function DataBaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 100,
    dedupingInterval: 1000,
  });

  let updatedAtText = "Loading...";
  let max_connections = "Loading...";
  let opened_connections = "Loading...";

  if (!isLoading && data) {
    updatedAtText = data.dependencies.database.version;
    max_connections = data.dependencies.database.max_connections;
    opened_connections = data.dependencies.database.opened_connections;
  }

  return (
    <>
      <div>Data Base Version: {updatedAtText}</div>
      <div>Max Connections: {max_connections}</div>
      <div>Opened Connections: {opened_connections}</div>
    </>
  );
}
