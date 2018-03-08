//this function will be called when the whole page is loaded
window.onload = function() {
	if (typeof web3 === 'undefined') {
		//if there is no web3 variable
		displayMessage("Error! Are you sure that you are using metamask?");
	} else {
		displayMessage("Hello player! Are you ready to catch some pokemons?");
		init();
	}

	$('#play').on("click",startGame);

};

let contractInstance;

let abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "person",
                "type": "address"
            }
        ],
        "name": "getPokemonsByPerson",
        "outputs": [
            {
                "name": "",
                "type": "uint8[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "pokemon",
                "type": "uint8"
            }
        ],
        "name": "getPokemonHolders",
        "outputs": [
            {
                "name": "",
                "type": "address[]"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "by",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "pokemon",
                "type": "uint8"
            }
        ],
        "name": "LogPokemonCaught",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "pokemon",
                "type": "uint8"
            }
        ],
        "name": "catchPokemon",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let address = "0x345ca3e014aaf5dca488057592ee47305d9b3e10";
let acc;

let pokemons = [
    "Bulbasaur",
    "Ivysaur",
    "Venusaur",
    "Charmander",
    "Charmeleon",
    "Charizard",
    "Squirtle",
    "Wartortle",
    "Blastoise",
    "Caterpie",
    "Metapod",
    "Butterfree",
    "Weedle",
    "Kakuna",
    "Beedrill",
    "Pidgey",
    "Pidgeotto",
    "Pidgeot",
    "Rattata",
    "Raticate",
    "Spearow",
    "Fearow",
    "Ekans",
    "Arbok",
    "Pikachu",
    "Raichu",
    "Sandshrew",
    "Sandslash",
    "NidoranF",
    "Nidorina",
    "Nidoqueen",
    "NidoranM"
];

function init(){
	let Contract = web3.eth.contract(abi);
	contractInstance = Contract.at(address);
	updateAccount();
}

function updateAccount(){
	//in metamask, the accounts array is of size 1 and only contains the currently selected account. The user can select a different account and so we need to update our account variable
	acc = web3.eth.accounts[0];
}

function displayMessage(message){
	let el = document.getElementById("message");
	el.innerHTML = message;
}

function getTextInput(){
	let el = document.getElementById("input");

	return el.value;
}

function startGame() {
    //Home page
    $('#play').hide();
    $('#welcome').hide();
    displayMessage("Catch the little stinkers!");

    //Show pokemons list
    loadPokemons(pokemons).appendTo('#pokemons');
    $('#container').attr("style","display:block");
}

function loadResults(results) {
    let table = $('<table class="table table-bordered">');
    let tr = $("<tr>");
    $("<th>").html("#").appendTo(tr);
    $("<th>").html("Holder Address / Pokemon").appendTo(tr);
    tr.appendTo(table);
    results.forEach(function (res, index) {
        tr = $("<tr>");
        $("<td>").html(index+1).appendTo(tr);
        if (!res.valueOf().match(/[a-z]/i)) {
            let pokemonIndex = parseInt(res.valueOf());
            $("<td>").html(pokemons[pokemonIndex]).appendTo(tr);
        } else {
            $("<td>").html(res).appendTo(tr);
        }
        tr.appendTo(table);
    });
    return table;
}

function loadPokemons(data) {
    let title = ["Name","Name","Name","Name","Name","Name"];
    let table = $('<table class="table table-bordered">');
    let tr = $("<tr>");
    title.forEach(function (title, index) {
        $("<th>").html("Index").appendTo(tr);
        $("<th>").html(title).appendTo(tr);
    });
    tr.appendTo(table);

    data.forEach(function(pokemon, index) {
        if (index === 0 || index%6 === 0) {
            tr = $("<tr>");
        }
        $("<td>").html(index).appendTo(tr);
        $("<td>").html(pokemon).appendTo(tr);

        if (index%6 === 0 || index === data.length-1) {
            tr.appendTo(table);
        }
    });
    return table;
}

function catchPokemon(){
	updateAccount();
    let input = getTextInput();
    contractInstance.catchPokemon(input,{"from": acc}, function (err, res) {
        if (!err){
            $('#input').val("");
            displayMessage("Success! You catched: " + pokemons[input]);
        } else {
            displayMessage("Try again after 15 seconds or try another pokemon. Probably you already catched that pokemon!");
        }
    })
}

function getInfo(){
	updateAccount();

    let input = getTextInput();
    if (!input.match(/[a-z]/i)){
        getPokemonHolders(input);
    } else {
        getHolderPokemons(input);
    }
}

function getPokemonHolders(input) {
    $('#results').empty();

    if (input == "" || input == null){
        displayMessage("Please fill in pokemon index!");
        return;
    }
    contractInstance.getPokemonHolders.call(input,{"from": acc}, function(err, res) {
        if(!err){
            $('#input').val("");
            let table = loadResults(res);
            displayMessage("The " + pokemons[input] + " is catched by:");
            table.appendTo('#results');
        } else {
            displayMessage("Wrong pokemon index!");
        }
    });
}

function getHolderPokemons(address){
    $('#results').empty();

    if (address == "" || address == null){
        displayMessage("Please fill in holder address!");
        return;
    }

    contractInstance.getPokemonsByPerson.call(address,{"from": acc}, function(err, res) {
        if(!err){
            $('#input').val("");
            let table = loadResults(res);
            displayMessage("The " + address + " has catched:");
            table.appendTo('#results');
        } else {
            displayMessage("You provided wrong pokemon index or person address.");
        }
    });
}

/*
pragma solidity 0.4.20;

contract Pokemons {
    //a few defined pokemons
enum Pokemon { Bulbasaur, Ivysaur, Venusaur, Charmander, Charmeleon, Charizard, Squirtle, Wartortle,
        Blastoise, Caterpie, Metapod, Butterfree, Weedle, Kakuna, Beedrill, Pidgey, Pidgeotto, Pidgeot, Rattata, Raticate,
        Spearow, Fearow, Ekans, Arbok, Pikachu, Raichu, Sandshrew, Sandslash, NidoranF, Nidorina, Nidoqueen, NidoranM }

    //pokemon catch event. Note the "Log" prefix, which is a standart for event names.
    event LogPokemonCaught(address indexed by, Pokemon indexed pokemon);

    //a pokemon can be caught at most once every 15 seconds if not caught already
    modifier canPersonCatch(address person, Pokemon pokemon){
        require(now > players[person].lastCatch + 15 seconds);
        require(!hasPokemon(person, pokemon));
        _;
    }

    struct Player {
        Pokemon[] pokemons;
        uint lastCatch; //timestamp
    }

    mapping(address => Player) players;

    //mapping can't take user-defined types as keys (ex. Pokemon)
    //the key is uint256, because the amount of Pokemons may increase in the future
    //and pass the uint8 range
    mapping(uint => address[]) pokemonHolders;

    //the hash of the pokemon holder and the pokemon is the key. This allows constant time lookup of whether a pokemon is caught by a person
    mapping(bytes32 => bool) hasPokemonMap;

    //returns if that person has caught a pokemon. It uses the hash of the address and the pokemon so that it can return the answer
    //without loops
    function hasPokemon(address person, Pokemon pokemon) internal view returns (bool) {
        return hasPokemonMap[keccak256(person, pokemon)];
    }

    function catchPokemon(Pokemon pokemon) public canPersonCatch(msg.sender, pokemon) {
        players[msg.sender].pokemons.push(pokemon);
        players[msg.sender].lastCatch = now;

        pokemonHolders[uint(pokemon)].push(msg.sender);

        hasPokemonMap[keccak256(msg.sender, pokemon)] = true;

        LogPokemonCaught(msg.sender, pokemon);
    }

    function getPokemonsByPerson(address person) public view returns (Pokemon[]) {
        return players[person].pokemons;
    }

    function getPokemonHolders(Pokemon pokemon) public view returns (address[]) {
        return pokemonHolders[uint(pokemon)];
    }
}
*/
