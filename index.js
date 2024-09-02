const floorHeight = 200;

let liftsValue, floorValue;

const liftsAvialable = new Map();
const liftAt = new Map();
const floorLiftMap = new Map();
const pendingCalls = [];

document.querySelector("#btn").addEventListener("click", (event) => {
  event.preventDefault();
  const floorInput = document.querySelector("#floor");
  const liftInput = document.querySelector("#lift");

  floorValue = parseInt(floorInput.value);
  liftsValue = parseInt(liftInput.value);

  if (
    floorValue <= 0 ||
    floorValue > 50 ||
    liftsValue <= 0 ||
    liftsValue > 10
  ) {
    alert("Invalid input! Try again.");
    return;
  }

  const inputBox = document.querySelector("#input-box");
  inputBox.style.display = "none";

  displyFloors(floorValue);
  displyLifts(liftsValue);
});

function displyFloors(totalFloors) {
  const floorContainer = document.querySelector("#floor-container");
  for (let fno = totalFloors; fno > 0; fno--) {
    const currfloor = document.createElement("section");
    currfloor.className = "floor";
    const floorId = `floorValue-${fno}`;
    currfloor.id = floorId;
    currfloor.innerHTML = `
                <section class="floor-details">
                    <button class="lift-control up" id=${fno}>UP</button>
                    <p class="floor-number">Floor-${fno}</p> 
                    <button class="lift-control down" id=${fno}>DOWN</button>
                </section>
        `;
    currfloor
      .querySelector(".up")
      .addEventListener("click", (event) => handleLiftCall(event));
    currfloor
      .querySelector(".down")
      .addEventListener("click", (event) => handleLiftCall(event));

    floorContainer.appendChild(currfloor);
    floorLiftMap.set(floorId, null);
  }
  const groundFloor = document.createElement("section");
  groundFloor.className = "floor";
  groundFloor.id = `floor-0`;
  groundFloor.innerHTML = `
            <section class="floor-details">
                <button class="lift-control up" id="0" >UP</button>
                <p class="floor-number" >Floor-0</p> 
            </section>
    `;
  groundFloor
    .querySelector(".up")
    .addEventListener("click", (event) => handleLiftCall(event));
  floorContainer.appendChild(groundFloor);
  floorLiftMap.set("floor-0", null);

  floorContainer.style.visibility = "visible";
  floorContainer.style.border = `2px solid #007bff`;
}

function displyLifts(totalLifts) {
  const groundFloor = document.querySelector("#floor-container>#floor-0");
  for (let liftNumber = 1; liftNumber <= totalLifts; liftNumber++) {
    const currentLift = document.createElement("section");
    currentLift.className = "lift";
    currentLift.id = `lift-${liftNumber}`;
    currentLift.innerHTML = `
                <section class="door left-door"></section>
                <section class="door right-door"></section>
            `;
    liftsAvialable.set(`lift-${liftNumber}`, true);
    liftAt.set(`lift-${liftNumber}`, 0);
    groundFloor.appendChild(currentLift);
  }
}

function handleLiftCall(event) {
  const calledfloor = event.target;
  const floorId = calledfloor.id;

  if (floorLiftMap.get(floorId) != null) {
    const mappedLiftId = floorLiftMap.get(floorId);
    if (liftsAvialable.get(mappedLiftId)) {
      liftsAvialable.set(mappedLiftId, false);
      openAndCloseDoors(floorId, mappedLiftId);
    }
    return;
  }

  for (let liftNumber = 1; liftNumber <= liftsValue; liftNumber++) {
    const liftId = `lift-${liftNumber}`;
    if (liftsAvialable.get(liftId)) {
      moveLift(floorId, liftId);
      return;
    }
  }

  pendingCalls.push(floorId);
}

function moveLift(floorId, liftId) {
  if (floorLiftMap.get(floorId) != null) {
    const mappedLiftId = floorLiftMap.get(floorId);
    if (liftsAvialable.get(mappedLiftId)) {
      liftsAvialable.set(mappedLiftId, false);
      openAndCloseDoors(floorId, mappedLiftId);
    }
    return;
  }

  liftsAvialable.set(liftId, false);
  floorLiftMap.set(floorId, liftId);

  floorLiftMap.forEach((value, key) => {
    if (key !== floorId && value === liftId) {
      floorLiftMap.set(key, null);
    }
  });

  const floor = document.getElementById(floorId);
  const lift = document.getElementById(`${liftId}`);
  const arr = floorId.split("-");
  const floorNumber = parseInt(arr[arr.length - 1]);
  const prevFloor = liftAt.get(liftId);
  const diff = Math.abs(prevFloor - floorNumber);
  const transitionDuration = diff * 2;
  lift.style.transform = `translateY(-${floorNumber * floorHeight}px)`;
  lift.style.transition = `all ${transitionDuration}s`;
  console.log(lift);
  setTimeout(() => {
    openAndCloseDoors(floorId, liftId);
  }, transitionDuration * 1000);

  liftAt.set(liftId, floorNumber);
}

function openAndCloseDoors(floorId, liftId) {
  const lift = document.querySelector(`#${liftId}`);
  const leftDoor = lift.querySelector(".left-door");
  const rightDoor = lift.querySelector(".right-door");
  leftDoor.classList.add("left-move");
  rightDoor.classList.add("right-move");
  setTimeout(() => {
    leftDoor.classList.remove("left-move");
    rightDoor.classList.remove("right-move");

    setTimeout(() => {
      liftsAvialable.set(liftId, true);
      if (pendingCalls.length > 0) {
        const floorIdFromRemainingCalls = pendingCalls[0];
        pendingCalls.shift();
        moveLift(floorIdFromRemainingCalls, liftId);
      }
    }, 2500);
  }, 2500);
}
