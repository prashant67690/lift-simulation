const floorHeight = 202;

let liftsValue, floorValue;
let btnClicked;

const floorUpLiftCount = new Map();
const floorDownLiftCount = new Map();
const liftsAvialable = new Map();
const liftAt = new Map();
const liftPositions = new Map();

const pendingCalls = [];

document.querySelector("#btn").addEventListener("click", (event) => {
  event.preventDefault();
  const floorInput = document.querySelector("#floor");
  const liftInput = document.querySelector("#lift");

  floorValue = parseInt(floorInput.value);
  liftsValue = parseInt(liftInput.value);

  if (Number.isNaN(floorValue) || Number.isNaN(liftsValue)) {
    alert("Invalid input! Please Enter A Number");
    return;
  }

  if (floorValue <= 0 || liftsValue <= 0) {
    alert("Invalid input! values Cannot Be Negative or zero.");
    return;
  }

  const inputBox = document.querySelector("#input-box");
  inputBox.style.display = "none";
  const heading = document.querySelector("#heading");
  const backButton = document.createElement("button");
  backButton.innerText = "Go Back To The Home Page";
  backButton.classList.add("bttn");
  backButton.addEventListener("click", (e) => {
    e.preventDefault();
    location.reload();
  });
  backButton.style = "margin:4rem";
  heading.appendChild(backButton);
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

    floorUpLiftCount.set(fno.toString(), null);
    floorDownLiftCount.set(fno.toString(), null);
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

  floorUpLiftCount.set(0, null);
  const topDiv = document.getElementById(totalFloors);
  topDiv.style.visibility = "hidden";
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
    liftPositions.set(liftNumber, 0);
    groundFloor.appendChild(currentLift);
  }

  const floorContainer = document.querySelector("#floor-container");
  const widthcal = totalLifts * 110;
  floorContainer.style.width = totalLifts <= 10 ? "100%" : `${widthcal}px`;
}

function handleLiftCall(event) {
  let buttonType;
  const calledfloor = event.target;
  btnClicked = event.target;
  const floorId = calledfloor.id;
  // calledfloor.disabled = true;
  console.log(floorUpLiftCount);
  console.log(floorDownLiftCount);
  if (calledfloor.classList[1] == "up") {
    buttonType = "up";
    if (floorUpLiftCount.get(floorId) != null) {
      const mappedLiftId = floorUpLiftCount.get(floorId);
      if (liftsAvialable.get(mappedLiftId)) {
        liftsAvialable.set(mappedLiftId, false);
        openAndCloseDoors(floorId, mappedLiftId);
      }
      return;
    }
  } else {
    buttonType = "down";
    if (floorDownLiftCount.get(floorId) != null) {
      const mappedLiftId = floorDownLiftCount.get(floorId);
      if (liftsAvialable.get(mappedLiftId)) {
        liftsAvialable.set(mappedLiftId, false);
        openAndCloseDoors(floorId, mappedLiftId);
      }
      return;
    }
  }

  let closestLiftId = null;
  let closestDistance = Infinity;

  for (let liftNumber = 1; liftNumber <= liftsValue; liftNumber++) {
    const liftId = `lift-${liftNumber}`;
    if (liftsAvialable.get(liftId)) {
      const liftFloorNumber = liftPositions.get(
        parseInt(liftId.split("-")[1], 10)
      );
      const distance = Math.abs(liftFloorNumber - floorId);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLiftId = liftId;
      }
    }
  }

  if (closestLiftId !== null) {
    moveLift(floorId, closestLiftId, buttonType);
    // console.log(floorUpLiftCount);
    // console.log(floorDownLiftCount);
  } else {
    pendingCalls.push(floorId);
  }
}

function moveLift(floorId, liftId, buttonType) {
  liftsAvialable.set(liftId, false);

  if (buttonType === "up") {
    floorUpLiftCount.set(floorId, liftId);
    // console.log(floorUpLiftCount);
  } else {
    floorDownLiftCount.set(floorId, liftId);
    // console.log(floorDownLiftCount);
  }
  floorUpLiftCount.forEach((value, key) => {
    if (key !== floorId && value === liftId) {
      floorUpLiftCount.set(key, null);
    }
  });
  floorDownLiftCount.forEach((value, key) => {
    if (key !== floorId && value === liftId) {
      floorDownLiftCount.set(key, null);
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
  lift.style.transition = `all linear ${transitionDuration}s`;

  setTimeout(() => {
    openAndCloseDoors(floorId, liftId);
  }, transitionDuration * 1000);
  const LiftNo = parseInt(liftId.split("-")[1], 10);
  liftAt.set(liftId, floorNumber);
  liftPositions.set(LiftNo, floorNumber);
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
    // setTimeout(() => {
    //   btnClicked.disabled = false;
    // }, 2000);
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
