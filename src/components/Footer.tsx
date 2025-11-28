export default function Footer() {
  const gitLinks = [
    {
      url: "https://github.com/AndresMejia962/iot-frontend",
      title: "Iot Frontend",
    },
    {
      url: "https://github.com/AndresMejia962/iot-backend",
      title: "Iot Backend",
    },
  ];

  const simLinks = [
    {
      url: "https://wokwi.com/projects/448747698661687297",
      title: "Wokwi - Sensor de Temperatura",
    },
    {
      url: "https://wokwi.com/projects/448750230873692161",
      title: "Wokwi - Sensor de Gas",
    },
  ];

  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src="/iot.png" alt="" />
              <h3 className="font-bold">Sistema IoT Distribuido</h3>
            </div>

            <p className="mt-4 max-w-xs text-gray-500">
              Nuestro sistema de sensor IOT te permite guardar tu información de
              manera segura y disponible para su análisis.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2">
            <div>
              <h4 className="font-medium text-gray-900">Repositorios</h4>

              <ul className="mt-6 space-y-4 text-sm">
                {gitLinks.map(link => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      className="text-gray-700 transition hover:opacity-75 flex items-center gap-1"
                    >
                      <img src="/github.png" alt="" sizes="16x16" />{" "}
                      <span>{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">Simulaciones IoT</h4>

              <ul className="mt-6 space-y-4 text-sm">
                {simLinks.map(link => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      className="text-gray-700 transition hover:opacity-75 flex items-center gap-1"
                    >
                      <img src="/wokwi.png" alt="" sizes="16x16" />{" "}
                      <span>{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
