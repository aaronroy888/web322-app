const Handlebars = require("handlebars");

Handlebars.registerHelper("navLink", function (url, options) {
    const currentPath = this.activeRoute || "/";
    const activeClass = url === currentPath ? "nav-link active" : "nav-link";
    return `<li class="nav-item"><a class="${activeClass}" href="${url}">${options.fn(this)}</a></li>`;
});

Handlebars.registerHelper("formatDate", function (dateObj) {
    if (!(dateObj instanceof Date)) {
        return '';
    }
    let year = dateObj.getFullYear();
    let month = (dateObj.getMonth() + 1).toString();
    let day = dateObj.getDate().toString();
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`; 
});

module.exports = Handlebars;
