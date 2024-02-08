const pageTitle = "Squealer Moderator Dashboard";

const routes = {
  404: {
    template: "/templates/404.html",
    title: "404 | " + pageTitle,
    description: "Page not found",
  },
  "#/": {
    template: "/templates/index.html",
    title: "Home | " + pageTitle,
    description: "Home page",
  },
  users: {
    template: "/templates/users.html",
    title: "Users | " + pageTitle,
    description: "Users page",
  },
  squeal: {
    template: "/templates/squeal.html",
    title: "Squeal | " + pageTitle,
    description: "Squeal page",
  },
  channels: {
    template: "/templates/channels.html",
    title: "Channels | " + pageTitle,
    description: "Channels page",
  },
};

const urlLocationHandler = async () => {
  var location = window.location.hash.replace("#", "");
  if (location.length == 0) {
    location = "#/";
  }

  const route = routes[location] || routes["404"];
  const html = await fetch(route.template).then((res) => res.text());
  document.getElementById("content").innerHTML = html;
  document.title = route.title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", route.description);
};

window.addEventListener("hashchange", urlLocationHandler);

urlLocationHandler();
