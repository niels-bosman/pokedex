let default_api_url = 'https://pokeapi.co/api/v2/';
let per_page = 20;
let url, region;
let is_detail;

$(() => {
  initialize();
});

function initialize() {
  checkPageToLoad();
  loadEvents();
}

function loadEvents() {
  $(document).on('click', '.btn-pagination', function() {
    paginate(this);
    scrollToTop();
  });

  $(document).on('click', '.region-content__data', function() {
    setRegion(this);
    removeActiveRegions();
    setActiveRegion(this);
    loadPokemonInfo(undefined, region);
    $('.pagination').fadeOut();
  });

  $(document).on('click', '#clear-region', () => {
    unsetRegion();
    removeActiveRegions();
    loadPokemonInfo(undefined, region);
    $('.pagination').fadeIn();
  });

  $(document).on('click', '.goto-home', () => {
    goToHome();
  });
}

function checkPageToLoad() {
  if (getUrlVars().id) {
    is_detail = true;
    loadPokemonInfoDetailPage(getUrlVars().id);
    showBackButton();

    let base_url = location.href.split('?')[0];
    let next_url = base_url + '?id=' + (parseInt(getUrlVars().id) + 1);
    let previous_url = base_url + '?id=' + (parseInt(getUrlVars().id) - 1);

    loadButtons(previous_url, next_url);
  } else {
    loadRegions();
    loadPokemonInfo();
  }
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function loadPokemonInfo(updated_url, updated_region) {
  setAPIUrl(updated_url);

  if (updated_region === undefined) {
    $.ajax({
      dataType: 'json',
      url: url
    }).done(data => {
      removeLoadedPokemons();

      for (let i = 0; i < per_page; i++) {
        let name = data.results[i].name;
        let id = data.results[i].url.substr(4).split('/')[6];
        let src =
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' +
          id +
          '.png';

        addPokemonElement(id, name, src);

        $.ajax({
          dataType: 'json',
          url: data.results[i].url
        }).done(data => {
          let type = data.types[0].type.name;
          let id = data.id;

          setCardAttributes(id, type);
        });
      }

      loadButtons(data.previous, data.next);
    });
  } else {
    let actual_region;

    switch (parseInt(updated_region)) {
      case 0:
        actual_region = 2;
        break;
      case 1:
        actual_region = 3;
        break;
      case 2:
        actual_region = 4;
        break;
      case 3:
        actual_region = 5;
        break;
      case 4:
        actual_region = 8;
        break;
      case 5:
        actual_region = 12;
        break;
      default:
        actual_region = 1;
    }

    $.ajax({
      dataType: 'json',
      url: default_api_url + 'pokedex/' + actual_region
    }).done(data => {
      $('.content').html('');

      for (let i = 0; i < data.pokemon_entries.length; i++) {
        let name = data.pokemon_entries[i].pokemon_species.name;
        let id = data.pokemon_entries[i].pokemon_species.url
          .substr(4)
          .split('/')[6];
        let src =
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' +
          id +
          '.png';

        addPokemonElement(id, name, src);

        $.ajax({
          dataType: 'json',
          url: default_api_url + 'pokemon/' + id
        }).done(data => {
          let src = data.sprites.front_default;
          let type = data.types[0].type.name;
          let id = data.id;

          setCardAttributes(id, type);
        });
      }
    });
  }
}

function loadPokemonInfoDetailPage(id) {
  setAPIUrl(default_api_url + 'pokemon/' + id);

  $.ajax({
    dataType: 'json',
    url: url
  }).done(data => {
    let baseAbility = '';
    let secondAbility = '';
    let id = data.id;
    let name = data.name;
    let sprite = data.sprites.front_default;
    let type = data.types[0].type.name;

    if (data.abilities.length === 1) {
      baseAbility = data.abilities[0].ability.name;
    } else if (data.abilities.length >= 2) {
      baseAbility = data.abilities[0].ability.name;
      secondAbility = data.abilities[1].ability.name;
    }

    var stat_value = [];
    var stat_name = [];

    for (let i = 0; i < 6; i++) {
      stat_value[i] = data.stats[i].base_stat;
      stat_name[i] = data.stats[i].stat.name;
    }

    addPokemonDetailElement(
      id,
      name,
      sprite,
      type,
      baseAbility,
      secondAbility,
      stat_value[0],
      stat_name[0],
      stat_value[1],
      stat_name[1],
      stat_value[2],
      stat_name[2],
      stat_value[3],
      stat_name[3],
      stat_value[4],
      stat_name[4],
      stat_value[5],
      stat_name[5]
    );
    setCardAttributes(id, type);
  });
}

function loadButtons(previous_url, next_url) {
  $('#button-previous').attr('data-url', previous_url);
  $('#button-next').attr('data-url', next_url);
}

function paginate(that) {
  let url = $(that).attr('data-url');
  if (url === undefined) {
    return;
  }

  if (is_detail) {
    window.location = url;
  } else {
    loadPokemonInfo(url);
  }
}

function loadRegions() {
  $.ajax({
    dataType: 'json',
    url: default_api_url + 'region/'
  }).done(data => {
    let regions = $('.regions');

    for (let i = 0; i < data.count - 1; i++) {
      let region = data.results[i].name;
      $(regions).append(
        "<div class='single-region'>" +
          "<div class='region-content region-content__data' data-region='" +
          i +
          "'>" +
          region +
          '</div>' +
          '</div>'
      );
    }

    $(regions).append(
      "<div class='single-region'>" +
        "<div class='region-remove region-content' id='clear-region'>Clear filter</div>" +
        '</div>'
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
  region = $(that).attr('data-region');
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
    url = default_api_url + 'pokemon/';
  }
}

function addPokemonElement(id, name, src) {
  $('.content').append(
    "<div class='col card-wrap'>" +
      "<a class='pokemon-link' href='?id=" +
      id +
      "'>" +
      "<div class='card card-single' data-id='" +
      id +
      "' data-name='" +
      name +
      "'>" +
      "<div class='card-header'>" +
      name +
      '</div>' +
      "<div class='card-body'>" +
      "<img draggable='false' class='pokemon-image' src='" +
      src +
      "'>" +
      '</div>' +
      "<div class='card-footer type'></div>" +
      '</div>' +
      '</a>' +
      '</div>'
  );
}

function addPokemonDetailElement(
  id,
  name,
  sprite,
  type,
  ability1,
  ability2,
  stat1val,
  stat1name,
  stat2val,
  stat2name,
  stat3val,
  stat3name,
  stat4val,
  stat4name,
  stat5val,
  stat5name,
  stat6val,
  stat6name
) {
  $('.content').append(
    "<div class='col card-wrap'>" +
      "<div class='card card-single' data-id='" +
      id +
      "' data-name='" +
      name +
      "'>" +
      "<div class='card-header'>" +
      name +
      '</div>' +
      "<div class='card-body'>" +
      "<div class='row'>" +
      "<div class='col-md-2'>" +
      '<div>' +
      '<strong>Pokemon</strong>' +
      '</div>' +
      "<img draggable='false' class='pokemon-image' src='" +
      sprite +
      "'>" +
      '</div>' +
      "<div class='col-md-2'>" +
      '<div>' +
      '<strong>Type</strong>' +
      '</div>' +
      "<div class='pokemon-type'>" +
      "<p class='background-color-" +
      type +
      "'>" +
      type +
      '</p>' +
      '</div>' +
      '</div>' +
      "<div class='col-md-4'>" +
      '<div>' +
      '<strong>Moves</strong>' +
      '</div>' +
      "<div class='pokemon-abilities'>" +
      '<p>' +
      ability1 +
      '</p>' +
      '<p>' +
      ability2 +
      '</p>' +
      '</div>' +
      '</div>' +
      "<div class='col-md-4'>" +
      '<div>' +
      '<strong>Base stats</strong>' +
      '</div>' +
      "<div class='pokemon-stats'>" +
      "<div class='row'>" +
      "<div class='col hp'>" +
      '<p>' +
      stat6val +
      '</p>' +
      '<p>' +
      stat6name +
      '</p>' +
      '</div>' +
      "<div class='col att'>" +
      '<p>' +
      stat5val +
      '</p>' +
      '<p>' +
      stat5name +
      '</p>' +
      '</div>' +
      "<div class='col def'>" +
      '<p>' +
      stat4val +
      '</p>' +
      '<p>' +
      stat4name +
      '</p>' +
      '</div>' +
      "<div class='col spa'>" +
      '<p>' +
      stat3val +
      '</p>' +
      '<p>' +
      stat3name +
      '</p>' +
      '</div>' +
      "<div class='col spcd'>" +
      '<p>' +
      stat2val +
      '</p>' +
      '<p>' +
      stat2name +
      '</p>' +
      '</div>' +
      "<div class='col spd'>" +
      '<p>' +
      stat1val +
      '</p>' +
      '<p>' +
      stat1name +
      '</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      "<div class='card-footer type'></div>" +
      '</div>' +
      '</div>'
  );
}

function setCardAttributes(id, type) {
  $(".card-single[data-id='" + id + "'] .card-header").addClass(
    'background-color-' + type
  );
  $(".card-single[data-id='" + id + "'] .type").text('#' + id);
}

function scrollToTop() {
  $('html, body').animate(
    {
      scrollTop: '0px'
    },
    600
  );
}

function showBackButton() {
  $('.go-back').addClass('active');
}

function goToHome() {
  window.location = location.href.split('?')[0];
}
