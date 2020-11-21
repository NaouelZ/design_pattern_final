let metrosContainer = document.querySelector('.metro_list')
let destinationContainer = document.querySelector('.destination_list')
let linesContainer = document.querySelector('.lines_list')
let schedulesContainer = document.querySelector('.schedules')
let traficContainer = document.querySelector('.metro_trafic')

// HELPERS
async function fetchData() {
    const response = await fetch('https://api-ratp.pierre-grimaud.fr/v4/lines/metros')
    return await response.json()
}

async function fetchDestination(line) {
    const response = await fetch('https://api-ratp.pierre-grimaud.fr/v4/destinations/metros/' + line)
    return await response.json()
}

async function fetchLinesData(code) {
    const response = await fetch('https://api-ratp.pierre-grimaud.fr/v4/stations/metros/' + code)
    return await response.json()
}

async function fetchSchedules(line, station, way) {
    const response = await fetch('https://api-ratp.pierre-grimaud.fr/v4/schedules/metros/' + line + '/' + station + '/' + way)
    return await response.json()
}

async function fetchTrafics(line) {
    const response = await fetch('https://api-ratp.pierre-grimaud.fr/v4/traffic/metros/' + line)
    return await response.json()
}

function displaySchedules(schedulesList){
    let timeToDisplay, message; 
    schedulesContainer.innerHTML += '<ul>' + schedulesList[0].destination
    schedulesList.map(line => {
        var dt = new Date();
        let minuteLeft = line.message
        message = minuteLeft.split(' ')
        if(isNaN(message[0])){
            timeToDisplay = minuteLeft
        } else {
            dt.setMinutes( dt.getMinutes() + parseInt(minuteLeft.split(' ')));
            timeToDisplay = "Passage à " + dt.getHours()+ 'h' + ( dt.getMinutes()<10?'0':'')+  dt.getMinutes()
        } 
        schedulesContainer.innerHTML += '<li>'+ timeToDisplay + "</li>"
    })
    schedulesContainer.innerHTML += '</ul>'
}

// CLASS moduleMetros
let moduleMetros = (function(){
    function getMetros(){
        fetchData().then(response => {
            metrosList = response
            metrosList.result.metros.map(metro => 
                    metrosContainer.innerHTML += '<option value="' + metro.code + '">' + metro.name + '</option>'
            )
        })
    }

    function getDestination(line){
        destinationContainer.innerHTML = ""
        fetchDestination(line).then(response => {
            let destinations = response.result.destinations
            destinations.map(destination => 
            destinationContainer.innerHTML += '<option value="' + destination.way + '">' + destination.name + '</option>'
        )})
    }

    function getStations(line){
        linesContainer.innerHTML = ""
        fetchLinesData(line).then(response => {
            linesList = response.result.stations
            linesList.map(line => 
                linesContainer.innerHTML += '<option value="' + line.slug + '">' + line.name + '</option>'
            )
        })
    }

    function getSchedules(){
        schedulesContainer.innerHTML = ''
        let line = metrosContainer.value
        let station = linesContainer.value
        let way = destinationContainer.value        
        fetchSchedules(line, station, way).then(
            response => {
                displaySchedules(response.result.schedules)
            }
        )
    }

    function getTrafics(line){
        fetchTrafics(line).then(
            response => {
                traficContainer.innerHTML = '<b>' + response.result.message + '</b>'
            }
        )
    }

    return {
        getMetros: getMetros,
        getDestination: getDestination,
        getStations: getStations,
        getSchedules: getSchedules,
        getTrafics: getTrafics,
    }
})()

moduleMetros.getMetros()

metrosContainer.addEventListener('change', function () {
    let line = metrosContainer.value
    moduleMetros.getDestination(line)
    moduleMetros.getTrafics(line)
})

destinationContainer.addEventListener('change', function () {
    let line = metrosContainer.value
    moduleMetros.getStations(line)
})

linesContainer.addEventListener('change', function() {
    moduleMetros.getSchedules()
})

setInterval(function(){
    if(metrosContainer.value && destinationContainer.value && linesContainer.value){
        moduleMetros.getSchedules()
    }
},30000)
