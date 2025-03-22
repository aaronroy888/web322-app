const Handlebars = require("handlebars");

// Register a custom "navLink" helper
Handlebars.registerHelper("navLink", function (url, options) {
    const currentPath = this.activeRoute || "/";
    const activeClass = url === currentPath ? "nav-link active" : "nav-link";
    return `<li class="nav-item"><a class="${activeClass}" href="${url}">${options.fn(this)}</a></li>`;
});

module.exports = Handlebars;