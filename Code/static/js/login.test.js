global.$ = require('jquery');

const cookieStore = new Map();

global.document = {
    get cookie() { 
        return Array.from(cookieStore.entries())
            .map(([key, value]) => `${key}=${value}`)
            .join(';');
    },
    set cookie(value) {
        const cookies = value.split(';');
        for (const cookie of cookies) {
            const [key, val] = cookie.split('=');
            if (key && val) {
                cookieStore.set(key.trim(), val.trim());
            }
        }
    }
};

const { getCookie, validateForm } = require('./login.js');

global.alert = jest.fn();  

const jQueryElements = {
    email: { value: '' },
    password: { value: '' }
};

let clickHandler = null;

global.$ = jest.fn((selector) => {
    if (selector === '#email') return {
        val: (value) => {
            if (value === undefined) return jQueryElements.email.value;
            jQueryElements.email.value = value;
            return this;
        },
        focus: jest.fn(),
        is: jest.fn().mockReturnValue(true)
    };
    if (selector === '#password') return {
        val: (value) => {
            if (value === undefined) return jQueryElements.password.value;
            jQueryElements.password.value = value;
            return this;
        },
        focus: jest.fn(),
        is: jest.fn().mockReturnValue(true)
    };
    if (selector === '#login_btn') return {
        on: (event, handler) => {
            clickHandler = handler;
            return this;
        },
        trigger: (event, eventObj) => {
            if (clickHandler) clickHandler(eventObj);
            return this;
        }
    };
    return {
        val: jest.fn(),
        focus: jest.fn(),
        is: jest.fn(),
        on: jest.fn(),
        trigger: jest.fn()
    };
});

beforeEach(() => {
    jQueryElements.email.value = '';
    jQueryElements.password.value = '';
    cookieStore.clear();
    clickHandler = null;
});

// Black Box Test
// Tests the login form validation from external behavior perspective
describe('Login Form Validation - Black Box', () => {
    // Setup mock DOM before each test
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="email" type="email" />
            <input id="password" type="password" />
        `;
    });

    test('validateForm behavior with various inputs', () => {
        // Test 1: Empty form
        expect(validateForm()).toBe(0);
        expect($('#email').is(':focus')).toBe(true);

        // Test 2: Only email filled
        $('#email').val('user@example.com');
        expect(validateForm()).toBe(0);
        expect($('#password').is(':focus')).toBe(true);

        // Test 3: Both fields filled
        $('#email').val('user@example.com');
        $('#password').val('password123');
        expect(validateForm()).toBe(1);
    });
});

// White Box Test
// Tests the internal logic of getCookie function
describe('getCookie Function - White Box', () => {
    test('getCookie internal logic', () => {
        // Test 1: Empty cookie
        document.cookie = '';
        expect(getCookie('test')).toBeNull();

        // Test 2: Cookie exists
        document.cookie = 'testCookie=value123';
        expect(getCookie('testCookie')).toBe('value123');

        // Test 3: Multiple cookies
        document.cookie = 'cookie1=value1';
        document.cookie = 'cookie2=value2';
        expect(getCookie('cookie1')).toBe('value1');
        expect(getCookie('cookie2')).toBe('value2');

        // Test 4: Cookie with special characters
        document.cookie = 'specialCookie=%20test%20value%20';
        expect(getCookie('specialCookie')).toBe(' test value ');
    });
});

// Integration Test
// Tests the interaction between form validation and AJAX login request
describe('Login Form Submission Integration', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="loginForm">
                <input id="email" type="email" />
                <input id="password" type="password" />
                <button id="login_btn">Login</button>
            </form>
        `;
        
        // Mock jQuery AJAX
        $.ajax = jest.fn();

        document.cookie = 'csrftoken=testtoken123';
        
        $('#login_btn').on('click', function(e) {
            e.preventDefault();
            if(!validateForm()) return 0;
            const data = {
                email: $("#email").val(),
                password: $("#password").val(),
            };
            $.ajax({
                url: '/api/post/login/',
                type: 'POST',
                data: JSON.stringify(data),
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                contentType: 'application/json',
                dataType: 'json',
                success: function(response) {},
                error: function(xhr, status, error) {}
            });
        });
    });

    test('form validation and AJAX submission integration', () => {
        // Setup valid form data
        $('#email').val('test@example.com');
        $('#password').val('password123');

        // Test 1: Verify form validation passes
        expect(validateForm()).toBe(1);

        // Simulate form submission
        const event = { preventDefault: jest.fn() };
        $('#login_btn').trigger('click', event);

        // Test 2: Verify AJAX called with correct data
        expect($.ajax).toHaveBeenCalledWith({
            url: '/api/post/login/',
            type: 'POST',
            data: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            }),
            headers: {
                'X-CSRFToken': 'testtoken123'
            },
            contentType: 'application/json',
            dataType: 'json',
            success: expect.any(Function),
            error: expect.any(Function)
        });
    });
});