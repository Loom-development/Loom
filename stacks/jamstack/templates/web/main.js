const grid = document.querySelector("#feature-grid");

async function loadContent() {
  try {
    const response = await fetch("/api/content");
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const data = await response.json();
    grid.innerHTML = data.features
      .map(
        (feature) => `
          <article class="card">
            <p class="card-kicker">${feature.slug}</p>
            <h3>${feature.title}</h3>
            <p>${feature.summary}</p>
          </article>
        `
      )
      .join("");
  } catch (error) {
    grid.innerHTML = `<article class="card"><h3>API unavailable</h3><p>${error}</p></article>`;
  }
}

loadContent();