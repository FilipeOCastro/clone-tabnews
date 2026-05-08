import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 1000,
    dedupingInterval: 1000,
  });

  const database = data?.dependencies?.database;

  const openedConnections = database?.opened_connections || 0;
  const maxConnections = database?.max_connections || 100;

  const usagePercentage = Math.min(
    Math.round((openedConnections / maxConnections) * 100),
    100,
  );

  const healthStatus =
    usagePercentage < 60
      ? "Healthy"
      : usagePercentage < 85
        ? "Warning"
        : "Critical";

  const healthClass =
    usagePercentage < 60
      ? "healthy"
      : usagePercentage < 85
        ? "warning"
        : "critical";

  return (
    <>
      <div className="page">
        <div className="container">
          <div className="hero">
            <h1 className="title">System Status</h1>

            <div className={`status-badge ${healthClass}`}>
              <span className="dot"></span>
              {healthStatus}
            </div>
          </div>

          <section className="section">
            <h2 className="section-title">System</h2>

            <div className="grid">
              <Card
                title="Last Update"
                value={
                  isLoading
                    ? "Loading..."
                    : new Date(data.updated_at).toLocaleString("pt-BR")
                }
                loading={isLoading}
              />

              <Card title="API Status" value="Online" loading={false} success />
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Database</h2>

            <div className="grid">
              <Card
                title="Database Version"
                value={isLoading ? "Loading..." : database.version}
                loading={isLoading}
              />

              <Card
                title="Opened Connections"
                value={`${openedConnections}`}
                loading={isLoading}
              />

              <Card
                title="Max Connections"
                value={`${maxConnections}`}
                loading={isLoading}
              />
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <span>Connection Usage</span>
                <span>{usagePercentage}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${healthClass}`}
                  style={{
                    width: `${usagePercentage}%`,
                  }}
                />
              </div>

              <div className="usage-footer">
                {openedConnections} / {maxConnections} connections
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #020617;
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top, #1e293b, #020617 70%);
          color: white;
          padding: 50px 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 50px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .title {
          font-size: 52px;
          margin: 0;
          font-weight: 800;
          letter-spacing: -2px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 18px;
          border-radius: 999px;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 1.5s infinite;
        }

        .healthy {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .critical {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .section {
          margin-bottom: 45px;
        }

        .section-title {
          font-size: 20px;
          margin-bottom: 20px;
          color: #93c5fd;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .card,
        .usage-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 24px;
          backdrop-filter: blur(12px);
          transition: 0.3s ease;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .card:hover,
        .usage-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59, 130, 246, 0.4);
        }

        .card-title {
          color: #94a3b8;
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 1px;
        }

        .card-value {
          font-size: 30px;
          font-weight: bold;
          color: white;
        }

        .success-text {
          color: #22c55e;
        }

        .usage-card {
          margin-top: 24px;
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          font-weight: bold;
        }

        .progress-bar {
          width: 100%;
          height: 14px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        .usage-footer {
          margin-top: 12px;
          color: #94a3b8;
          font-size: 14px;
        }

        .loading {
          opacity: 0.6;
          animation: pulseOpacity 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }

          50% {
            transform: scale(1.2);
            opacity: 1;
          }

          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }

        @keyframes pulseOpacity {
          0% {
            opacity: 0.5;
          }

          50% {
            opacity: 1;
          }

          100% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .title {
            font-size: 38px;
          }

          .card-value {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}

function Card({ title, value, loading, success }) {
  return (
    <div className={`card ${loading ? "loading" : ""}`}>
      <div className="card-title">{title}</div>

      <div className={`card-value ${success ? "success-text" : ""}`}>
        {value}
      </div>
    </div>
  );
}
