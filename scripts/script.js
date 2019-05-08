let default_api_url = "https://pokeapi.co/api/v2/";
let per_page = 20;
let url;

$(window).on("load", function () {
    loadRegions();
    loadPokemonInfo();
});

$('.btn-pagination').on("click", function() {
    paginate(this);
});

$('.region-content').on("click", function () {
    let region = $(this).attr("data-region");
    loadPokemonInfo(null, region);
    console.log('test');
});

function loadPokemonInfo(updated_url, updated_region) {

    if (updated_url !== undefined) {
        url = updated_url;
    } else if(updated_region !== undefined) {
        url = default_api_url + "region/" + updated_region;
    } else {
        url = default_api_url + "pokemon/";
    }
    $.ajax({
        dataType: "json",
        url: url,
    }).done(function (data) {

        $('.card-wrap').remove();

        for (var i = 0; i < per_page; i++) {

            let name = data.results[i].name;
            let id = data.results[i].url.substr(4).split("/")[6];

            $('.content').append(
                "<div class='col card-wrap'>" +
                    "<div class='card card-single' data-id='" + id + "'>" +
                        "<div class='card-header'>" + name + "</div>" +
                            "<div class='card-body'>" +
                                "<a class='pokemon-link'>" +
                                    "<img draggable='false' class='pokemon-image'>" +
                                "</a>" +
                            "</div>" +
                        "<div class='card-footer type'></div>" +
                    "</div>" +
                "</div>"
            );

            // Set the pokemon attributes and data with information inside url
            $.ajax({
                dataType: "json",
                url: data.results[i].url,
            }).done(function (data) {
                let src = data.sprites.front_default;
                let type = data.types[0].type.name;
                let id = data.id;

                $(".card-single[data-id='" + id + "']").attr('data-real-id', id);
                $(".card-single[data-id='" + id + "'] .pokemon-image").attr("src", src);
                $(".card-single[data-id='" + id + "'] .card-header").addClass("background-color-" + type);
                $(".card-single[data-id='" + id + "'] .type").text("#" + id);
            });
        }

        loadButtons(data.previous, data.next);
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
    }).done(function (data) {
        for (let i = 0; i < data.count; i++) {
            let region = data.results[i].name;
            $('.regions').append(
                "<div class='single-region'>" +
                    "<div class='region-content' data-region='" + i + "'>" + region + "</div>" +
                "</div>"
            );
        }

        $('.regions').append(
            "<div class='single-region'>" +
                "<div class='region-remove region-content' id='clear-region'>Clear filter</div>" +
            "</div>"
        );
    });
}