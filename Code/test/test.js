// black box testing 

const $ = require('jquery'); 

global.$ = $; // mock jquery globally as $

const {validatePlan} = require('../static/js/pricing'); 

'use strict';
// mock the alert globally so we can reset them before each test
global.alert = jest.fn();


jest.mock('../static/js/signup');

// clears alerts before each test
beforeEach(() => {
    jest.clearAllMocks(); 
  });

test('check all inputs are valid', () => {
    document.body.innerHTML = `
        <input name="firstname" id="firstname">
        <input name="lastname" id="lastname">
        <input type="email" id="email" name="email">
        <input type="password" id="password" name="password"> 
        <input type="checkbox" id="terms">
        <button class="signup-btn" type="submit" id="signup-submit"></button>
    `;

    require('../static/js/signup.js');

    const first = document.getElementById('firstname');
    const last = document.getElementById('lastname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const terms = document.getElementById('terms');
    const submit = document.getElementById('signup-submit');

    first.value = 'first';
    last.value = 'last';
    email.value = 'email@gmail.com';
    password.value = 'G00dP@ssword123';
    terms.checked = true;

    submit.click();

    expect(global.alert).not.toHaveBeenCalled();
});

test('check for empty inputs', () => {
    document.body.innerHTML = `
        <input name="firstname" id="firstname">
        <input name="lastname" id="lastname">
        <input type="email" id="email" name="email">
        <input type="password" id="password" name="password"> 
        <input type="checkbox" id="terms">
        <button class="signup-btn" type="submit" id="signup-submit"></button>
    `;

    const submit = document.getElementById('signup-submit');
    require('../static/js/signup.js');
    submit.click();
    expect(global.alert).toBe('fields missing!');;
});




// white box testing
// create a mock version of the dom containing 3 radio options
// the test aims to cover all branches, making sure all aspects of validatePlan are being tested
// function validatePlan() {
//     if (!$("input[name='uo']:checked").val()) {
//         alert("Please select a pricing plan!");
//         return 0;
//     }
//     return 1;
// }
describe('validatePlan', () => {
    beforeEach(() => {
        document.body.innerHTML = ` 
            <input type="radio" name="uo" value="0">
            <input type="radio" name="uo" value="1">
            <input type="radio" name="uo" value="2">
        `;
    });

    test('test should return 0 and an alert when no plan is selected', () => {
        jest.spyOn(window, 'alert').mockImplementation(() => {}); 
        expect(validatePlan()).toBe(0);
        expect(window.alert).toHaveBeenCalledTimes(1);
    });

    test('test should return 1 when a plan is selected, also deselects multiple choices', () => {
        $("input[name='uo'][value='0']").prop("checked", true);  
        $("input[name='uo'][value='1']").prop("checked", true);  
        $("input[name='uo'][value='2']").prop("checked", true);  
        expect($("input[name='uo']:checked").length).toBe(1);  // deselect an option
        expect(validatePlan()).toBe(1);  
    });

    test('test should only call alert once when no plan is selected', () => {
        jest.spyOn(window, 'alert').mockImplementation(() => {}); // mock version of an alert
        expect(validatePlan()).toBe(0);
        expect(window.alert).toHaveBeenCalledTimes(1);  
        expect(validatePlan()).toBe(0); // call the empty choice again to see if alert pops again, for some reason fails as 2 alerts lol
        expect(window.alert).toHaveBeenCalledTimes(1);  
    });
    
    test('test should keep the chosen value even if user switches plan', () => {
        $("input[name='uo'][value='0']").prop("checked", true);
        expect(validatePlan()).toBe(1);
        $("input[name='uo'][value='1']").prop("checked", true);
        expect(validatePlan()).toBe(1);
        $("input[name='uo'][value='2']").prop("checked", true);
        expect(validatePlan()).toBe(1);  
    });

    test('test should handle no radio buttons in the DOM', () => {
        document.body.innerHTML = ''; 
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        expect(validatePlan()).toBe(0);
        expect(window.alert).toHaveBeenCalledWith('Please select a pricing plan!'); 
    });

    test('test should ignore disabled radio buttons', () => {
        // set one of the choices to a disabled check box
        document.body.innerHTML = `
            <input type="radio" name="uo" value="0" disabled> 
            <input type="radio" name="uo" value="1">
        `;
        // select the disabled option
        $("input[name='uo'][value='0']").prop("checked", true);
    
        expect(validatePlan()).toBe(0); 
        expect(window.alert).toHaveBeenCalledWith('Please select a pricing plan!');
    });

    test('test should ignore wild cards', () => {
        // set one of the choices to a disabled check box
        document.body.innerHTML = `
            <input type="radio" name="uo" value="woah_im_not_1-2-3"> 
            <input type="radio" name="uo" value="1">
        `;
        // select the disabled option
        $("input[name='uo'][value='woah_im_not_1-2-3']").prop("checked", true);
    
        expect(validatePlan()).toBe(0); 
        expect(window.alert).toHaveBeenCalledWith('Please select a pricing plan!');
    });
});


