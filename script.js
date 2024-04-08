// Function to create select element with options
function createSelect(options, selectedValue = null) {
    const select = document.createElement('select');
    options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      if (option === selectedValue) optionElement.selected = true;
      select.appendChild(optionElement);
    });
    return select;
  }
  
  // Function to handle conversion
function handleConversion() {
    const conversionType = document.getElementById('conversionType').value;
    const numStates = parseInt(document.getElementById('numStates').value);
    const transitionInputs = document.getElementById('transitionInputs');
    transitionInputs.innerHTML = '';

    const stateOptions = [];
    for (let i = 0; i < numStates; i++) {
        stateOptions.push(String.fromCharCode(65 + i)); // Convert ASCII code to character (A, B, C,...)
    }

    for (let i = 0; i < numStates; i++) {
        const stateRow = document.createElement('div');
        stateRow.classList.add('state-input-row', 'neon-text');

        const fromStateSelect = createSelect(stateOptions);
        fromStateSelect.classList.add('fromState');
        stateRow.appendChild(fromStateSelect);

        const symbolSelect = createSelect(['0', '1']);
        symbolSelect.classList.add('symbol');
        stateRow.appendChild(symbolSelect);

        const toStateSelect = createSelect(stateOptions);
        toStateSelect.classList.add('toState');
        stateRow.appendChild(toStateSelect);

        if (conversionType === 'mealyToMoore' || conversionType === 'mooreToMealy') { // Added condition for Moore to Mealy conversion
            const outputSelect = createSelect(['0', '1'], '0');
            outputSelect.classList.add('output');
            stateRow.appendChild(outputSelect);
        }

        transitionInputs.appendChild(stateRow);
    }
}

  
  // Attach event listener for number of states change
  document.getElementById('numStates').addEventListener('change', handleConversion);
  
  // Initial setup
  handleConversion();
  
  // Attach event listener for conversion button click
  document.getElementById('convertButton').addEventListener('click', function () {
    const conversionType = document.getElementById('conversionType').value;
    const transitions = [];
    const stateRows = document.querySelectorAll('.state-input-row');
  
    if (stateRows.length < 2) {
      alert('Please add at least two states.');
      return;
    }
  
    stateRows.forEach((stateRow) => {
      const selects = stateRow.querySelectorAll('select');
      const fromState = selects[0].value;
      const symbol = selects[1].value;
      const toState = selects[2].value;
  
      if (!fromState || !symbol || !toState) {
        alert('Please fill in all the fields.');
        return;
      }
  
      let output = '0';
      if (conversionType === 'mealyToMoore') {
        output = selects[3].value;
      }
  
      transitions.push({ fromState, symbol, toState, output });
    });
  
    let machine = {};
    if (conversionType === 'mealyToMoore') {
      machine = mealyToMoore(transitions);
    } else {
      machine = mooreToMealy(transitions);
    }
  
    // Output the machine object
    document.getElementById('outputContainer').innerHTML = formatMachineOutput(machine);
  });
  
  // Function to convert Mealy to Moore
  function mealyToMoore(transitions) {
    const mooreMachine = { states: {}, initialState: transitions[0].fromState };
  
    for (const transition of transitions) {
      if (!mooreMachine.states[transition.fromState]) {
        mooreMachine.states[transition.fromState] = {
          transitions: {},
          outputs: {},
        };
      }
  
      if (!mooreMachine.states[transition.fromState].transitions) {
        mooreMachine.states[transition.fromState].transitions = {};
      }
  
      mooreMachine.states[transition.fromState].transitions[transition.symbol] = transition.toState;
  
      if (!mooreMachine.states[transition.toState]) {
        mooreMachine.states[transition.toState] = {
          transitions: {},
          outputs: {},
        };
      }
  
      if (!mooreMachine.states[transition.toState].outputs[transition.symbol]) {
        mooreMachine.states[transition.toState].outputs[transition.symbol] = transition.output;
      }
    }
  
    for (const state in mooreMachine.states) {
      const outputs = mooreMachine.states[state].outputs;
      let commonOutput = null;
  
      for (const outputSymbol in outputs) {
        if (commonOutput === null) {
          commonOutput = outputs[outputSymbol];
        } else if (commonOutput !== outputs[outputSymbol]) {
          commonOutput = 'X';
          break;
        }
      }
  
      mooreMachine.states[state].output = commonOutput;
    }
  
    return mooreMachine;
  }
  
  // Function to convert Moore to Mealy
  function mooreToMealy(mooreMachine) {
    const mealyMachine = { states: {}, initialState: mooreMachine.initialState };
  
    for (const state in mooreMachine.states) {
      if (!mealyMachine.states[state]) {
        mealyMachine.states[state] = { transitions: {} };
      }
  
      if (!mealyMachine.states[state].transitions) {
        mealyMachine.states[state].transitions = {};
      }
  
      mealyMachine.states[state].transitions = { ...mooreMachine.states[state].transitions };
  
      mealyMachine.states[state].output = mooreMachine.states[state].output;
    }
  
    return mealyMachine;
  }
  
  // Function to format the machine object for output
  function formatMachineOutput(machine) {
    let output = '<h2>Converted Machine</h2>';
    output += '<table class="table table-striped table-bordered neon-table">';
    output += '<thead><tr><th>State</th><th>Transitions</th>';
    if (machine.states[machine.initialState].output !== undefined) {
      output += '<th>Output</th>';
    }
    output += '</tr></thead>';
    output += '<tbody>';
  
    for (const state in machine.states) {
      output += `<tr><td>${state}</td><td>${formatTransitions(machine.states[state].transitions)}</td>`;
      if (machine.states[state].output !== undefined) {
        output += `<td>${machine.states[state].output}</td>`;
      }
      output += '</tr>';
    }
  
    output += '</tbody></table>';
    return output;
  }
  
  // Function to format transitions of a state
  function formatTransitions(transitions) {
    let formattedTransitions = '';
    for (const symbol in transitions) {
      formattedTransitions += `(${symbol} -> ${transitions[symbol]}) `;
    }
    return formattedTransitions;
  }
