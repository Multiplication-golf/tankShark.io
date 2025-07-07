async function ping() {
  const urls = [
    "http://localhost:4500/ping",
    "https://websocketpointer.duckdns.org/ping",
    "http://127.0.0.1:4000/ping",
    "http://192.168.9.100:4500/ping",
  ];
  var passed = false;
  urls.forEach(async (url) => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      passed = true;
    } catch (error) {
      console.error(error.message);
    }
  });
  if (!passed) {
    return false;
  }
  return true;
}

setInterval(async () => {
  console.log("pinging the sever...");
  if (await ping()) {
    window.location.href =
      window.location.href !==
      "https://tankshark.fun/server-down.html"
        ? "/public/index.html"
        : "https://tankshark.fun/";
  } else {
    console.log("Server is not reachable.");
  }
}, 1000);
