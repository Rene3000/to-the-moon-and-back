// decorative, just for smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// generate structured HTML from remainingTime
const generateCountDown = (remainingTime, units) => {

    let countDown = document.createElement('span');

    for (let i = 0; i < remainingTime.length; i++) {

        let valueSpan = document.createElement('span');
        let unitSpan = document.createElement('span');

        valueSpan.textContent = remainingTime[i];
        unitSpan.textContent = units[i];
        unitSpan.className = 'auction__unit';
        if (remainingTime[i] > 0) {            
            valueSpan.appendChild(unitSpan);
            countDown.appendChild(valueSpan);
        }
    }

    return countDown;
};

// return remainign time in DD:HH:MM format
const returnRemainingTime = endDate => {

    let today = moment();
    let future = moment(endDate);
    let difference = moment.duration(future.diff(today));
    let remainingTime = [];
    let units = ["päeva", "tundi", "minutit"];
    let days, hours, minutes;

    days = difference.days();
    difference.subtract(moment.duration(days, 'days'));
    remainingTime.push(days);

    hours = difference.hours();
    difference.subtract(moment.duration(hours, 'hours'));
    remainingTime.push(hours);

    minutes = difference.minutes();
    difference.subtract(moment.duration(minutes, 'minutes'));
    remainingTime.push(minutes);

    return generateCountDown(remainingTime, units);
};

// check if last auction field is text value or image and fill placeholders with data
const auctionElement = (childId, fieldValue) => {

    const img = document.createElement('img');
    let auctionField;

    if (typeof fieldValue === 'string' && fieldValue.includes("https://")) {
        img.src = fieldValue;
        auctionField = childId.innerHTML = "";
        auctionField = childId.appendChild(img);
    } else if (typeof fieldValue === 'string' && childId.getAttribute("id") === "dateEnd") {
        auctionField = childId.innerHTML = "";
        auctionField = childId.prepend(returnRemainingTime(fieldValue));
    } else {
        auctionField = fieldValue !== null ? childId.innerHTML = fieldValue : childId.innerHTML = "Lõppenud";
    }

    return auctionField;
};

// get dynamic elements from DOM by Ids derived from data model
const getDynamicElements = data => {

    let dataKeys = Object.keys(data);

    if (data && Object.keys(data).length > 0) {
        for (let i = 0; i < dataKeys.length; i++) {
            let childElement = document.getElementById(dataKeys[i]);
            childElement ? auctionElement(childElement, data[dataKeys[i]]) : false;
        }
    }
};

// search for auctions by url or ID
const searchFromAuctions = e => {
    e.preventDefault();
    const searchValue = document.getElementById("searchValue").value;
    let id;

    // pretty ad hoc solution but works for now
    if (searchValue && searchValue.includes("osta.ee") && searchValue.includes(".html")) {
        id = searchValue.slice(-14, -5);
    } else if (searchValue && searchValue.length === 9) {
        id = searchValue;
    } else {
        id = null;
        alert("VIGA! See ei ole korrektne oksjoni aadress või ID.");
    }

    fetchData(id);
}

// fetch data from API and log error if something is wrong
const fetchData = async id => {

    let res = await fetch('https://api.osta.ee/api/items/active/' + id);
    
    if (id) {
        if (res.status === 200) {
            let data = await res.text();
            getDynamicElements(JSON.parse(data));
        } else {
            alert("Viga! Sellist oksjonit ei leitud.");
            console.error(res.status, res.statusText);
        }
    }
};

// listen to search submit
document.getElementById('searchForm').addEventListener("submit", searchFromAuctions);

// initial load with auction ID 
fetchData(147125287);