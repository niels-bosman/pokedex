let default_api_url = "https://pokeapi.co/api/v2/";
let per_page = 20;
let url, region;

$(window).on("load", () => {
    initialize();
});

function initialize() {
    loadRegions();
    checkPageToLoad();
    loadEvents();
}

function loadEvents() {
    $(document).on("click", ".btn-pagination", function () {
        paginate(this);
        scrollToTop();
    });

    $(document).on("click", ".region-content__data", function () {
        setRegion(this);
        removeActiveRegions();
        setActiveRegion(this);
        loadPokemonInfo(undefined, region);
    });

    $(document).on("click", "#clear-region", () => {
        unsetRegion();
        removeActiveRegions();
        loadPokemonInfo(undefined, region);
    });
}

function checkPageToLoad() {
    if (getUrlVars().id !== undefined) {
        loadPokemonInfoDetailPage(getUrlVars().id);
    } else {
        loadPokemonInfo();
    }
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m,key,value) {
            vars[key] = value;
        });
    return vars;
}

function loadPokemonInfo(updated_url, updated_region) {

    setAPIUrl(updated_url);

    if (updated_region === undefined) {
        $.ajax({
            dataType: "json",
            url: url,
        }).done((data) => {

            removeLoadedPokemons();

            for (let i = 0; i < per_page; i++) {
                let name = data.results[i].name;
                let id = data.results[i].url.substr(4).split("/")[6];

                addPokemonElement(id, name);

                $.ajax({
                    dataType: "json",
                    url: data.results[i].url,
                }).done((data) => {
                    let src = data.sprites.front_default;
                    let type = data.types[0].type.name;
                    let id = data.id;

                    setCardAttributes(id, src, type);
                });
            }

            loadButtons(data.previous, data.next);
        });
    } else {
        console.log("Region selected!");
    }
}

function loadPokemonInfoDetailPage(id) {
    setAPIUrl(default_api_url + "pokemon/" + id);

    $.ajax({
        dataType: "json",
        url: url,
    }).done((data) => {
        console.log(data);
        let id = data.id;
        let name = data.name;
        let sprite = data.sprites.front_default;
        let type = data.types[0].type.name;
        let baseAbility = data.abilities[0].ability.name;
        let secondAbility = data.abilities[1].ability.name;

        addPokemonDetailElement(id, name);
        setCardAttributes(id, sprite, type);
    });

}

function loadButtons(previous_url, next_url) {
    $('#button-previous').attr('data-url', previous_url);
    $('#button-next').attr('data-url', next_url);
}

function paginate(that) {
    let url = $(that).attr('data-url');
    if (url === undefined) { return; }
    loadPokemonInfo(url);
}

function loadRegions() {

    $.ajax({
        dataType: "json",
        url: default_api_url + "region/",
    }).done((data) => {
        let regions = $('.regions');

        for (let i = 0; i < data.count; i++) {
            let region = data.results[i].name;
            $(regions).append(
                "<div class='single-region'>" +
                    "<div class='region-content region-content__data' data-region='" + i + "'>" + region + "</div>" +
                "</div>"
            );
        }

        $(regions).append(
            "<div class='single-region'>" +
                "<div class='region-remove region-content' id='clear-region'>Clear filter</div>" +
            "</div>"
        );
    });
}

function setActiveRegion(that) {
    $(that).addClass('region-selected');
}

function removeActiveRegions() {
    $('.region-content__data').removeClass('region-selected');
}

function setRegion(that) {
    region = $(that).attr("data-region");
}

function removeLoadedPokemons() {
    $('.card-wrap').remove();
}

function unsetRegion() {
    region = undefined;
}

function setAPIUrl(updated_url) {
    if (updated_url !== undefined) {
        url = updated_url;
    } else {
        url = default_api_url + "pokemon/";
    }
}

function addPokemonElement(id, name) {
    $('.content').append(
        "<div class='col card-wrap'>" +
            "<div class='card card-single' data-id='" + id + "' data-name='" + name + "'>" +
                "<div class='card-header'>" + name + "</div>" +
                "<div class='card-body'>" +
                    "<a class='pokemon-link' href='?id=" + id + "'>" +
                        "<img draggable='false' class='pokemon-image'>" +
                    "</a>" +
                "</div>" +
                "<div class='card-footer type'></div>" +
            "</div>" +
        "</div>"
    );
}

function addPokemonDetailElement(id, name) {
    $('.content').append(
        "<div class='col card-wrap'>" +
            "<div class='card card-single' data-id='" + id + "' data-name='" + name + "'>" +
                "<div class='card-header'>" + name + "</div>" +
                "<div class='card-body'>" +
                    "<img draggable='false' class='pokemon-image'>" +
                "</div>" +
                "<div class='card-footer type'></div>" +
            "</div>" +
        "</div>"
    );
}

function setCardAttributes(id, src, type) {
    $(".card-single[data-id='" + id + "'] .pokemon-image").attr("src", src);
    $(".card-single[data-id='" + id + "'] .card-header").addClass("background-color-" + type);
    $(".card-single[data-id='" + id + "'] .type").text("#" + id);
}

function scrollToTop() {
    $('html, body').animate({
        scrollTop: "0px"
    }, 600);
}