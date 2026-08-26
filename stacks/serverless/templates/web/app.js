async function loadJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  return JSON.stringify(payload, null, 2);
}

async function populate() {
  document.querySelector("#health").textContent = await loadJson("/api/health");
  document.querySelector("#feed").textContent = await loadJson("/api/feed");
}

async function sendWebhook() {
  const payload = {
    type: "content.published",
    slug: "spring-release",
    source: "static-spa"
  };

  document.querySelector("#webhook").textContent = await loadJson("/api/webhooks/content", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

document.querySelector("#sendWebhook").addEventListener("click", () => {
  void sendWebhook();
});

void populate();