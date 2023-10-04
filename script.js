var screenStack = [];
var selectedPlan = null;
var goalName = '';
var goalImage = null;
var goalAmount = 0;
var goalTargetDate = '';
var firstPayment = 0;
var cyclicalPayment = 0;
var investmentName = '';
var investmentAmount = 0;
var cyclicalPaymentB = 0;
var horizonB = '';
var investmentProfile = '';
var selectedFund = '';
var investmentImage = null;


let profiles = null;
let funds = null;

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    profiles = data.profiles;
    funds = data.funds;
    const initialMonths = 60;
    const goalAmount = 10000;
    const firstPayment = 1000;
    updateInvestmentPlans(initialMonths, goalAmount, firstPayment);
  });

function navigate(screenId, isBack = false) {
  var screens = document.querySelectorAll('.screen');
  screens.forEach(function(screen) {
    screen.classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
  if (screenId === 'path-selection-screen') {
    document.getElementById('back-arrow').classList.add('hidden');
  } else {
    document.getElementById('back-arrow').classList.remove('hidden');
  }
  if (!isBack) {
    screenStack.push(screenId);
  }
    if (screenId === 'path-a-screen-5') {
        updateSummaryScreen();
    } else if (screenId === 'path-b-screen-5') {
        updateSummaryScreenB();
    }
}

function updateSummaryScreen() {
  document.getElementById('summary-goal-name').innerText = goalName;
  document.getElementById('summary-goal-image').src = URL.createObjectURL(goalImage);
  document.getElementById('summary-goal-amount').innerText = goalAmount;
  document.getElementById('summary-goal-target-date').innerText = goalTargetDate;
  document.getElementById('summary-goal-plan-name').innerText = selectedPlan;
  document.getElementById('summary-first-payment').innerText = firstPayment;
  document.getElementById('summary-cyclical-payment').innerText = cyclicalPayment;
}

function updateSummaryScreenB() {
    // Assuming you have variables named investmentName, investmentAmount, cyclicalPaymentB, horizonB, investmentProfile, and selectedFund
    // Update these to reflect the actual names and locations of your variables
    document.getElementById('summary-investment-name').innerText = investmentName;
    document.getElementById('summary-investment-image').src = URL.createObjectURL(investmentImage);
    document.getElementById('summary-investment-amount').innerText = investmentAmount;
    document.getElementById('summary-cyclical-payment-b').innerText = cyclicalPaymentB;
    document.getElementById('summary-horizon-b').innerText = horizonB;
    document.getElementById('summary-investment-profile').innerText = investmentProfile;
    document.getElementById('summary-selected-fund').innerText = selectedFund;
}




function goBack() {
  if (screenStack.length > 1) {
    // Pop the current screen from the stack
    screenStack.pop();
    // Navigate to the previous screen
    navigate(screenStack.pop(), true);
  } else {
    // If the stack has only one screen, navigate to the path selection screen
    navigate('path-selection-screen', true);
  }
}

function updateGoalAmount(source) {
  var slider = document.getElementById('goal-amount-slider');
  var input = document.getElementById('goal-amount-input');
  if (source === 'slider') {
    input.value = slider.value;
  } else {
    slider.value = input.value;
  }
}

function initializePathAScreen2() {
  var goalAmount = parseInt(document.getElementById('goal-amount-input').value, 10);
  var initialPaymentAmount = Math.round(goalAmount * 0.10);
  var slider = document.getElementById('first-payment-amount-slider');
  var input = document.getElementById('first-payment-amount-input');

  slider.max = goalAmount;
  input.max = goalAmount;
  slider.value = initialPaymentAmount;
  input.value = initialPaymentAmount;
}

function initializePathAScreen3() {
  updateHorizonInfo();
}

function updateFirstPaymentAmount(source) {
  var slider = document.getElementById('first-payment-amount-slider');
  var input = document.getElementById('first-payment-amount-input');
  if (source === 'slider') {
    input.value = slider.value;
  } else {
    slider.value = input.value;
  }
}

function updateHorizonInfo() {
  var months = parseInt(document.getElementById('horizon-slider').value, 10);
  var years = Math.floor(months / 12);
  months %= 12;

  var targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + years * 12 + months);

  var horizonInfo = document.getElementById('horizon-info');
  var horizonText = years > 0 ? `${years} years${months > 0 ? ` ${months} months` : ''}` : `${months} months`;
  horizonInfo.innerHTML = `
        Target date: ${targetDate.toLocaleDateString()} <br> (${horizonText} from now)
    `;

  const goalAmount = parseInt(document.getElementById('goal-amount-input').value, 10);
  const firstPayment = parseInt(document.getElementById('first-payment-amount-input').value, 10);
  updateInvestmentPlans(years * 12 + months, goalAmount, firstPayment);
}


function updateInvestmentPlans(months, goalAmount, firstPayment) {
  if (!profiles || !funds) {
    console.error('Profiles or funds data is not loaded yet');
    return;
  }
  const horizonYears = months / 12;
  const plansContainer = document.getElementById('investment-plans-container');

  let plansToShow;
  if (horizonYears < 1) {
    plansToShow = profiles.filter(profile => profile.matchingFund === "Shield");
  } else if (horizonYears <= 2) {
    plansToShow = profiles.filter(profile => ["Shield", "Compass"].includes(profile.matchingFund));
  } else if (horizonYears <= 4) {
    plansToShow = profiles.filter(profile => ["Shield", "Compass", "Scales"].includes(profile.matchingFund));
  } else if (horizonYears <= 6) {
    plansToShow = profiles.filter(profile => ["Shield", "Scales", "Skyline"].includes(profile.matchingFund));
  } else {
    plansToShow = profiles.filter(profile => ["Shield", "Scales", "Rocket"].includes(profile.matchingFund));
  }

  plansContainer.innerHTML = '';  // Clear previous plans

  if (horizonYears < 1 && plansToShow.length === 1) {
    const singlePlanMessage = document.getElementById('single-plan-message');
    singlePlanMessage.innerText = "We offer only one investment plan for short horizons.";
  } else {
    const singlePlanMessage = document.getElementById('single-plan-message');
    singlePlanMessage.innerText = "";
  }


  for (let profile of plansToShow) {
    const matchingFund = funds.find(fund => fund.name === profile.matchingFund);

    // Create plan card
    const planCard = document.createElement('div');
    planCard.classList.add('plan-card');

    // Set the card content using profile and fund data
    planCard.innerHTML = `
            <h3>${profile.name}</h3>
            <span class="icon">${profile.icon.split(' ')[0]}</span>
                        <p>Cyclical Payment: $${calculatePayment(months, profile.name, goalAmount, firstPayment).toFixed(2)}</p>
            <p>You can achieve from $X to $Y amount</p>
                        <button type="button" class="btn btn-primary" onclick="selectPlan('${profile.name}'); navigate('path-a-screen-4')">Select Plan</button>
                        <hr>
            <p>${profile.description}</p>

            <br>
             <button type="button" class="btn btn-secondary" onclick="showPlanDetails('${profile.name}')">More Details</button>
        `;

    plansContainer.appendChild(planCard);

  }
}

function calculatePayment(months, planName, goalAmount, firstPayment) {
  if (months <= 0) return 0;  // Guard against division by zero
  return (goalAmount - firstPayment) / months;
}

function selectPlan(plan) {

  // Find the profile based on the plan argument and store the profile icon
  const profile = profiles.find(profile => profile.name === plan);
  selectedPlanIcon = profile ? profile.icon : null;

  selectedPlan = plan + ' ' + (selectedPlanIcon ? selectedPlanIcon.split(' ')[0] : '');


  // Get the necessary values for calculating the cyclical payment
  var months = parseInt(document.getElementById('horizon-slider').value, 10);
  var goalAmount = parseInt(document.getElementById('goal-amount-input').value, 10);
  var firstPayment = parseInt(document.getElementById('first-payment-amount-input').value, 10);

  // Calculate and store the cyclical payment
  cyclicalPayment = calculatePayment(months, plan, goalAmount, firstPayment).toFixed(2);

  // Store target date
  var years = Math.floor(months / 12);
  months %= 12;
  var targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + years * 12 + months);
  goalTargetDate = targetDate.toLocaleDateString();
}


function showPlanDetails(plan) {
  // Find the profile based on the plan argument
  const profile = profiles.find(profile => profile.name === plan);
  const matchingFund = funds.find(fund => fund.name === profile.matchingFund);

  // Get the index of the matching fund to find funds from lower risk profiles
  const matchingFundIndex = funds.findIndex(fund => fund.name === profile.matchingFund);
  const lowerRiskFunds = funds.slice(0, matchingFundIndex).map(fund => fund.name).join(', ');

  var modalContent = `
        <div class="modal-header">
            <h5 class="modal-title" id="planDetailsModalLabel">${profile.name} Investment Plan Details</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            ${profile.name} plan can invest in a combination of funds: ${matchingFund.name}${lowerRiskFunds ? ', ' + lowerRiskFunds : ''}
            <p>
            Your starting portfolio is going to be 100% ${matchingFund.name}.
            <br>
            The asset class allocation breakdown is:
            <ul>
                ${Object.entries(matchingFund.assetClassAllocation).map(([assetClass, allocation]) => `
                    <li>${assetClass}: ${allocation}</li>
                `).join('')}
            </ul>
            </p>
            <p>We will adjust risk automatically with passing time. The final allocation is always 100% Shield fund</p>
        </div>
    `;

  var modal = document.getElementById('plan-details-modal');
  modal.querySelector('.modal-content').innerHTML = modalContent;
  var myModal = new bootstrap.Modal(modal);
  myModal.show();
}

function updateGlobalVariables(screenId) {
  switch (screenId) {
    case 'path-a-screen-1':
      goalAmount = parseInt(document.getElementById('goal-amount-input').value, 10);
      break;
    case 'path-a-screen-2':
      firstPayment = parseInt(document.getElementById('first-payment-amount-input').value, 10);
      break;
    case 'path-a-screen-4':
      goalName = document.getElementById('goal-name-input').value;
      goalImage = document.getElementById('goal-image-input').files[0];
      break;
    // Cases for path-b screens:
    case 'path-b-screen-1':
      investmentAmount = parseInt(document.getElementById('input-b-1').value, 10);
      break;
    case 'path-b-screen-3':
      cyclicalPaymentB = parseInt(document.getElementById('input-b-3').value, 10);
      break;
    case 'path-b-screen-4':
      investmentName = document.getElementById('investment-name-input').value;
      investmentImage = document.getElementById('investment-image-input').files[0];
      break;
    default:
      console.error('Invalid screenId:', screenId);
  }
}


/// PATH B
function syncInputAndSliderB1(source) {
  var slider = document.getElementById('slider-b-1');
  var input = document.getElementById('input-b-1');
  if (source === 'slider') {
    input.value = slider.value;
  } else {
    slider.value = input.value;
  }
}

function syncInputAndSliderB3(source) {
  var slider = document.getElementById('slider-b-3');
  var input = document.getElementById('input-b-3');
  if (source === 'slider') {
    input.value = slider.value;
  } else {
    slider.value = input.value;
  }
}

function filterFundsByHorizon(funds, months) {
  return funds.filter(fund => fund.minInvestmentHorizonMonths <= months);
}

function findProfileByFundName(fundName) {
    // Traverse through the profiles array
    for (let i = 0; i < profiles.length; i++) {
        // Check if the matchingFund property matches the desired fund name
        if (profiles[i].matchingFund === fundName) {
            // If a match is found, return the profile object
            return profiles[i];
        }
    }
    // If no match is found, return null
    return null;
}

function displayFunds(fundsToShow) {
  const fundsContainer = document.getElementById('funds-container');
  
  fundsContainer.innerHTML = '';  // Clear previous funds
  for (let fund of fundsToShow) {
    // Create fund card
    const fundCard = document.createElement('div');
    const profile = findProfileByFundName(fund.name);
    
    fundCard.classList.add('plan-card');
    // Set the card content using fund data 
    fundCard.innerHTML = `
            <h3>${profile.name}</h3>
            <span class="icon">${profile.icon.split(' ')[0]}</span>
            <p>Fund name: ${fund.name}</h3>
            <p>Min Investment Horizon: ${fund.minInvestmentHorizon}</p>
                                    
            <button type="button" class="btn btn-primary" onclick="selectFund('${fund.name}'); navigate('path-b-screen-3')">Select Fund</button>   
            <hr>
            <p>${profile.description}</p>
            <button type="button" class="btn btn-secondary" onclick="showFundDetails('${fund.name}')">More Details</button>
        `;
    fundsContainer.appendChild(fundCard);
  }
}


function showFundDetails(fundName) {
  // Find the fund based on the fundName argument
  const fund = funds.find(fund => fund.name === fundName);

  var modalContent = `
        <div class="modal-header">
            <h5 class="modal-title" id="fundDetailsModalLabel">${fund.name} Fund Details</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
            <p>Range of Returns: ${fund.rangeOfReturns}</p>
            <p>Max Drawdown: ${fund.maxDrawdown}</p>
            The asset class allocation breakdown is:
            <ul>
                ${Object.entries(fund.assetClassAllocation).map(([assetClass, allocation]) => `
                    <li>${assetClass}: ${allocation}</li>
                `).join('')}
            </ul>
        </div>
    `;

  var modal = document.getElementById('fund-details-modal');
  modal.querySelector('.modal-content').innerHTML = modalContent;
  var myModal = new bootstrap.Modal(modal);
  myModal.show();
}

function initializePathBScreen2() {
  updateHorizonInfoB();
}

function updateHorizonInfoB() {
  var months = parseInt(document.getElementById('horizon-slider-b').value, 10);
  var years = Math.floor(months / 12);
  const filteredFunds = filterFundsByHorizon(funds, months);
  months %= 12;

  var targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + years * 12 + months);

  var horizonInfo = document.getElementById('horizon-infoB');
  var horizonText = years > 0 ? `${years} years${months > 0 ? ` ${months} months` : ''}` : `${months} months`;
  horizonInfo.innerHTML = `
        Investment horizon: ${targetDate.toLocaleDateString()} <br> (${horizonText} from now)
    `;

  console.log(filteredFunds)
  displayFunds(filteredFunds);
}

function selectFund(fund) {

  // Find the profile based on the plan argument and store the profile icon
  //const profile = profiles.find(profile => profile.name === plan);
  selectedFundIcon = fund ? fund.icon : null;
selectedFund = fund

  // Profile
investmentProfile = findProfileByFundName(fund)
investmentProfileIcon = investmentProfile ? investmentProfile.icon : null;
investmentProfile = investmentProfile.name + ' ' + (investmentProfileIcon ? investmentProfileIcon.split(' ')[0] : '');

  // Store target date
  var months = parseInt(document.getElementById('horizon-slider-b').value, 10);
  var years = Math.floor(months / 12);
  months %= 12;
  var targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + years * 12 + months);
  horizonB = targetDate.toLocaleDateString();
  
}